import {
  habits,
  habitFrequencies,
  habitLogs,
  users,
  type Habit,
  type InsertHabit,
  type HabitFrequency,
  type InsertHabitFrequency,
  type HabitLog,
  type InsertHabitLog,
  type HabitWithFrequency,
  type Stats,
  type User
} from "@shared/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, and, between, sql, desc, asc } from "drizzle-orm";
import pg from 'pg';
import { format as formatDate } from "date-fns";
import dotenv from "dotenv";
dotenv.config();

console.log("DATABASE_URL:", process.env.DATABASE_URL);
// Interface for storage operations
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: Omit<User, "id">): Promise<User>;
  updateUser(id: number, userData: Partial<Omit<User, "id">>): Promise<User | undefined>;

  // Habits
  createHabit(habit: InsertHabit, frequency: string[]): Promise<HabitWithFrequency>;
  getHabits(): Promise<HabitWithFrequency[]>;
  getHabitById(id: number): Promise<HabitWithFrequency | undefined>;
  updateHabit(id: number, habit: Partial<InsertHabit>, frequency?: string[]): Promise<HabitWithFrequency | undefined>;
  deleteHabit(id: number): Promise<boolean>;

  // Habit logs
  addHabitLog(log: InsertHabitLog): Promise<HabitLog>;
  getHabitLogs(habitId: number): Promise<HabitLog[]>;
  getHabitLogsByDate(date: Date): Promise<HabitLog[]>;
  getHabitLogsBetweenDates(startDate: Date, endDate: Date): Promise<HabitLog[]>;
  toggleHabitCompletion(habitId: number, date: Date, completed: boolean): Promise<HabitLog>;
  
  // Stats
  getStats(): Promise<Stats>;
}

// PostgreSQL implementation of the storage interface
export class PostgresStorage implements IStorage {
  private db: any;

  constructor() {
    // Create a connection pool
    const pool = new pg.Pool({
      connectionString: "postgresql://postgres:psyduck@localhost:1222/habitvision?schema=public"

    });

    // Create drizzle instance
    this.db = drizzle(pool);
    
    // Seed data if needed
    this.seedDataIfNeeded();
  }

  // USER OPERATIONS
  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username));
    return result.length > 0 ? result[0] : undefined;
  }

  async createUser(user: Omit<User, "id">): Promise<User> {
    const result = await this.db.insert(users).values(user).returning();
    return result[0];
  }
  
  async updateUser(id: number, userData: Partial<Omit<User, "id">>): Promise<User | undefined> {
    // First check if user exists
    const existingUser = await this.getUser(id);
    if (!existingUser) {
      return undefined;
    }
    
    // Update user
    const result = await this.db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }

  // HABIT OPERATIONS
  async createHabit(habit: InsertHabit, frequency: string[]): Promise<HabitWithFrequency> {
    // Start a transaction
    const client = await this.db.transaction(async (tx: any) => {
      // Insert habit
      const habitResult = await tx.insert(habits).values(habit).returning();
      const newHabit = habitResult[0];

      // Insert frequencies
      for (const day of frequency) {
        await tx.insert(habitFrequencies).values({
          habitId: newHabit.id,
          weekday: day as any
        });
      }

      return {
        ...newHabit,
        frequency
      };
    });

    return client;
  }

  async getHabits(): Promise<HabitWithFrequency[]> {
    // Query all habits
    const habitsResult = await this.db.select().from(habits);
    
    // For each habit, get its frequencies
    const habitsWithFrequency: HabitWithFrequency[] = [];
    
    for (const habit of habitsResult) {
      const frequenciesResult = await this.db
        .select()
        .from(habitFrequencies)
        .where(eq(habitFrequencies.habitId, habit.id));
      
      habitsWithFrequency.push({
        ...habit,
        frequency: frequenciesResult.map((f: { weekday: string }) => f.weekday)
      });
    }
    
    return habitsWithFrequency;
  }

  async getHabitById(id: number): Promise<HabitWithFrequency | undefined> {
    const habitResult = await this.db
      .select()
      .from(habits)
      .where(eq(habits.id, id));

    if (habitResult.length === 0) {
      return undefined;
    }

    const frequenciesResult = await this.db
      .select()
      .from(habitFrequencies)
      .where(eq(habitFrequencies.habitId, id));

    // ✅ Fetch completions using the correct table name
    const completionsResult = await this.db
      .select()
      .from(habitLogs) // 🔥 Use the correct table for completions
      .where(eq(habitLogs.habitId, id));

    return {
      ...habitResult[0],
      frequency: frequenciesResult.map((f: { weekday: string }) => f.weekday),
      completions: completionsResult.map((c: { date: string }) => ({ date: c.date })) || [] // ✅ Ensure completions always exists
    };
}

//

  async updateHabit(
    id: number, 
    habit: Partial<InsertHabit>, 
    frequency?: string[]
  ): Promise<HabitWithFrequency | undefined> {
    return await this.db.transaction(async (tx: any) => {
      // Update habit
      const habitResult = await tx
        .update(habits)
        .set(habit)
        .where(eq(habits.id, id))
        .returning();
      
      if (habitResult.length === 0) {
        return undefined;
      }
      
      // Update frequencies if provided
      if (frequency) {
        // Delete old frequencies
        await tx
          .delete(habitFrequencies)
          .where(eq(habitFrequencies.habitId, id));
        
        // Insert new frequencies
        for (const day of frequency) {
          await tx.insert(habitFrequencies).values({
            habitId: id,
            weekday: day as any
          });
        }
      }
      
      // Get updated frequencies
      const frequenciesResult = await tx
        .select()
        .from(habitFrequencies)
        .where(eq(habitFrequencies.habitId, id));
      
      return {
        ...habitResult[0],
        frequency: frequenciesResult.map((f: { weekday: string }) => f.weekday)
      };
    });
  }

  async deleteHabit(id: number): Promise<boolean> {
    return await this.db.transaction(async (tx: any) => {
      // Delete associated logs first
      await tx
        .delete(habitLogs)
        .where(eq(habitLogs.habitId, id));
      
      // Delete frequencies
      await tx
        .delete(habitFrequencies)
        .where(eq(habitFrequencies.habitId, id));
      
      // Delete the habit
      const result = await tx
        .delete(habits)
        .where(eq(habits.id, id))
        .returning();
      
      return result.length > 0;
    });
  }

  // HABIT LOG OPERATIONS
  async addHabitLog(log: InsertHabitLog): Promise<HabitLog> {
    const result = await this.db
      .insert(habitLogs)
      .values(log)
      .returning();
    
    return result[0];
  }

  async getHabitLogs(habitId: number): Promise<HabitLog[]> {
    return await this.db
      .select()
      .from(habitLogs)
      .where(eq(habitLogs.habitId, habitId))
      .orderBy(desc(habitLogs.date));
  }

  async getHabitLogsByDate(date: Date): Promise<HabitLog[]> {
    // Format date for PostgreSQL (YYYY-MM-DD)
    const formattedDate = formatDate(date, 'yyyy-MM-dd');
    
    return await this.db
      .select()
      .from(habitLogs)
      .where(sql`${habitLogs.date}::date = ${formattedDate}::date`);
  }

  async getHabitLogsBetweenDates(startDate: Date, endDate: Date): Promise<HabitLog[]> {
    // Format dates for PostgreSQL (YYYY-MM-DD)
    const formattedStartDate = formatDate(startDate, 'yyyy-MM-dd');
    const formattedEndDate = formatDate(endDate, 'yyyy-MM-dd');
    
    return await this.db
      .select()
      .from(habitLogs)
      .where(
        sql`${habitLogs.date}::date >= ${formattedStartDate}::date AND 
            ${habitLogs.date}::date <= ${formattedEndDate}::date`
      )
      .orderBy(desc(habitLogs.date));
  }

  async toggleHabitCompletion(habitId: number, date: Date, completed: boolean): Promise<HabitLog> {
    // Format date for PostgreSQL (YYYY-MM-DD)
    const formattedDate = formatDate(date, 'yyyy-MM-dd');
    
    // Check if a log already exists for this habit and date
    const existingLogs = await this.db
      .select()
      .from(habitLogs)
      .where(
        and(
          eq(habitLogs.habitId, habitId),
          sql`${habitLogs.date}::date = ${formattedDate}::date`
        )
      );
    
    if (existingLogs.length > 0) {
      // Update existing log
      const result = await this.db
        .update(habitLogs)
        .set({ completed })
        .where(eq(habitLogs.id, existingLogs[0].id))
        .returning();
      
      return result[0];
    } else {
      // Create new log
      const result = await this.db
        .insert(habitLogs)
        .values({
          habitId,
          date,
          completed
        })
        .returning();
      
      return result[0];
    }
  }

  // STATS OPERATIONS
  async getStats(): Promise<Stats> {
    // Get count of active habits
    const activeHabitsResult = await this.db
      .select({ count: sql`count(*)` })
      .from(habits)
      .where(eq(habits.active, true));
    const activeHabits = parseInt(activeHabitsResult[0].count);
    
    // Get count of completed and total logs
    const completedLogsResult = await this.db
      .select({ count: sql`count(*)` })
      .from(habitLogs)
      .where(eq(habitLogs.completed, true));
    const completedLogs = parseInt(completedLogsResult[0].count);
    
    const totalLogsResult = await this.db
      .select({ count: sql`count(*)` })
      .from(habitLogs);
    const totalLogs = parseInt(totalLogsResult[0].count);
    
    // Calculate completion rate
    const completionRate = totalLogs > 0 
      ? Math.round((completedLogs / totalLogs) * 100)
      : 0;
    
    // Calculate streaks (simplified for now)
    const currentStreak = await this.calculateCurrentStreak();
    const longestStreak = await this.calculateLongestStreak();
    
    return {
      currentStreak,
      completionRate,
      activeHabits,
      longestStreak,
      totalCompleted: completedLogs,
      totalSkipped: totalLogs - completedLogs
    };
  }

  // Helper methods
  private async calculateCurrentStreak(): Promise<number> {
    // This is a simplified implementation
    // In a real app, this would be more complex based on habit frequencies
    
    // For now, return a placeholder value
    // A proper implementation would query consecutive completed logs
    return 12;
  }

  private async calculateLongestStreak(): Promise<number> {
    // This is a simplified implementation
    // In a real app, this would involve complex queries
    
    // For now, return a placeholder value
    return 32;
  }
  
  // Seed database with initial data if empty
  private async seedDataIfNeeded(): Promise<void> {
    try {
      // Check if habits table is empty
      const habitsCount = await this.db
        .select({ count: sql`count(*)` })
        .from(habits);
      
      if (parseInt(habitsCount[0].count) === 0) {
        console.log("Seeding database with initial data...");
        await this.seedInitialData();
        console.log("Database seeded successfully!");
      }
    } catch (error) {
      console.error("Error checking database state:", error);
    }
  }
  
  private async seedInitialData(): Promise<void> {
    // Sample habits
    const sampleHabits: InsertHabit[] = [
      {
        name: "Morning Exercise",
        description: "30 minutes of jogging or yoga every morning",
        category: "health",
        color: "success",
        active: true
      },
      {
        name: "Read 30 Minutes",
        description: "Read a book for at least 30 minutes daily",
        category: "learning",
        color: "primary",
        active: true
      },
      {
        name: "Meditate",
        description: "10 minutes of mindfulness meditation",
        category: "wellness",
        color: "secondary",
        active: true
      },
      {
        name: "Drink Water",
        description: "Drink 8 glasses of water throughout the day",
        category: "health",
        color: "warning",
        active: true
      }
    ];

    const frequencies = [
      ["monday", "tuesday", "wednesday", "thursday", "friday"],
      ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      ["monday", "wednesday", "thursday", "friday", "sunday"],
      ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    ];

    // Add habits and their frequencies
    for (let i = 0; i < sampleHabits.length; i++) {
      await this.createHabit(sampleHabits[i], frequencies[i]);
    }

    // Add some logs for the past week
    const today = new Date();
    
    // For each habit, create sample completion logs for the past 7 days
    for (let habitId = 1; habitId <= sampleHabits.length; habitId++) {
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        
        // Some random completion pattern for demo
        const completed = Math.random() > 0.2; // 80% chance of completion
        
        await this.toggleHabitCompletion(habitId, date, completed);
      }
    }
  }
}

// Create and export a database storage instance
export const storage = new PostgresStorage();
