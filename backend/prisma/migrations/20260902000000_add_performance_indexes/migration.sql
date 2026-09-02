-- Performance indexes for the hot read paths (dashboard, smart-match,
-- chat, housing search, leaderboard) plus missing foreign-key indexes.
-- Postgres does not create FK indexes automatically, so cascade deletes
-- were doing sequential scans.
--
-- Two existing indexes are dropped because a wider index added below
-- covers them on its leading columns:
--   housing_views_userId_idx -> housing_views_userId_viewedAt_idx
--   posts_communityId_idx    -> posts_communityId_createdAt_idx

-- DropIndex
DROP INDEX IF EXISTS "housing_views_userId_idx";

-- DropIndex
DROP INDEX IF EXISTS "posts_communityId_idx";

-- CreateIndex
CREATE INDEX IF NOT EXISTS "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "comments_postId_createdAt_idx" ON "comments"("postId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "comments_userId_idx" ON "comments"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "communities_isVerified_memberCount_idx" ON "communities"("isVerified", "memberCount");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "communities_city_memberCount_idx" ON "communities"("city", "memberCount");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "communities_createdAt_idx" ON "communities"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "community_members_userId_idx" ON "community_members"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "community_members_communityId_role_joinedAt_idx" ON "community_members"("communityId", "role", "joinedAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "community_messages_userId_idx" ON "community_messages"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "community_polls_communityId_createdAt_idx" ON "community_polls"("communityId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "event_attendees_eventId_idx" ON "event_attendees"("eventId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "events_date_idx" ON "events"("date");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "events_communityId_date_idx" ON "events"("communityId", "date");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "events_createdById_idx" ON "events"("createdById");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "housing_bookings_userId_createdAt_idx" ON "housing_bookings"("userId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "housing_bookings_housingId_status_idx" ON "housing_bookings"("housingId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "housing_reviews_housingId_idx" ON "housing_reviews"("housingId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "housing_reviews_userId_createdAt_idx" ON "housing_reviews"("userId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "housing_views_userId_viewedAt_idx" ON "housing_views"("userId", "viewedAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "housings_city_isWomenFriendly_idx" ON "housings"("city", "isWomenFriendly");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "housings_city_type_rent_idx" ON "housings"("city", "type", "rent");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "housings_createdAt_idx" ON "housings"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "housings_city_createdAt_idx" ON "housings"("city", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "housings_createdById_idx" ON "housings"("createdById");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "mentor_profiles_isApproved_createdAt_idx" ON "mentor_profiles"("isApproved", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "mentorships_menteeId_status_idx" ON "mentorships"("menteeId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "mentorships_mentorId_status_idx" ON "mentorships"("mentorId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "messages_receiverId_isRead_idx" ON "messages"("receiverId", "isRead");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "messages_receiverId_createdAt_idx" ON "messages"("receiverId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "messages_senderId_createdAt_idx" ON "messages"("senderId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "notifications_type_createdAt_idx" ON "notifications"("type", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "posts_communityId_createdAt_idx" ON "posts"("communityId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "posts_userId_createdAt_idx" ON "posts"("userId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "reports_reporterId_idx" ON "reports"("reporterId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "reputations_points_idx" ON "reputations"("points");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "saved_housings_housingId_idx" ON "saved_housings"("housingId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "saved_housings_userId_createdAt_idx" ON "saved_housings"("userId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "users_city_isOnboarded_idx" ON "users"("city", "isOnboarded");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "users_city_role_idx" ON "users"("city", "role");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "users_isOnboarded_createdAt_idx" ON "users"("isOnboarded", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "users_city_moveMonth_idx" ON "users"("city", "moveMonth");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "users_verificationStatus_createdAt_idx" ON "users"("verificationStatus", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "users_createdAt_idx" ON "users"("createdAt");

