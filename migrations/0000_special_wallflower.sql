CREATE TABLE "achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"badge_icon" varchar(50),
	"points_required" integer DEFAULT 0,
	"category" varchar(50) NOT NULL,
	"type" varchar(30) NOT NULL,
	"criteria" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "attendance_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"church_id" integer,
	"service_date" timestamp NOT NULL,
	"service_type" varchar(50) NOT NULL,
	"checked_in_at" timestamp DEFAULT now(),
	"checked_in_by" varchar,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "challenge_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"challenge_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"current_progress" integer DEFAULT 0,
	"is_completed" boolean DEFAULT false,
	"completed_at" timestamp,
	"joined_at" timestamp DEFAULT now(),
	CONSTRAINT "challenge_participants_challenge_id_user_id_unique" UNIQUE("challenge_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "challenges" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"type" varchar(30) NOT NULL,
	"category" varchar(50) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"target_points" integer DEFAULT 0,
	"target_activity" varchar(50),
	"target_count" integer DEFAULT 0,
	"reward_points" integer DEFAULT 0,
	"church_id" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "check_ins" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"church_id" integer,
	"event_id" integer,
	"check_in_type" varchar(50) NOT NULL,
	"mood" varchar(20),
	"mood_emoji" varchar(10),
	"notes" text,
	"prayer_intent" text,
	"is_physical_attendance" boolean DEFAULT false,
	"qr_code_id" varchar,
	"location" varchar,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"streak_count" integer DEFAULT 1,
	"points_earned" integer DEFAULT 5,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "churches" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"denomination" varchar(100),
	"description" text,
	"bio" text,
	"address" text,
	"city" varchar(100),
	"state" varchar(50),
	"zip_code" varchar(10),
	"phone" varchar(20),
	"email" varchar(255),
	"website" varchar(255),
	"logo_url" varchar,
	"social_links" jsonb,
	"community_tags" text[],
	"latitude" real,
	"longitude" real,
	"rating" real DEFAULT 0,
	"member_count" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "community_group_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"role" varchar(50) DEFAULT 'member',
	"joined_at" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT true,
	CONSTRAINT "community_group_members_group_id_user_id_unique" UNIQUE("group_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "community_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"church_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"category" varchar(50),
	"tags" text[],
	"leader_id" varchar,
	"max_members" integer,
	"is_private" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "conversation_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"role" varchar(20) DEFAULT 'member',
	"joined_at" timestamp DEFAULT now(),
	"last_read_at" timestamp,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar(20) DEFAULT 'direct' NOT NULL,
	"name" varchar(255),
	"description" text,
	"created_by" varchar NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "counseling_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"member_id" varchar NOT NULL,
	"counselor_id" varchar NOT NULL,
	"session_type" varchar(30) NOT NULL,
	"scheduled_time" timestamp NOT NULL,
	"duration" integer DEFAULT 60,
	"location" varchar(255),
	"is_virtual" boolean DEFAULT false,
	"meeting_link" varchar(500),
	"status" varchar(20) DEFAULT 'scheduled',
	"notes" text,
	"follow_up_needed" boolean DEFAULT false,
	"confidential" boolean DEFAULT true,
	"church_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "daily_inspirations" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"content" text NOT NULL,
	"verse" varchar(200),
	"verse_reference" varchar(100),
	"category" varchar(50) NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "devotional_media" (
	"id" serial PRIMARY KEY NOT NULL,
	"devotional_id" integer,
	"media_type" varchar(20) NOT NULL,
	"media_url" varchar(500) NOT NULL,
	"title" varchar(255),
	"description" text,
	"duration" integer,
	"file_size" integer,
	"mime_type" varchar(100),
	"thumbnail_url" varchar(500),
	"is_embedded" boolean DEFAULT false,
	"embed_code" text,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "devotionals" (
	"id" serial PRIMARY KEY NOT NULL,
	"church_id" integer,
	"author_id" varchar NOT NULL,
	"title" varchar(200) NOT NULL,
	"content" text NOT NULL,
	"verse" varchar(500),
	"verse_reference" varchar(100),
	"category" varchar(50) NOT NULL,
	"tags" text[],
	"series_id" integer,
	"scheduled_date" timestamp,
	"is_published" boolean DEFAULT false,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "discussion_bookmarks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"discussion_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "discussion_bookmarks_user_id_discussion_id_unique" UNIQUE("user_id","discussion_id")
);
--> statement-breakpoint
CREATE TABLE "discussion_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"discussion_id" integer NOT NULL,
	"author_id" varchar NOT NULL,
	"content" text NOT NULL,
	"parent_id" integer,
	"like_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "discussion_likes" (
	"id" serial PRIMARY KEY NOT NULL,
	"discussion_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "discussions" (
	"id" serial PRIMARY KEY NOT NULL,
	"author_id" varchar NOT NULL,
	"church_id" integer,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"category" varchar(50),
	"is_public" boolean DEFAULT true,
	"like_count" integer DEFAULT 0,
	"comment_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "emergency_broadcasts" (
	"id" serial PRIMARY KEY NOT NULL,
	"church_id" integer,
	"created_by" varchar NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"severity" varchar(20) NOT NULL,
	"target_locations" text[],
	"target_radius" integer,
	"override_settings" boolean DEFAULT true,
	"send_immediately" boolean DEFAULT true,
	"scheduled_for" timestamp,
	"channels" text[],
	"status" varchar(20) DEFAULT 'draft',
	"sent_at" timestamp,
	"recipient_count" integer DEFAULT 0,
	"delivered_count" integer DEFAULT 0,
	"acknowledged_count" integer DEFAULT 0,
	"metadata" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "event_bookmarks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"event_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "event_bookmarks_user_id_event_id_unique" UNIQUE("user_id","event_id")
);
--> statement-breakpoint
CREATE TABLE "event_check_ins" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"checked_in_at" timestamp DEFAULT now(),
	"checked_in_by" varchar NOT NULL,
	"check_in_method" varchar(20) DEFAULT 'manual',
	"notes" text,
	"guest_count" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "event_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"metric_type" varchar(50) NOT NULL,
	"value" numeric(10, 2) NOT NULL,
	"unit" varchar(20),
	"recorded_at" timestamp DEFAULT now(),
	"recorded_by" varchar,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "event_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"recipient_id" varchar NOT NULL,
	"notification_type" varchar(50) NOT NULL,
	"message" text NOT NULL,
	"channel_type" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"scheduled_for" timestamp,
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"error_message" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "event_recurrence_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"frequency" varchar(20) NOT NULL,
	"interval" integer DEFAULT 1,
	"days_of_week" text[],
	"day_of_month" integer,
	"week_of_month" integer,
	"months_of_year" text[],
	"end_type" varchar(20) NOT NULL,
	"end_after_count" integer,
	"end_by_date" timestamp,
	"exceptions" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "event_rsvps" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"status" varchar(20) DEFAULT 'attending',
	"response_date" timestamp DEFAULT now(),
	"guest_count" integer DEFAULT 0,
	"guest_names" text[],
	"special_requests" text,
	"checked_in" boolean DEFAULT false,
	"checked_in_at" timestamp,
	"checked_in_by" varchar,
	"feedback" text,
	"rating" integer,
	"reminders_sent" integer DEFAULT 0,
	"last_reminder_sent" timestamp,
	"custom_responses" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "event_rsvps_user_id_event_id_unique" UNIQUE("user_id","event_id")
);
--> statement-breakpoint
CREATE TABLE "event_sign_ups" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"member_id" varchar NOT NULL,
	"sign_up_type" varchar(30) NOT NULL,
	"role" varchar(100),
	"requirements" text,
	"sign_up_date" timestamp DEFAULT now(),
	"status" varchar(20) DEFAULT 'confirmed',
	"notes" text,
	"church_id" integer
);
--> statement-breakpoint
CREATE TABLE "event_updates" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"author_id" varchar NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"update_type" varchar(30) NOT NULL,
	"is_public" boolean DEFAULT true,
	"notify_attendees" boolean DEFAULT false,
	"attachments" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "event_volunteers" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"role" varchar(100) NOT NULL,
	"description" text,
	"time_commitment" varchar(100),
	"requirements" text,
	"status" varchar(20) DEFAULT 'assigned',
	"assigned_by" varchar NOT NULL,
	"confirmed_at" timestamp,
	"completed_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"church_id" integer NOT NULL,
	"organizer_id" varchar NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"event_date" timestamp NOT NULL,
	"end_date" timestamp,
	"location" text,
	"address" text,
	"is_online" boolean DEFAULT false,
	"online_link" varchar,
	"max_attendees" integer,
	"min_attendees" integer,
	"is_public" boolean DEFAULT true,
	"requires_approval" boolean DEFAULT false,
	"category" varchar(50),
	"subcategory" varchar(50),
	"priority" varchar(20) DEFAULT 'normal',
	"status" varchar(20) DEFAULT 'scheduled',
	"image_url" varchar,
	"attachments" jsonb,
	"tags" text[],
	"age_groups" text[],
	"cost" numeric(10, 2) DEFAULT '0.00',
	"currency" varchar(3) DEFAULT 'USD',
	"registration_deadline" timestamp,
	"cancellation_deadline" timestamp,
	"is_recurring" boolean DEFAULT false,
	"recurring_pattern" jsonb,
	"parent_event_id" integer,
	"reminder_settings" jsonb,
	"custom_fields" jsonb,
	"notes" text,
	"public_notes" text,
	"last_modified_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "families" (
	"id" serial PRIMARY KEY NOT NULL,
	"family_name" varchar(255) NOT NULL,
	"head_of_household_id" varchar,
	"address" varchar(500),
	"city" varchar(100),
	"state" varchar(50),
	"zip_code" varchar(10),
	"home_phone" varchar(20),
	"family_photo" varchar(255),
	"church_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "family_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"family_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"relationship" varchar(50) NOT NULL,
	"is_primary_contact" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "friendships" (
	"id" serial PRIMARY KEY NOT NULL,
	"requester_id" varchar NOT NULL,
	"addressee_id" varchar NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "giving_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"member_id" varchar NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD',
	"giving_type" varchar(50) NOT NULL,
	"method" varchar(50) NOT NULL,
	"gift_date" timestamp NOT NULL,
	"designation" varchar(255),
	"is_recurring" boolean DEFAULT false,
	"recurring_frequency" varchar(20),
	"tax_deductible" boolean DEFAULT true,
	"acknowledgment_sent" boolean DEFAULT false,
	"church_id" integer,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "inspiration_bookmarks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"inspiration_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "inspiration_bookmarks_user_id_inspiration_id_unique" UNIQUE("user_id","inspiration_id")
);
--> statement-breakpoint
CREATE TABLE "leaderboard_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"leaderboard_id" integer NOT NULL,
	"user_id" varchar,
	"church_id" integer,
	"rank" integer NOT NULL,
	"score" integer NOT NULL,
	"entity_name" varchar(100),
	"last_updated" timestamp DEFAULT now(),
	CONSTRAINT "leaderboard_entries_leaderboard_id_user_id_unique" UNIQUE("leaderboard_id","user_id"),
	CONSTRAINT "leaderboard_entries_leaderboard_id_church_id_unique" UNIQUE("leaderboard_id","church_id")
);
--> statement-breakpoint
CREATE TABLE "leaderboards" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" varchar(30) NOT NULL,
	"category" varchar(50) NOT NULL,
	"church_id" integer,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"is_active" boolean DEFAULT true,
	"settings" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "livestreams" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"stream_key" varchar(255),
	"stream_url" varchar(500),
	"embed_code" text,
	"scheduled_start" timestamp,
	"actual_start" timestamp,
	"actual_end" timestamp,
	"status" varchar(20) DEFAULT 'scheduled',
	"viewer_count" integer DEFAULT 0,
	"max_viewers" integer DEFAULT 0,
	"chat_enabled" boolean DEFAULT true,
	"recording_enabled" boolean DEFAULT true,
	"recording_url" varchar(500),
	"thumbnail_url" varchar(500),
	"tags" text[],
	"church_id" integer,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "member_communications" (
	"id" serial PRIMARY KEY NOT NULL,
	"member_id" varchar NOT NULL,
	"communication_type" varchar(50) NOT NULL,
	"direction" varchar(10) NOT NULL,
	"subject" varchar(255),
	"content" text,
	"sent_by" varchar,
	"sent_at" timestamp NOT NULL,
	"delivery_status" varchar(20) DEFAULT 'sent',
	"response_received" boolean DEFAULT false,
	"follow_up_required" boolean DEFAULT false,
	"church_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "member_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"event_date" timestamp NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"location" varchar(255),
	"celebrant" varchar(255),
	"witnesses" text[],
	"photos" text[],
	"church_id" integer,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "member_onboarding" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"current_step" integer DEFAULT 1,
	"total_steps" integer DEFAULT 7,
	"steps" text,
	"step_progress" text,
	"assigned_mentor" varchar,
	"start_date" timestamp DEFAULT now(),
	"completed_date" timestamp,
	"is_completed" boolean DEFAULT false,
	"notes" text,
	"church_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "member_skills" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"skill_category" varchar(50) NOT NULL,
	"skill_name" varchar(100) NOT NULL,
	"proficiency_level" varchar(20) DEFAULT 'beginner',
	"years_of_experience" integer,
	"certifications" text[],
	"willingness" varchar(20) DEFAULT 'available',
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"sender_id" varchar NOT NULL,
	"content" text NOT NULL,
	"message_type" varchar(20) DEFAULT 'text',
	"reply_to_id" integer,
	"is_edited" boolean DEFAULT false,
	"edited_at" timestamp,
	"is_deleted" boolean DEFAULT false,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ministry_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"ministry_name" varchar(100) NOT NULL,
	"role" varchar(100) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"is_active" boolean DEFAULT true,
	"responsibilities" text[],
	"time_commitment" varchar(100),
	"church_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notification_ab_tests" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"church_id" integer,
	"test_type" varchar(20) NOT NULL,
	"variant_a" text NOT NULL,
	"variant_b" text NOT NULL,
	"control_group" text,
	"target_audience" text NOT NULL,
	"status" varchar(20) DEFAULT 'draft',
	"start_date" timestamp,
	"end_date" timestamp,
	"sample_size" integer,
	"confidence_level" integer DEFAULT 95,
	"created_by" varchar NOT NULL,
	"results" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notification_deliveries" (
	"id" serial PRIMARY KEY NOT NULL,
	"notification_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"delivery_method" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"opened_at" timestamp,
	"failure_reason" text,
	"device_token" varchar(255),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notification_responses" (
	"id" serial PRIMARY KEY NOT NULL,
	"notification_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"response_type" varchar(20) NOT NULL,
	"response_data" text,
	"responded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notification_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"push_enabled" boolean DEFAULT true,
	"email_enabled" boolean DEFAULT true,
	"scripture_notifications" boolean DEFAULT true,
	"event_notifications" boolean DEFAULT true,
	"message_notifications" boolean DEFAULT true,
	"prayer_notifications" boolean DEFAULT true,
	"scripture_time" varchar(5) DEFAULT '06:00',
	"timezone" varchar(50) DEFAULT 'America/Los_Angeles',
	"quiet_hours_start" varchar(5) DEFAULT '22:00',
	"quiet_hours_end" varchar(5) DEFAULT '07:00',
	"weekend_notifications" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pastoral_care_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"member_id" varchar NOT NULL,
	"pastor_id" varchar NOT NULL,
	"visit_type" varchar(50) NOT NULL,
	"visit_date" timestamp NOT NULL,
	"duration" integer,
	"location" varchar(255),
	"purpose" text,
	"summary" text,
	"follow_up_needed" boolean DEFAULT false,
	"follow_up_date" timestamp,
	"privacy" varchar(20) DEFAULT 'confidential',
	"church_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "point_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"points" integer NOT NULL,
	"activity_type" varchar(50) NOT NULL,
	"entity_id" integer,
	"description" text,
	"multiplier" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "prayer_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"prayer_request_id" integer NOT NULL,
	"assigned_by" varchar NOT NULL,
	"assigned_to" varchar NOT NULL,
	"role" varchar(30) NOT NULL,
	"notes" text,
	"status" varchar(20) DEFAULT 'active',
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "prayer_bookmarks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"prayer_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "prayer_bookmarks_user_id_prayer_id_unique" UNIQUE("user_id","prayer_id")
);
--> statement-breakpoint
CREATE TABLE "prayer_follow_ups" (
	"id" serial PRIMARY KEY NOT NULL,
	"prayer_request_id" integer NOT NULL,
	"admin_id" varchar NOT NULL,
	"follow_up_type" varchar(20) NOT NULL,
	"notes" text,
	"next_follow_up_date" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "prayer_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"author_id" varchar NOT NULL,
	"church_id" integer,
	"title" varchar(255),
	"content" text NOT NULL,
	"is_anonymous" boolean DEFAULT false,
	"is_answered" boolean DEFAULT false,
	"answered_at" timestamp,
	"prayer_count" integer DEFAULT 0,
	"is_public" boolean DEFAULT true,
	"category" varchar(50),
	"status" varchar(20) DEFAULT 'pending',
	"moderation_notes" text,
	"assigned_to" varchar,
	"priority" varchar(10) DEFAULT 'normal',
	"follow_up_date" timestamp,
	"last_follow_up_at" timestamp,
	"is_urgent" boolean DEFAULT false,
	"tags" text[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "prayer_responses" (
	"id" serial PRIMARY KEY NOT NULL,
	"prayer_request_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"response_type" varchar(20) DEFAULT 'prayed',
	"content" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "prayer_updates" (
	"id" serial PRIMARY KEY NOT NULL,
	"prayer_request_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"update_type" varchar(20) NOT NULL,
	"content" text NOT NULL,
	"is_public" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "qr_codes" (
	"id" varchar PRIMARY KEY NOT NULL,
	"church_id" integer NOT NULL,
	"event_id" integer,
	"name" varchar(100) NOT NULL,
	"description" text,
	"location" varchar NOT NULL,
	"is_active" boolean DEFAULT true,
	"max_uses_per_day" integer,
	"valid_from" timestamp,
	"valid_until" timestamp,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "scheduled_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"church_id" integer,
	"created_by" varchar NOT NULL,
	"type" varchar(20) NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"scheduled_for" timestamp NOT NULL,
	"timezone" varchar(50) DEFAULT 'America/Los_Angeles',
	"priority" varchar(20) DEFAULT 'normal',
	"target_audience" varchar(20) DEFAULT 'all',
	"target_group_id" integer,
	"target_location" varchar(100),
	"target_age_group" varchar(20),
	"target_ministry" varchar(50),
	"target_attendance" varchar(20),
	"target_tags" text[],
	"target_user_ids" text[],
	"is_recurring" boolean DEFAULT false,
	"recurring_pattern" varchar(20),
	"recurring_days" text[],
	"recurring_interval" integer DEFAULT 1,
	"end_date" timestamp,
	"status" varchar(20) DEFAULT 'scheduled',
	"sent_at" timestamp,
	"sent_count" integer DEFAULT 0,
	"delivered_count" integer DEFAULT 0,
	"opened_count" integer DEFAULT 0,
	"click_count" integer DEFAULT 0,
	"response_count" integer DEFAULT 0,
	"media_urls" text[],
	"interactive_elements" text,
	"ab_test_group" varchar(10),
	"weather_dependent" boolean DEFAULT false,
	"weather_conditions" text[],
	"auto_optimize" boolean DEFAULT false,
	"metadata" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "scripture_schedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"church_id" integer,
	"created_by" varchar NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"scriptures" text[] NOT NULL,
	"target_audience" varchar(20) DEFAULT 'all',
	"target_group_id" integer,
	"target_location" varchar(100),
	"target_age_group" varchar(20),
	"target_ministry" varchar(50),
	"target_tags" text[],
	"schedule_time" varchar(5) NOT NULL,
	"timezone" varchar(50) DEFAULT 'America/Los_Angeles',
	"is_active" boolean DEFAULT true,
	"start_date" timestamp DEFAULT now(),
	"end_date" timestamp,
	"current_index" integer DEFAULT 0,
	"personalized_content" boolean DEFAULT false,
	"include_reflection" boolean DEFAULT false,
	"audio_enabled" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sermon_archive" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"speaker" varchar(255) NOT NULL,
	"sermon_date" timestamp NOT NULL,
	"series" varchar(255),
	"scripture" varchar(255),
	"description" text,
	"video_url" varchar(500),
	"audio_url" varchar(500),
	"transcript_url" varchar(500),
	"thumbnail_url" varchar(500),
	"duration" integer,
	"view_count" integer DEFAULT 0,
	"download_count" integer DEFAULT 0,
	"tags" text[],
	"category" varchar(50) DEFAULT 'sermon',
	"is_public" boolean DEFAULT true,
	"featured" boolean DEFAULT false,
	"church_id" integer,
	"uploaded_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sermon_media" (
	"id" serial PRIMARY KEY NOT NULL,
	"church_id" integer,
	"author_id" varchar NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"media_type" varchar(20) NOT NULL,
	"media_url" varchar,
	"file_size" integer,
	"duration" integer,
	"thumbnail_url" varchar,
	"speaker" varchar(100),
	"date" timestamp NOT NULL,
	"series" varchar(100),
	"tags" text[],
	"is_public" boolean DEFAULT true,
	"is_published" boolean DEFAULT false,
	"published_at" timestamp,
	"download_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "streaks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"type" varchar(50) NOT NULL,
	"current_count" integer DEFAULT 0,
	"longest_count" integer DEFAULT 0,
	"last_activity_date" timestamp,
	"start_date" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "streaks_user_id_type_unique" UNIQUE("user_id","type")
);
--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"achievement_type" varchar(50) NOT NULL,
	"achievement_level" integer DEFAULT 1,
	"progress" integer DEFAULT 0,
	"max_progress" integer NOT NULL,
	"is_unlocked" boolean DEFAULT false,
	"unlocked_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_achievements_user_id_achievement_type_unique" UNIQUE("user_id","achievement_type")
);
--> statement-breakpoint
CREATE TABLE "user_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"activity_type" varchar(50) NOT NULL,
	"entity_id" integer,
	"points" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_churches" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"church_id" integer NOT NULL,
	"role" varchar(50) DEFAULT 'member',
	"permissions" text[],
	"title" varchar(100),
	"bio" text,
	"joined_at" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT true,
	CONSTRAINT "user_churches_user_id_church_id_unique" UNIQUE("user_id","church_id")
);
--> statement-breakpoint
CREATE TABLE "user_devices" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"device_token" varchar(255) NOT NULL,
	"platform" varchar(20) NOT NULL,
	"device_info" text,
	"is_active" boolean DEFAULT true,
	"last_active_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_engagement_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"church_id" integer,
	"notifications_received" integer DEFAULT 0,
	"notifications_opened" integer DEFAULT 0,
	"notifications_clicked" integer DEFAULT 0,
	"average_open_time" integer,
	"last_engagement" timestamp,
	"engagement_score" integer DEFAULT 0,
	"preferred_notification_types" text[],
	"opt_out_categories" text[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_inspiration_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"inspiration_id" integer NOT NULL,
	"was_read" boolean DEFAULT false,
	"was_favorited" boolean DEFAULT false,
	"was_shared" boolean DEFAULT false,
	"viewed_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "user_inspiration_history_user_id_inspiration_id_unique" UNIQUE("user_id","inspiration_id")
);
--> statement-breakpoint
CREATE TABLE "user_inspiration_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"preferred_categories" text[],
	"delivery_time" varchar(10) DEFAULT '08:00',
	"is_enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_inspiration_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"total_points" integer DEFAULT 0,
	"weekly_points" integer DEFAULT 0,
	"monthly_points" integer DEFAULT 0,
	"current_streak" integer DEFAULT 0,
	"longest_streak" integer DEFAULT 0,
	"last_activity_date" timestamp,
	"week_start_date" timestamp DEFAULT now(),
	"month_start_date" timestamp DEFAULT now(),
	"faithfulness_score" integer DEFAULT 0,
	"prayer_champion_points" integer DEFAULT 0,
	"service_hours" integer DEFAULT 0,
	"is_anonymous" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_scores_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"tag" varchar(50) NOT NULL,
	"value" text,
	"church_id" integer,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"bio" text,
	"mobile_number" varchar,
	"address" text,
	"city" varchar,
	"state" varchar,
	"zip_code" varchar,
	"country" varchar DEFAULT 'United States',
	"denomination" varchar,
	"interests" text[],
	"has_completed_onboarding" boolean DEFAULT false,
	"onboarding_data" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "volunteer_opportunities" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer,
	"title" varchar(255) NOT NULL,
	"description" text,
	"required_skills" text[],
	"max_volunteers" integer,
	"current_sign_ups" integer DEFAULT 0,
	"start_time" timestamp,
	"end_time" timestamp,
	"location" varchar(255),
	"contact_person_id" varchar,
	"is_active" boolean DEFAULT true,
	"church_id" integer,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "volunteer_sign_ups" (
	"id" serial PRIMARY KEY NOT NULL,
	"opportunity_id" integer NOT NULL,
	"volunteer_id" varchar NOT NULL,
	"sign_up_date" timestamp DEFAULT now(),
	"status" varchar(20) DEFAULT 'signed_up',
	"notes" text,
	"hours_served" real,
	"feedback" text,
	"church_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "weather_triggers" (
	"id" serial PRIMARY KEY NOT NULL,
	"church_id" integer,
	"name" varchar(255) NOT NULL,
	"location" varchar(100) NOT NULL,
	"conditions" text[] NOT NULL,
	"threshold" text,
	"notification_template" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"last_triggered" timestamp,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "weekly_series" (
	"id" serial PRIMARY KEY NOT NULL,
	"church_id" integer,
	"author_id" varchar NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"image_url" varchar,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"frequency" varchar(20) DEFAULT 'weekly',
	"is_active" boolean DEFAULT true,
	"total_devotionals" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_checked_in_by_users_id_fk" FOREIGN KEY ("checked_in_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_participants" ADD CONSTRAINT "challenge_participants_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_participants" ADD CONSTRAINT "challenge_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_group_members" ADD CONSTRAINT "community_group_members_group_id_community_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."community_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_group_members" ADD CONSTRAINT "community_group_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_groups" ADD CONSTRAINT "community_groups_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_groups" ADD CONSTRAINT "community_groups_leader_id_users_id_fk" FOREIGN KEY ("leader_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "counseling_sessions" ADD CONSTRAINT "counseling_sessions_member_id_users_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "counseling_sessions" ADD CONSTRAINT "counseling_sessions_counselor_id_users_id_fk" FOREIGN KEY ("counselor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "counseling_sessions" ADD CONSTRAINT "counseling_sessions_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devotional_media" ADD CONSTRAINT "devotional_media_devotional_id_devotionals_id_fk" FOREIGN KEY ("devotional_id") REFERENCES "public"."devotionals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devotionals" ADD CONSTRAINT "devotionals_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devotionals" ADD CONSTRAINT "devotionals_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devotionals" ADD CONSTRAINT "devotionals_series_id_weekly_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."weekly_series"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discussion_bookmarks" ADD CONSTRAINT "discussion_bookmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discussion_bookmarks" ADD CONSTRAINT "discussion_bookmarks_discussion_id_discussions_id_fk" FOREIGN KEY ("discussion_id") REFERENCES "public"."discussions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discussion_comments" ADD CONSTRAINT "discussion_comments_discussion_id_discussions_id_fk" FOREIGN KEY ("discussion_id") REFERENCES "public"."discussions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discussion_comments" ADD CONSTRAINT "discussion_comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discussion_comments" ADD CONSTRAINT "discussion_comments_parent_id_discussion_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."discussion_comments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discussion_likes" ADD CONSTRAINT "discussion_likes_discussion_id_discussions_id_fk" FOREIGN KEY ("discussion_id") REFERENCES "public"."discussions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discussion_likes" ADD CONSTRAINT "discussion_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discussions" ADD CONSTRAINT "discussions_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discussions" ADD CONSTRAINT "discussions_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emergency_broadcasts" ADD CONSTRAINT "emergency_broadcasts_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emergency_broadcasts" ADD CONSTRAINT "emergency_broadcasts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_bookmarks" ADD CONSTRAINT "event_bookmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_bookmarks" ADD CONSTRAINT "event_bookmarks_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_check_ins" ADD CONSTRAINT "event_check_ins_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_check_ins" ADD CONSTRAINT "event_check_ins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_check_ins" ADD CONSTRAINT "event_check_ins_checked_in_by_users_id_fk" FOREIGN KEY ("checked_in_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_metrics" ADD CONSTRAINT "event_metrics_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_metrics" ADD CONSTRAINT "event_metrics_recorded_by_users_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_notifications" ADD CONSTRAINT "event_notifications_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_notifications" ADD CONSTRAINT "event_notifications_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_recurrence_rules" ADD CONSTRAINT "event_recurrence_rules_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_rsvps" ADD CONSTRAINT "event_rsvps_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_rsvps" ADD CONSTRAINT "event_rsvps_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_rsvps" ADD CONSTRAINT "event_rsvps_checked_in_by_users_id_fk" FOREIGN KEY ("checked_in_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_sign_ups" ADD CONSTRAINT "event_sign_ups_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_sign_ups" ADD CONSTRAINT "event_sign_ups_member_id_users_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_sign_ups" ADD CONSTRAINT "event_sign_ups_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_updates" ADD CONSTRAINT "event_updates_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_updates" ADD CONSTRAINT "event_updates_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_volunteers" ADD CONSTRAINT "event_volunteers_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_volunteers" ADD CONSTRAINT "event_volunteers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_volunteers" ADD CONSTRAINT "event_volunteers_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_organizer_id_users_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_parent_event_id_events_id_fk" FOREIGN KEY ("parent_event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_last_modified_by_users_id_fk" FOREIGN KEY ("last_modified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "families" ADD CONSTRAINT "families_head_of_household_id_users_id_fk" FOREIGN KEY ("head_of_household_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "families" ADD CONSTRAINT "families_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_family_id_families_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."families"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_requester_id_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_addressee_id_users_id_fk" FOREIGN KEY ("addressee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "giving_records" ADD CONSTRAINT "giving_records_member_id_users_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "giving_records" ADD CONSTRAINT "giving_records_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "giving_records" ADD CONSTRAINT "giving_records_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspiration_bookmarks" ADD CONSTRAINT "inspiration_bookmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspiration_bookmarks" ADD CONSTRAINT "inspiration_bookmarks_inspiration_id_daily_inspirations_id_fk" FOREIGN KEY ("inspiration_id") REFERENCES "public"."daily_inspirations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaderboard_entries" ADD CONSTRAINT "leaderboard_entries_leaderboard_id_leaderboards_id_fk" FOREIGN KEY ("leaderboard_id") REFERENCES "public"."leaderboards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaderboard_entries" ADD CONSTRAINT "leaderboard_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaderboard_entries" ADD CONSTRAINT "leaderboard_entries_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaderboards" ADD CONSTRAINT "leaderboards_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "livestreams" ADD CONSTRAINT "livestreams_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "livestreams" ADD CONSTRAINT "livestreams_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_communications" ADD CONSTRAINT "member_communications_member_id_users_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_communications" ADD CONSTRAINT "member_communications_sent_by_users_id_fk" FOREIGN KEY ("sent_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_communications" ADD CONSTRAINT "member_communications_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_events" ADD CONSTRAINT "member_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_events" ADD CONSTRAINT "member_events_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_events" ADD CONSTRAINT "member_events_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_onboarding" ADD CONSTRAINT "member_onboarding_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_onboarding" ADD CONSTRAINT "member_onboarding_assigned_mentor_users_id_fk" FOREIGN KEY ("assigned_mentor") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_onboarding" ADD CONSTRAINT "member_onboarding_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_skills" ADD CONSTRAINT "member_skills_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_reply_to_id_messages_id_fk" FOREIGN KEY ("reply_to_id") REFERENCES "public"."messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ministry_roles" ADD CONSTRAINT "ministry_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ministry_roles" ADD CONSTRAINT "ministry_roles_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_ab_tests" ADD CONSTRAINT "notification_ab_tests_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_ab_tests" ADD CONSTRAINT "notification_ab_tests_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_notification_id_scheduled_notifications_id_fk" FOREIGN KEY ("notification_id") REFERENCES "public"."scheduled_notifications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_responses" ADD CONSTRAINT "notification_responses_notification_id_scheduled_notifications_id_fk" FOREIGN KEY ("notification_id") REFERENCES "public"."scheduled_notifications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_responses" ADD CONSTRAINT "notification_responses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pastoral_care_records" ADD CONSTRAINT "pastoral_care_records_member_id_users_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pastoral_care_records" ADD CONSTRAINT "pastoral_care_records_pastor_id_users_id_fk" FOREIGN KEY ("pastor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pastoral_care_records" ADD CONSTRAINT "pastoral_care_records_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_assignments" ADD CONSTRAINT "prayer_assignments_prayer_request_id_prayer_requests_id_fk" FOREIGN KEY ("prayer_request_id") REFERENCES "public"."prayer_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_assignments" ADD CONSTRAINT "prayer_assignments_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_assignments" ADD CONSTRAINT "prayer_assignments_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_bookmarks" ADD CONSTRAINT "prayer_bookmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_bookmarks" ADD CONSTRAINT "prayer_bookmarks_prayer_id_prayer_requests_id_fk" FOREIGN KEY ("prayer_id") REFERENCES "public"."prayer_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_follow_ups" ADD CONSTRAINT "prayer_follow_ups_prayer_request_id_prayer_requests_id_fk" FOREIGN KEY ("prayer_request_id") REFERENCES "public"."prayer_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_follow_ups" ADD CONSTRAINT "prayer_follow_ups_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_requests" ADD CONSTRAINT "prayer_requests_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_requests" ADD CONSTRAINT "prayer_requests_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_requests" ADD CONSTRAINT "prayer_requests_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_responses" ADD CONSTRAINT "prayer_responses_prayer_request_id_prayer_requests_id_fk" FOREIGN KEY ("prayer_request_id") REFERENCES "public"."prayer_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_responses" ADD CONSTRAINT "prayer_responses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_updates" ADD CONSTRAINT "prayer_updates_prayer_request_id_prayer_requests_id_fk" FOREIGN KEY ("prayer_request_id") REFERENCES "public"."prayer_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_updates" ADD CONSTRAINT "prayer_updates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_codes" ADD CONSTRAINT "qr_codes_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_codes" ADD CONSTRAINT "qr_codes_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_codes" ADD CONSTRAINT "qr_codes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_notifications" ADD CONSTRAINT "scheduled_notifications_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_notifications" ADD CONSTRAINT "scheduled_notifications_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_notifications" ADD CONSTRAINT "scheduled_notifications_target_group_id_community_groups_id_fk" FOREIGN KEY ("target_group_id") REFERENCES "public"."community_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scripture_schedules" ADD CONSTRAINT "scripture_schedules_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scripture_schedules" ADD CONSTRAINT "scripture_schedules_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scripture_schedules" ADD CONSTRAINT "scripture_schedules_target_group_id_community_groups_id_fk" FOREIGN KEY ("target_group_id") REFERENCES "public"."community_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sermon_archive" ADD CONSTRAINT "sermon_archive_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sermon_archive" ADD CONSTRAINT "sermon_archive_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sermon_media" ADD CONSTRAINT "sermon_media_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sermon_media" ADD CONSTRAINT "sermon_media_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "streaks" ADD CONSTRAINT "streaks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_activities" ADD CONSTRAINT "user_activities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_churches" ADD CONSTRAINT "user_churches_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_churches" ADD CONSTRAINT "user_churches_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_devices" ADD CONSTRAINT "user_devices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_engagement_metrics" ADD CONSTRAINT "user_engagement_metrics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_engagement_metrics" ADD CONSTRAINT "user_engagement_metrics_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_inspiration_history" ADD CONSTRAINT "user_inspiration_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_inspiration_history" ADD CONSTRAINT "user_inspiration_history_inspiration_id_daily_inspirations_id_fk" FOREIGN KEY ("inspiration_id") REFERENCES "public"."daily_inspirations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_inspiration_preferences" ADD CONSTRAINT "user_inspiration_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_scores" ADD CONSTRAINT "user_scores_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tags" ADD CONSTRAINT "user_tags_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tags" ADD CONSTRAINT "user_tags_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tags" ADD CONSTRAINT "user_tags_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_opportunities" ADD CONSTRAINT "volunteer_opportunities_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_opportunities" ADD CONSTRAINT "volunteer_opportunities_contact_person_id_users_id_fk" FOREIGN KEY ("contact_person_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_opportunities" ADD CONSTRAINT "volunteer_opportunities_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_opportunities" ADD CONSTRAINT "volunteer_opportunities_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_sign_ups" ADD CONSTRAINT "volunteer_sign_ups_opportunity_id_volunteer_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."volunteer_opportunities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_sign_ups" ADD CONSTRAINT "volunteer_sign_ups_volunteer_id_users_id_fk" FOREIGN KEY ("volunteer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_sign_ups" ADD CONSTRAINT "volunteer_sign_ups_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weather_triggers" ADD CONSTRAINT "weather_triggers_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weather_triggers" ADD CONSTRAINT "weather_triggers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_series" ADD CONSTRAINT "weekly_series_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_series" ADD CONSTRAINT "weekly_series_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");