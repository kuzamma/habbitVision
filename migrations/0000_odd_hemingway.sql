CREATE TYPE "public"."category" AS ENUM('health', 'productivity', 'wellness', 'learning', 'financial', 'social', 'other');--> statement-breakpoint
CREATE TYPE "public"."color" AS ENUM('success', 'primary', 'secondary', 'warning', 'danger', 'accent');--> statement-breakpoint
CREATE TYPE "public"."weekday" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');--> statement-breakpoint
CREATE TABLE "habit_frequencies" (
	"id" serial PRIMARY KEY NOT NULL,
	"habit_id" integer NOT NULL,
	"weekday" "weekday" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "habit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"habit_id" integer NOT NULL,
	"date" date NOT NULL,
	"completed" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "habits" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" "category" DEFAULT 'other' NOT NULL,
	"color" "color" DEFAULT 'primary' NOT NULL,
	"user_id" integer,
	"created_at" date DEFAULT now() NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
