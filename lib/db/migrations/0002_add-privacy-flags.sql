ALTER TABLE "users" ADD COLUMN "show_replies" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "show_reactions" boolean DEFAULT true NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "memories_user_post_idx" ON "memories" USING btree ("user_id","post_id");