import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { Stats } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface StatisticsOverviewProps {
  stats?: Stats;
  isLoading: boolean;
}

export default function StatisticsOverview({ stats, isLoading }: StatisticsOverviewProps) {
  const statsData = [
    {
      label: "Current Streak",
      value: stats?.currentStreak || 0,
      change: 3,
      changeDirection: "up" as const,
      color: "success" as const,
      percentage: 75,
    },
    {
      label: "Completion Rate",
      value: `${stats?.completionRate || 0}%`,
      change: 5,
      changeDirection: "up" as const,
      color: "primary" as const,
      percentage: stats?.completionRate || 0,
    },
    {
      label: "Active Habits",
      value: stats?.activeHabits || 0,
      change: 1,
      changeDirection: "down" as const,
      color: "secondary" as const,
      percentage: 60,
    },
    {
      label: "Longest Streak",
      value: stats?.longestStreak || 0,
      change: null,
      color: "accent" as const,
      percentage: 90,
    },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-7 w-16 mb-2" />
                  <Skeleton className="h-1 w-full mt-2" />
                </CardContent>
              </Card>
            ))
          : statsData.map((stat, index) => (
              <Card key={index} className="border-gray-100">
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold">{stat.value}</span>
                    {stat.change !== null && (
                      <span
                        className={`text-sm ${
                          stat.changeDirection === "up" ? "text-success" : "text-danger"
                        } flex items-center`}
                      >
                        {stat.changeDirection === "up" ? (
                          <ArrowUpIcon className="h-3 w-3 mr-1" />
                        ) : (
                          <ArrowDownIcon className="h-3 w-3 mr-1" />
                        )}
                        {stat.change}
                      </span>
                    )}
                    {stat.label === "Longest Streak" && (
                      <span className="text-sm text-gray-400">days</span>
                    )}
                  </div>
                  <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`bg-${stat.color} h-full rounded-full`}
                      style={{ width: `${stat.percentage}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>
    </div>
  );
}
