-- FINAL FIX: Complete removal of all RLS policies and creation of minimal, safe policies
-- This script will completely clean the slate and create only the essential policies

-- Disable RLS temporarily to clean up
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_collaborators DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies completely
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on projects table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'projects' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.projects';
    END LOOP;
    
    -- Drop all policies on project_collaborators table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'project_collaborators' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.project_collaborators';
    END LOOP;
    
    -- Drop all policies on team_members table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'team_members' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.team_members';
    END LOOP;
    
    -- Drop all policies on teams table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'teams' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.teams';
    END LOOP;
    
    -- Drop all policies on comments table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'comments' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.comments';
    END LOOP;
    
    -- Drop all policies on activity_logs table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'activity_logs' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.activity_logs';
    END LOOP;
    
    -- Drop all policies on team_invitations table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'team_invitations' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.team_invitations';
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Create ONLY the minimal, essential policies with NO cross-table references

-- PROJECTS: Users can only see/manage their own projects
CREATE POLICY "projects_own_only" ON public.projects 
  FOR ALL USING (auth.uid() = user_id);

-- PROJECT_COLLABORATORS: Users can only see their own collaborations
CREATE POLICY "project_collaborators_own_only" ON public.project_collaborators 
  FOR ALL USING (auth.uid() = user_id);

-- TEAMS: Users can only see/manage teams they own
CREATE POLICY "teams_owner_only" ON public.teams 
  FOR ALL USING (auth.uid() = owner_id);

-- TEAM_MEMBERS: Users can only see their own memberships
CREATE POLICY "team_members_own_only" ON public.team_members 
  FOR ALL USING (auth.uid() = user_id);

-- COMMENTS: Users can only see/manage their own comments
CREATE POLICY "comments_own_only" ON public.comments 
  FOR ALL USING (auth.uid() = user_id);

-- ACTIVITY_LOGS: Users can only see their own activity
CREATE POLICY "activity_logs_own_only" ON public.activity_logs 
  FOR ALL USING (auth.uid() = user_id);

-- TEAM_INVITATIONS: Users can only see invitations sent to their email
CREATE POLICY "team_invitations_own_email" ON public.team_invitations 
  FOR SELECT USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
