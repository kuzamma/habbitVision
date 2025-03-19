import { HabitWithFrequency, HabitLog } from "@shared/schema";
import { getWeekday } from "./date-utils";

// Check if a habit should be tracked on a specific day
export function shouldTrackHabitOnDay(habit: HabitWithFrequency, date: Date): boolean {
  const weekday = getWeekday(date);
  return habit.frequency.includes(weekday as any);
}

// Calculate streak for a habit based on logs
export function calculateStreak(habit: HabitWithFrequency, logs: HabitLog[]): number {
  if (!logs || logs.length === 0) return 0;
  
  // Sort logs by date, most recent first
  const sortedLogs = [...logs].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime();
  });
  
  let streak = 0;
  let currentDate = new Date();
  
  // Start from yesterday (since today might not be completed yet)
  currentDate.setDate(currentDate.getDate() - 1);
  
  while (true) {
    // Skip days when the habit doesn't need to be done
    if (!shouldTrackHabitOnDay(habit, currentDate)) {
      currentDate.setDate(currentDate.getDate() - 1);
      continue;
    }
    
    // Find log for the current date
    const dateStr = currentDate.toISOString().split('T')[0];
    const log = sortedLogs.find(l => {
      const logDateStr = new Date(l.date).toISOString().split('T')[0];
      return logDateStr === dateStr && l.habitId === habit.id;
    });
    
    // If no log found or habit was not completed, break the streak
    if (!log || !log.completed) break;
    
    // Increment streak and move to previous day
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }
  
  return streak;
}

// Calculate completion rate for a habit
export function calculateCompletionRate(habit: HabitWithFrequency, logs: HabitLog[]): number {
  if (!logs || logs.length === 0) return 0;
  
  const filteredLogs = logs.filter(log => log.habitId === habit.id);
  const completedLogs = filteredLogs.filter(log => log.completed);
  
  return Math.round((completedLogs.length / filteredLogs.length) * 100);
}

// Get color class for a habit category
export function getCategoryColorClass(category: string): string {
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
      return "bg-pink-100 text-pink-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

// Format habit frequency as a human-readable string
export function formatFrequency(frequency: string[]): string {
  if (frequency.length === 7) return "Every day";
  if (frequency.length === 0) return "Never";
  
  if (
    frequency.includes("monday") &&
    frequency.includes("tuesday") &&
    frequency.includes("wednesday") &&
    frequency.includes("thursday") &&
    frequency.includes("friday") &&
    !frequency.includes("saturday") &&
    !frequency.includes("sunday")
  ) {
    return "Weekdays";
  }
  
  if (
    !frequency.includes("monday") &&
    !frequency.includes("tuesday") &&
    !frequency.includes("wednesday") &&
    !frequency.includes("thursday") &&
    !frequency.includes("friday") &&
    frequency.includes("saturday") &&
    frequency.includes("sunday")
  ) {
    return "Weekends";
  }
  
  // Otherwise, list the days
  const days = frequency.map(day => day.charAt(0).toUpperCase() + day.slice(1, 3));
  return days.join(", ");
}
