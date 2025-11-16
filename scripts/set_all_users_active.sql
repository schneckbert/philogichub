-- Set all existing users to 'active' status if they don't have one
UPDATE "public"."users" 
SET "status" = 'active' 
WHERE "status" IS NULL OR "status" = '';

-- Verify all users have a status
SELECT email, status FROM "public"."users";
