import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HabitWithFrequency } from "@shared/schema";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday 
} from "@/lib/date-utils";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

interface MonthlyCalendarProps {
  currentMonth: Date;
  habits: HabitWithFrequency[];
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

export default function MonthlyCalendar({ 
  currentMonth, 
  habits,
  onPreviousMonth,
  onNextMonth 
}: MonthlyCalendarProps) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Group habits by color for the legend
  const habitsByColor = habits.reduce((acc, habit) => {
    if (!acc[habit.color]) {
      acc[habit.color] = [];
    }
    acc[habit.color].push(habit);
    return acc;
  }, {} as Record<string, HabitWithFrequency[]>);
  
  // Get color name display
  const getColorName = (color: string) => {
    switch (color) {
      case "success": return "Health";
      case "primary": return "Learning";
      case "secondary": return "Wellness";
      case "warning": return "Energy";
      case "danger": return "Important";
      default: return color.charAt(0).toUpperCase() + color.slice(1);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Calendar</h2>
        <div className="flex space-x-2 items-center">
          <Button variant="ghost" size="icon" onClick={onPreviousMonth}>
            <ChevronLeftIcon className="h-5 w-5" />
          </Button>
          <span className="flex items-center font-medium">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <Button variant="ghost" size="icon" onClick={onNextMonth}>
            <ChevronRightIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Card className="border-gray-100">
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500 mb-2">
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
            <div>Sun</div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              const dayStr = format(day, "d");
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isCurrentDay = isToday(day);
              
              // Get habits for this day
              const dayHabits: HabitWithFrequency[] = [];
              
              return (
                <div 
                  key={i}
                  className={`aspect-square flex flex-col items-center justify-start p-1 rounded-md
                    ${isCurrentMonth 
                      ? 'bg-white border border-gray-100 hover:bg-gray-50 cursor-pointer' 
                      : 'bg-gray-50 text-gray-400'
                    }
                    ${isCurrentDay ? 'bg-primary/5 border-primary' : ''}
                  `}
                >
                  <span className={`text-xs ${isCurrentDay ? 'font-semibold text-primary' : ''}`}>
                    {dayStr}
                  </span>
                  
                  <div className="mt-auto mb-1 w-full flex justify-center gap-0.5">
                    {/* Render dots for habits that should happen this day */}
                    {isCurrentMonth && habits
                      // Limit to 3 dots to avoid cluttering
                      .slice(0, 3)
                      .map((habit, idx) => (
                        <div 
                          key={idx} 
                          className={`w-1.5 h-1.5 rounded-full bg-${habit.color}`}
                        ></div>
                      ))
                    }
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <h3 className="text-sm font-medium mb-2">Legend</h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(habitsByColor).map(([color, habitsForColor]) => (
                <div key={color} className="flex items-center">
                  <span className={`w-2 h-2 rounded-full bg-${color} mr-1.5`}></span>
                  <span className="text-xs text-gray-500">
                    {habitsForColor[0]?.name || getColorName(color)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
