import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { HabitWithFrequency } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { addDays, format } from "@/lib/date-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckIcon, XIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

// Helper function to get the color value based on color name
function getColorValue(colorName: string): string {
  switch(colorName) {
    case 'green': return '#10b981';
    case 'blue': return '#3b82f6';
    case 'red': return '#ef4444';
    case 'yellow': return '#f59e0b';
    case 'purple': return '#8b5cf6';
    case 'pink': return '#ec4899';
    case 'indigo': return '#6366f1';
    default: return '#6b7280';
  }
}

interface WeeklyTrackerProps {
  habits: HabitWithFrequency[];
  isLoading: boolean;
  startDate: Date;
  weekLabel: string;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}

export default function WeeklyTracker({
  habits,
  isLoading,
  startDate,
  weekLabel,
  onPreviousWeek,
  onNextWeek,
}: WeeklyTrackerProps) {
  const { toast } = useToast();
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  // Generate the dates for the current week
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
  
  // Fetch habit logs for the current week
  const { data: habitLogsData } = useQuery({
    queryKey: [
      `/api/habit-logs/range`,
      { start: format(startDate, 'yyyy-MM-dd'), end: format(addDays(startDate, 6), 'yyyy-MM-dd') }
    ],
  });
  
  // Create a map of habit logs for quick lookup
  const habitLogs: Record<number, Record<string, { completed: boolean }>> = {};
  
  // Organize logs by habit ID and date for easy lookup
  if (habitLogsData && Array.isArray(habitLogsData)) {
    habitLogsData.forEach((log: any) => {
      if (!habitLogs[log.habitId]) {
        habitLogs[log.habitId] = {};
      }
      
      const dateStr = format(new Date(log.date), 'yyyy-MM-dd');
      habitLogs[log.habitId][dateStr] = { completed: log.completed };
    });
  }
  
  // Mutation for toggling habit completion
  const toggleMutation = useMutation({
    mutationFn: async ({ habitId, date, completed }: { habitId: number; date: string; completed: boolean }) => {
      return apiRequest("POST", `/api/habits/${habitId}/toggle`, { date, completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update habit status.",
        variant: "destructive",
      });
    },
  });

  const handleToggleHabit = (habitId: number, date: Date, currentStatus: boolean | undefined) => {
    // Toggle the completion status
    const newStatus = !currentStatus;
    
    toggleMutation.mutate({
      habitId,
      date: date.toISOString().split("T")[0],
      completed: newStatus,
    });
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Weekly Tracker</h2>
        <div className="flex space-x-2 items-center">
          <Button variant="ghost" size="icon" onClick={onPreviousWeek}>
            <ChevronLeftIcon className="h-5 w-5" />
          </Button>
          <span className="flex items-center font-medium">{weekLabel}</span>
          <Button variant="ghost" size="icon" onClick={onNextWeek}>
            <ChevronRightIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Card className="border-gray-100 overflow-x-auto">
        <CardContent className="p-0">
          <div className="min-w-[768px]">
            <div className="grid grid-cols-8 border-b border-gray-100">
              <div className="p-4 font-medium text-gray-500">Habit</div>
              {weekdays.map((day, idx) => (
                <div key={day} className="p-4 font-medium text-center text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            {isLoading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="grid grid-cols-8 border-b border-gray-100">
                  <div className="p-4">
                    <Skeleton className="h-6 w-24" />
                  </div>
                  {Array.from({ length: 7 }).map((_, dayIdx) => (
                    <div key={dayIdx} className="p-4 flex justify-center items-center">
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  ))}
                </div>
              ))
            ) : habits.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No habits found. Add your first habit to start tracking!
              </div>
            ) : (
              habits.map((habit) => (
                <div
                  key={habit.id}
                  className="grid grid-cols-8 border-b border-gray-100 hover:bg-gray-50"
                >
                  <div className="p-4 flex items-center">
                    <span 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: getColorValue(habit.color.toString()) }}
                    ></span>
                    <span className="font-medium">{habit.name}</span>
                  </div>
                  
                  {weekDates.map((date, dayIdx) => {
                    const dateStr = format(date, "yyyy-MM-dd");
                    const isToday = format(new Date(), "yyyy-MM-dd") === dateStr;
                    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                    
                    // Check if we should show the completion button for this day
                    // (based on the habit's frequency)
                    const weekdayStr = format(date, "EEEE").toLowerCase();
                    const shouldShowForDay = habit.frequency.includes(weekdayStr as any);
                    
                    // Find if there's a log for this habit on this date
                    const log = habitLogs?.[habit.id]?.[dateStr];
                    const isCompleted = log?.completed;
                    
                    return (
                      <div key={dayIdx} className="p-4 flex justify-center items-center">
                        {shouldShowForDay ? (
                          <button
                            className={`w-8 h-8 rounded-full 
                              ${isCompleted 
                                ? `bg-success/10 text-success` 
                                : isToday || isPast
                                  ? "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                  : "bg-gray-100 text-gray-400"
                              } 
                              flex items-center justify-center`}
                            onClick={() => handleToggleHabit(habit.id, date, isCompleted)}
                            disabled={toggleMutation.isPending}
                          >
                            {isCompleted ? <CheckIcon className="h-4 w-4" /> : <XIcon className="h-4 w-4" />}
                          </button>
                        ) : (
                          <span className="w-8 h-8 flex items-center justify-center text-gray-300">-</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
