import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddHabitModalProps {
  onClose: () => void;
}

export default function AddHabitModal({ onClose }: AddHabitModalProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(true);
  
  const [habitData, setHabitData] = useState({
    name: "",
    description: "",
    category: "",
    color: "",
    frequency: [] as string[],
  });

  const createHabitMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/habits", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      
      closeModal();
      toast({
        title: "Habit created",
        description: "Your new habit has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create habit. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateHabit = () => {
    // Validate form
    if (!habitData.name) {
      toast({
        title: "Missing information",
        description: "Please provide a name for your habit.",
        variant: "destructive",
      });
      return;
    }
    
    if (!habitData.category) {
      toast({
        title: "Missing information",
        description: "Please select a category for your habit.",
        variant: "destructive",
      });
      return;
    }
    
    if (!habitData.color) {
      toast({
        title: "Missing information",
        description: "Please select a color for your habit.",
        variant: "destructive",
      });
      return;
    }
    
    if (habitData.frequency.length === 0) {
      toast({
        title: "Missing information",
        description: "Please select at least one day for your habit.",
        variant: "destructive",
      });
      return;
    }
    
    createHabitMutation.mutate(habitData);
  };

  const closeModal = () => {
    setOpen(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Habit</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="habitName">Habit Name</Label>
            <Input 
              id="habitName" 
              value={habitData.name}
              onChange={(e) => setHabitData({ ...habitData, name: e.target.value })}
              placeholder="e.g., Morning Yoga"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="habitDescription">Description</Label>
            <Textarea 
              id="habitDescription" 
              value={habitData.description}
              onChange={(e) => setHabitData({ ...habitData, description: e.target.value })}
              placeholder="e.g., Practice yoga for 20 minutes after waking up"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="habitCategory">Category</Label>
            <Select 
              value={habitData.category}
              onValueChange={(value) => setHabitData({ ...habitData, category: value })}
            >
              <SelectTrigger id="habitCategory">
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
              {[
                { id: "monday", label: "Mon" },
                { id: "tuesday", label: "Tue" },
                { id: "wednesday", label: "Wed" },
                { id: "thursday", label: "Thu" },
                { id: "friday", label: "Fri" },
                { id: "saturday", label: "Sat" },
                { id: "sunday", label: "Sun" },
              ].map((day) => (
                <div key={day.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={day.id} 
                    checked={habitData.frequency.includes(day.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setHabitData({
                          ...habitData,
                          frequency: [...habitData.frequency, day.id],
                        });
                      } else {
                        setHabitData({
                          ...habitData,
                          frequency: habitData.frequency.filter((d) => d !== day.id),
                        });
                      }
                    }}
                  />
                  <Label htmlFor={day.id} className="text-sm">{day.label}</Label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-3">
              {[
                { id: "success", label: "Green" },
                { id: "primary", label: "Blue" },
                { id: "secondary", label: "Purple" },
                { id: "warning", label: "Yellow" },
                { id: "danger", label: "Red" },
              ].map((color) => (
                <label key={color.id} className="cursor-pointer">
                  <input 
                    type="radio" 
                    name="habitColor" 
                    className="sr-only peer" 
                    checked={habitData.color === color.id}
                    onChange={() => setHabitData({ ...habitData, color: color.id })}
                  />
                  <div 
                    className={`w-6 h-6 rounded-full bg-${color.id} peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-${color.id}`}
                  ></div>
                </label>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateHabit}
            disabled={createHabitMutation.isPending}
          >
            Create Habit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
