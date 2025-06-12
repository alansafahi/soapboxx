-- Migration: Add video content and video series tables for comprehensive video system

-- Video content table for storing video information
CREATE TABLE IF NOT EXISTS "video_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"script" text,
	"visual_cues" text,
	"audio_narration" text,
	"bible_references" text[] DEFAULT '{}',
	"key_messages" text[] DEFAULT '{}',
	"video_url" varchar(500),
	"thumbnail_url" varchar(500),
	"duration" integer DEFAULT 0,
	"category" varchar(100) DEFAULT 'devotional',
	"target_audience" varchar(100) DEFAULT 'general',
	"voice_persona" varchar(50) DEFAULT 'pastor-david',
	"visual_style" varchar(50) DEFAULT 'modern',
	"church_id" integer,
	"user_id" varchar(255),
	"series_id" integer,
	"episode_number" integer,
	"is_public" boolean DEFAULT true,
	"is_active" boolean DEFAULT true,
	"view_count" integer DEFAULT 0,
	"like_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Video series table for organizing video collections
CREATE TABLE IF NOT EXISTS "video_series" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"theme" varchar(100),
	"episode_count" integer DEFAULT 1,
	"church_id" integer,
	"user_id" varchar(255),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE "video_content" ADD CONSTRAINT "video_content_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "video_series"("id") ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_video_content_church_id" ON "video_content" ("church_id");
CREATE INDEX IF NOT EXISTS "idx_video_content_user_id" ON "video_content" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_video_content_category" ON "video_content" ("category");
CREATE INDEX IF NOT EXISTS "idx_video_content_is_public" ON "video_content" ("is_public");
CREATE INDEX IF NOT EXISTS "idx_video_content_created_at" ON "video_content" ("created_at");
CREATE INDEX IF NOT EXISTS "idx_video_series_church_id" ON "video_series" ("church_id");
CREATE INDEX IF NOT EXISTS "idx_video_series_user_id" ON "video_series" ("user_id");