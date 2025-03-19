import { Card, CardContent } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { HabitWithFrequency } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "@/lib/date-utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { EditIcon, TrashIcon, CheckIcon, CheckCheckIcon } from "lucide-react";

interface HabitCardProps {
  habit: HabitWithFrequency & { 
    streak?: number; 
    completionRate?: number;
    completions?: { date: string }[]; // Ensure completions is an array of objects with a date
  };
}



export default function HabitCard({ habit }: HabitCardProps) {
  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  const { toast } = useToast();
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Form data for edit
  const [formData, setFormData] = useState({
    name: habit.name,
    description: habit.description || "",
    category: habit.category,
    color: habit.color,
    frequency: habit.frequency,
  });
  
  // Check if habit is completed for today
  const isCompletedToday = (habit.completions ?? []).some((c) => c.date === todayStr);



  // Toggle completion mutation
  const toggleCompletionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest<{ streak: number; completionRate: number; completions: { date: string }[] }>(
        "POST",
        `/api/habits/${habit.id}/toggle`,

        
        {
          
          date: todayStr,
          completed: !isCompletedToday,
        }
      );
    },
    
    
    
    onSuccess: async (updatedHabit) => {
      console.log("✅ Mutation successful! API Response:", updatedHabit);
    
      if (!updatedHabit.completions) {
        console.warn("⚠️ Warning: `completions` missing from API response. Setting to empty array.");
        updatedHabit.completions = []; // Prevents `undefined` errors
      }
      if (!updatedHabit.completions) {
        console.warn("⚠️ `completions` missing! Fetching fresh data...");
        await queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      }
      
    
    
      await queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    
      toast({
        title: updatedHabit.completions.some((c) => c.date === todayStr)
          ? "Habit marked as completed"
          : "Habit marked as incomplete",
          
        duration: 2000,
      });
      
    },
  
    onError: (error) => {
      console.error("Mutation failed:", error); // Log the full error
      toast({
        title: "Error",
        description: error.message || "Failed to update habit status.",
        variant: "destructive",
      });
    },
    
    
  });
  
  // Update habit mutation
  const updateHabitMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PUT", `/api/habits/${habit.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      setShowEditModal(false);
      toast({
        title: "Habit updated",
        description: "Your habit has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update habit.",
        variant: "destructive",
      });
    },
  });
  
  // Delete habit mutation
  const deleteHabitMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/habits/${habit.id}`, null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setShowDeleteModal(false);
      toast({
        title: "Habit deleted",
        description: "Your habit has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete habit.",
        variant: "destructive",
      });
    },
  });

  const handleToggleCompletion = () => {
    console.log("Mutation triggered!"); // Debugging log
    toggleCompletionMutation.mutate();
  };
  
  const handleUpdateHabit = () => {
    updateHabitMutation.mutate(formData);
  };
  
  const handleDeleteHabit = () => {
    deleteHabitMutation.mutate();
  };

  // Calculate mock values for completion & streak (these would come from the backend in a real app)
  const streak = habit.streak ?? 0; // Use real streak or default to 0
  const completionRate = habit.completionRate ?? 0; // Use real completion rate or default to 0%
  

  
  // Get category display name with proper capitalization
  const getCategoryDisplay = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  // Get badge color classes based on category
  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "health":
        return "bg-green-100 text-green-700";
      case "productivity":
        return "bg-blue-100 text-blue-700";
      case "wellness":
        return "bg-purple-100 text-purple-700";
      case "learning":
        return "bg-indigo-100 text-indigo-700";
      case "financial":
        return "bg-emerald-100 text-emerald-700";
      case "social":
        return "bg-rose-100 text-rose-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <>
      <Card className="border-gray-100 transition-transform duration-200 hover:-translate-y-1">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center">
              <span className={`w-3 h-3 rounded-full bg-${habit.color} mr-2`}></span>
              <h3 className="font-medium">{habit.name}</h3>
            </div>
            <div className="flex space-x-1">
              <button 
                className="p-1 text-gray-400 hover:text-gray-500"
                onClick={() => setShowEditModal(true)}
              >
                <EditIcon className="h-4 w-4" />
              </button>
              <button 
                className="p-1 text-gray-400 hover:text-danger"
                onClick={() => setShowDeleteModal(true)}
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-3">{habit.description}</p>

          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">Streak: {streak} days</span>
            <span className="text-xs font-medium text-gray-500">Completion: {completionRate}%</span>
          </div>

          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`bg-${habit.color} h-full rounded-full transition-all duration-300`} 
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>

          <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getCategoryBadgeClass(habit.category)}`}>
              {getCategoryDisplay(habit.category)}
            </span>
            <button 
              className={`text-xs font-medium flex items-center gap-1 ${isCompletedToday ? 'text-success' : 'text-primary'}`}
              onClick={handleToggleCompletion}
              disabled={toggleCompletionMutation.isPending}
            >
              {isCompletedToday ? (
                <>
                  <CheckIcon className="h-3.5 w-3.5" /> Done Today
                </>
              ) : (
                <>
                  <CheckCheckIcon className="h-3.5 w-3.5" /> Mark Today
                </>
              )}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Habit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Habit</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Habit Name</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Morning Yoga"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="e.g., Practice yoga for 20 minutes after waking up"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={value => setFormData({...formData, category: value as any})}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="productivity">Productivity</SelectItem>
                  <SelectItem value="wellness">Wellness</SelectItem>
                  <SelectItem value="learning">Learning</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Frequency</Label>
              <div className="flex flex-wrap gap-2">
                {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`day-${day}`} 
                      checked={formData.frequency.includes(day as any)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({
                            ...formData, 
                            frequency: [...formData.frequency, day as any]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            frequency: formData.frequency.filter(d => d !== day)
                          });
                        }
                      }}
                    />
                    <Label htmlFor={`day-${day}`} className="text-sm">
                      {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-3">
                {["success", "primary", "secondary", "warning", "danger"].map((color) => (
                  <label key={color} className="cursor-pointer">
                    <input 
                      type="radio" 
                      name="color" 
                      className="sr-only peer" 
                      checked={formData.color === color}
                      onChange={() => setFormData({...formData, color: color as any})}
                    />
                    <div 
                      className={`w-6 h-6 rounded-full bg-${color} peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-${color}`}
                    ></div>
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateHabit}
              disabled={updateHabitMutation.isPending}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Habit</DialogTitle>
          </DialogHeader>
          
          <div className="py-3">
            <p>Are you sure you want to delete <strong>{habit.name}</strong>? This action cannot be undone and all tracking data for this habit will be lost.</p>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteHabit}
              disabled={deleteHabitMutation.isPending}
            >
              Delete Habit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
