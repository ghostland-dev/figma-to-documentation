-- Complete fix for infinite recursion in RLS policies
-- This script completely removes all problematic policies and creates simple, direct policies

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "projects_select_access" ON public.projects;
DROP POLICY IF EXISTS "projects_select_own" ON public.projects;
DROP POLICY IF EXISTS "projects_select_collaborator" ON public.projects;
DROP POLICY IF EXISTS "projects_select_team_member" ON public.projects;
DROP POLICY IF EXISTS "projects_insert_own" ON public.projects;
DROP POLICY IF EXISTS "projects_update_own_or_collaborator" ON public.projects;
DROP POLICY IF EXISTS "projects_delete_own" ON public.projects;

DROP POLICY IF EXISTS "team_members_select_member" ON public.team_members;
DROP POLICY IF EXISTS "team_members_select_own_or_same_team" ON public.team_members;
DROP POLICY IF EXISTS "team_members_insert_admin" ON public.team_members;

DROP POLICY IF EXISTS "project_collaborators_select_involved" ON public.project_collaborators;
DROP POLICY IF EXISTS "project_collaborators_select_own_or_owner" ON public.project_collaborators;

-- Create simple, non-recursive policies for projects
-- Users can see their own projects
CREATE POLICY "projects_select_own" ON public.projects 
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own projects
CREATE POLICY "projects_insert_own" ON public.projects 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own projects
CREATE POLICY "projects_update_own" ON public.projects 
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own projects
CREATE POLICY "projects_delete_own" ON public.projects 
  FOR DELETE USING (auth.uid() = user_id);

-- Simple policy for project_collaborators - users can see collaborations they're part of
CREATE POLICY "project_collaborators_select_own" ON public.project_collaborators 
  FOR SELECT USING (user_id = auth.uid());

-- Project owners can see all collaborators on their projects
CREATE POLICY "project_collaborators_select_as_owner" ON public.project_collaborators 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id AND p.user_id = auth.uid()
    )
  );

-- Project owners can manage collaborators
CREATE POLICY "project_collaborators_insert_as_owner" ON public.project_collaborators 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id AND p.user_id = auth.uid()
    )
  );

-- Simple policy for team_members - users can see their own memberships
CREATE POLICY "team_members_select_own" ON public.team_members 
  FOR SELECT USING (user_id = auth.uid());

-- Team owners can see all members
CREATE POLICY "team_members_select_as_owner" ON public.team_members 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.teams t 
      WHERE t.id = team_id AND t.owner_id = auth.uid()
    )
  );

-- Policies for other tables remain simple
CREATE POLICY "teams_select_own" ON public.teams 
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "teams_insert_own" ON public.teams 
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "teams_update_own" ON public.teams 
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "teams_delete_own" ON public.teams 
  FOR DELETE USING (auth.uid() = owner_id);

-- Comments policies
CREATE POLICY "comments_select_own_projects" ON public.comments 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "comments_insert_own" ON public.comments 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
