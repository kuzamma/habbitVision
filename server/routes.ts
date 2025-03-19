import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertHabitSchema, insertHabitLogSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // GET stats
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // HABITS ROUTES

  // GET all habits
  app.get("/api/habits", async (req, res) => {
    try {
      const habits = await storage.getHabits();
      res.json(habits);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch habits" });
    }
  });

  // GET habit by ID
  app.get("/api/habits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid habit ID" });
      }

      const habit = await storage.getHabitById(id);
      if (!habit) {
        return res.status(404).json({ error: "Habit not found" });
      }

      res.json(habit);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch habit" });
    }
  });

  // POST create a new habit
  app.post("/api/habits", async (req, res) => {
    try {
      // Validate the habit data
      const habitData = insertHabitSchema.parse(req.body);

      // Validate the frequency data (which is an array of weekdays)
      const frequencySchema = z.array(z.enum([
        "monday", "tuesday", "wednesday", "thursday",
        "friday", "saturday", "sunday"
      ]));

      const frequency = frequencySchema.parse(req.body.frequency);

      // Create the habit with its frequency
      const habit = await storage.createHabit(habitData, frequency);

      res.status(201).json(habit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid habit data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create habit" });
    }
  });

  // PUT update a habit
  app.put("/api/habits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid habit ID" });
      }

      // Validate the habit data
      const habitData = insertHabitSchema.partial().parse(req.body);

      // Frequency is optional for updates
      let frequency: string[] | undefined = undefined;
      if (req.body.frequency) {
        const frequencySchema = z.array(z.enum([
          "monday", "tuesday", "wednesday", "thursday",
          "friday", "saturday", "sunday"
        ]));
        frequency = frequencySchema.parse(req.body.frequency);
      }

      const updatedHabit = await storage.updateHabit(id, habitData, frequency);
      if (!updatedHabit) {
        return res.status(404).json({ error: "Habit not found" });
      }

      res.json(updatedHabit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid habit data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update habit" });
    }
  });

  // DELETE a habit
  app.delete("/api/habits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid habit ID" });
      }

      const deleted = await storage.deleteHabit(id);
      if (!deleted) {
        return res.status(404).json({ error: "Habit not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete habit" });
    }
  });

  // HABIT LOGS ROUTES

  // GET logs for a specific habit
  app.get("/api/habits/:id/logs", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid habit ID" });
      }

      const logs = await storage.getHabitLogs(id);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch habit logs" });
    }
  });

  // GET logs for a specific date
  app.get("/api/logs/date/:date", async (req, res) => {
    try {
      const dateParam = req.params.date;
      const date = new Date(dateParam);

      if (isNaN(date.getTime())) {
        return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
      }

      const logs = await storage.getHabitLogsByDate(date);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch logs for date" });
    }
  });

  // GET logs between dates
  app.get("/api/logs/range", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ error: "Both startDate and endDate are required" });
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
      }

      const logs = await storage.getHabitLogsBetweenDates(start, end);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch logs for date range" });
    }
  });

  // POST toggle habit completion
  app.post("/api/habits/:id/toggle", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid habit ID" });
      }

      // Validate request body
      const toggleSchema = z.object({
        date: z.string(),
        completed: z.boolean()
      });

      const { date: dateString, completed } = toggleSchema.parse(req.body);
      const date = new Date(dateString);

      if (isNaN(date.getTime())) {
        return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
      }

      const log = await storage.toggleHabitCompletion(id, date, completed);

        // Fetch the updated habit with completions
        const updatedHabit = await storage.getHabitById(id);

        if (!updatedHabit) {
          return res.status(404).json({ error: "Habit not found" });
        }

        // Ensure `completions` exists
        res.json({
          ...updatedHabit,
          completions: updatedHabit.completions || [],
        });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to toggle habit completion" });
    }
  });

  // USER ROUTES

  // GET current user
  app.get("/api/users/current", async (req, res) => {
    try {
      // For now, return the first user (in a real app, this would use sessions to determine the current user)
      const user = await storage.getUser(1);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // GET user by ID
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // POST create a new user (signup)
  app.post("/api/users", async (req, res) => {
    try {
      // Validate the user data
      const userData = insertUserSchema.parse(req.body);

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Import password utils in scope to avoid top-level async imports
      const { hashPassword } = await import('./password-utils');

      // Hash the password
      const hashedPassword = await hashPassword(userData.password);

      // Create the user with hashed password
      const userToCreate = {
        ...userData,
        fullName: userData.fullName ?? null, // Ensure fullName is never undefined
        email: userData.email ?? null, // Ensure email is never undefined
        bio: userData.bio ?? null, // Ensure bio is never undefined
        password: hashedPassword,
      };
      
      

      const user = await storage.createUser(userToCreate);

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid user data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  // POST user login
  app.post("/api/users/login", async (req, res) => {
    try {
      // Validate login credentials
      const loginSchema = z.object({
        username: z.string(),
        password: z.string()
      });

      const { username, password } = loginSchema.parse(req.body);

      // Get user by username
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      // Import password utils in scope to avoid top-level async imports
      const { comparePassword } = await import('./password-utils');

      // Check if password matches
      const passwordMatches = await comparePassword(password, user.password);
      if (!passwordMatches) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      // Return user without password for security
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid login data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to log in" });
    }
  });

  // PUT update a user
  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      // Validate the updated data
      const updatedData = insertUserSchema.partial().parse(req.body);

      // If password is being updated, hash it
      if (updatedData.password) {
        // Import password utils in scope
        const { hashPassword } = await import('./password-utils');
        updatedData.password = await hashPassword(updatedData.password);
      }

      // Update the user with new data
      const user = await storage.updateUser(id, updatedData);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Return user without password for security
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid user data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}