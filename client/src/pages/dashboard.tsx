import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Footer from "@/components/footer";
import StatisticsOverview from "@/components/statistics-overview";
import WeeklyTracker from "@/components/weekly-tracker";
import HabitCard from "@/components/habit-card";
import MonthlyCalendar from "@/components/monthly-calendar";
import AddHabitModal from "@/components/add-habit-modal";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { HabitWithFrequency } from "@shared/schema";
import { endOfWeek, startOfWeek, format } from "@/lib/date-utils";

export default function Dashboard() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { toast } = useToast();

  const today = new Date();
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(today)
  );
  const currentWeekEnd = endOfWeek(currentWeekStart);
  const weekLabel = `${format(currentWeekStart, "MMMM d")} - ${format(
    currentWeekEnd,
    "d, yyyy"
  )}`;

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Fetch habits data
  const { data: habits, isLoading: habitsLoading } = useQuery<HabitWithFrequency[]>({
    queryKey: ["/api/habits"],
  });

  // Fetch stats data
  interface StatsData {
    currentStreak: number;
    completionRate: number;
    activeHabits: number;
    longestStreak: number;
    totalCompleted: number;
    totalSkipped: number;
  }
  
  const { data: stats, isLoading: statsLoading } = useQuery<StatsData>({
    queryKey: ["/api/stats"],
  });
  

  // Filter habits by category
  const filteredHabits = habits?.filter(habit => 
    selectedCategory === "all" || habit.category === selectedCategory
  );

  const previousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const previousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Statistics Overview */}
        <StatisticsOverview stats={stats} isLoading={statsLoading} />

        {/* Weekly Tracker */}
        <WeeklyTracker 
          habits={habits || []} 
          isLoading={habitsLoading} 
          startDate={currentWeekStart}
          weekLabel={weekLabel}
          onPreviousWeek={previousWeek}
          onNextWeek={nextWeek}
        />

        {/* Habits Grid and Monthly Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Habits</h2>
            <Button 
              variant="default" // Change from "primary" to "default" (or another valid variant)
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600" // Manually style it
            >
              <PlusIcon className="h-4 w-4" />
              Add Habit
            </Button>

              <div className="flex space-x-2">
                
                <select
                  className="pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-md text-sm focus:ring-primary focus:border-primary"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="health">Health</option>
                  <option value="productivity">Productivity</option>
                  <option value="wellness">Wellness</option>
                  <option value="learning">Learning</option>
                  <option value="financial">Financial</option>
                  <option value="social">Social</option>
                  <option value="other">Other</option>
                </select>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? "bg-gray-100" : ""}
                >
                  <span className="sr-only">List view</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6"></line>
                    <line x1="8" y1="12" x2="21" y2="12"></line>
                    <line x1="8" y1="18" x2="21" y2="18"></line>
                    <line x1="3" y1="6" x2="3.01" y2="6"></line>
                    <line x1="3" y1="12" x2="3.01" y2="12"></line>
                    <line x1="3" y1="18" x2="3.01" y2="18"></line>
                  </svg>
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className={viewMode === "grid" ? "bg-gray-100" : ""}
                >
                  <span className="sr-only">Grid view</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                </Button>
              </div>
            </div>

            {habitsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded mb-3"></div>
                    <div className="h-2 bg-gray-200 rounded mb-2"></div>
                    <div className="h-2 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredHabits?.map((habit) => (
                  <HabitCard key={habit.id} habit={habit} />
                ))}
                
                {filteredHabits?.length === 0 && (
                  <div className="col-span-full bg-white rounded-lg shadow-sm p-8 border border-gray-100 flex flex-col items-center">
                    <p className="text-gray-500 mb-3">No habits found in this category.</p>
                    <Button 
                      variant="outline"
                      onClick={() => setShowAddModal(true)}
                    >
                      Create a new habit
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Monthly Calendar View */}
          <MonthlyCalendar 
            currentMonth={currentMonth}
            habits={habits || []}
            onPreviousMonth={previousMonth}
            onNextMonth={nextMonth}
          />
        </div>

        {/* Add Habit Button */}
        <div className="fixed bottom-6 right-6">
          <Button
            className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
            onClick={() => setShowAddModal(true)}
          >
            <PlusIcon className="h-6 w-6" />
          </Button>

        
        </div>
      </main>

      <Footer />

      {/* Add Habit Modal */}
      {showAddModal && <AddHabitModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}
