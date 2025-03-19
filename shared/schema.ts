import { pgTable, text, serial, date, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Base user schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  email: text("email"),
  bio: text("bio"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  bio: true,
}).extend({
  email: z.string().email("Please enter a valid email address").optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Habit category enum
export const categoryEnum = pgEnum("category", [
  "health",
  "productivity",
  "wellness",
  "learning",
  "financial",
  "social",
  "other"
]);

// Habit color enum
export const colorEnum = pgEnum("color", [
  "success",
  "primary",
  "secondary",
  "warning",
  "danger",
  "accent"
]);

// Frequency days enum
export const weekdayEnum = pgEnum("weekday", [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday"
]);

// Habits table
export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: categoryEnum("category").notNull().default("other"),
  color: colorEnum("color").notNull().default("primary"),
  userId: integer("user_id"),
  createdAt: date("created_at").notNull().defaultNow(),
  active: boolean("active").notNull().default(true),
});

export const insertHabitSchema = createInsertSchema(habits).omit({
  id: true,
  createdAt: true
});

export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type Habit = typeof habits.$inferSelect;

// Habit frequency table (which days the habit should be done)
export const habitFrequencies = pgTable("habit_frequencies", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").notNull(),
  weekday: weekdayEnum("weekday").notNull(),
});

export const insertHabitFrequencySchema = createInsertSchema(habitFrequencies).omit({
  id: true
});

export type InsertHabitFrequency = z.infer<typeof insertHabitFrequencySchema>;
export type HabitFrequency = typeof habitFrequencies.$inferSelect;

// Habit logs (tracking completions)
export const habitLogs = pgTable("habit_logs", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").notNull(),
  date: date("date").notNull(),
  completed: boolean("completed").notNull().default(true),
});

export const insertHabitLogSchema = createInsertSchema(habitLogs).omit({
  id: true
});

export type InsertHabitLog = z.infer<typeof insertHabitLogSchema>;
export type HabitLog = typeof habitLogs.$inferSelect;

// Extended schema for frontend consumption
export const habitWithFrequencySchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  category: z.enum(["health", "productivity", "wellness", "learning", "financial", "social", "other"]),
  color: z.enum(["success", "primary", "secondary", "warning", "danger", "accent"]),
  userId: z.number().optional(),
  createdAt: z.date(),
  active: z.boolean(),
  frequency: z.array(z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]))
});

export type HabitWithFrequency = z.infer<typeof habitWithFrequencySchema>;

// Stats schema
export const statsSchema = z.object({
  currentStreak: z.number(),
  completionRate: z.number(),
  activeHabits: z.number(),
  longestStreak: z.number(),
  totalCompleted: z.number(),
  totalSkipped: z.number(),
});

export type Stats = z.infer<typeof statsSchema>;
