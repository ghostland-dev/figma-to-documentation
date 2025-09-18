-- Fix infinite recursion in RLS policies
-- Drop the problematic policies and recreate them with simpler logic

-- Drop existing problematic policies
DROP POLICY IF EXISTS "projects_select_access" ON public.projects;
DROP POLICY IF EXISTS "team_members_select_member" ON public.team_members;
DROP POLICY IF EXISTS "project_collaborators_select_involved" ON public.project_collaborators;

-- Create simpler, non-recursive policies for projects
-- Policy 1: Users can see their own projects
CREATE POLICY "projects_select_own" ON public.projects 
  FOR SELECT USING (auth.uid() = user_id);

-- Policy 2: Users can see projects they collaborate on (direct check, no recursion)
CREATE POLICY "projects_select_collaborator" ON public.projects 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_collaborators pc 
      WHERE pc.project_id = projects.id AND pc.user_id = auth.uid()
    )
  );

-- Policy 3: Users can see team projects they're members of (direct check, no recursion)
CREATE POLICY "projects_select_team_member" ON public.projects 
  FOR SELECT USING (
    team_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE tm.team_id = projects.team_id AND tm.user_id = auth.uid() AND tm.status = 'active'
    )
  );

-- Fix team_members policy to avoid self-reference
CREATE POLICY "team_members_select_own_or_same_team" ON public.team_members 
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.teams t 
      WHERE t.id = team_members.team_id AND t.owner_id = auth.uid()
    )
  );

-- Fix project_collaborators policy to avoid circular reference
CREATE POLICY "project_collaborators_select_own_or_owner" ON public.project_collaborators 
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id AND p.user_id = auth.uid()
    )
  );

-- Keep the other policies for projects (insert, update, delete)
CREATE POLICY "projects_insert_own" ON public.projects 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "projects_update_own_or_collaborator" ON public.projects 
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.project_collaborators pc 
      WHERE pc.project_id = projects.id AND pc.user_id = auth.uid() AND pc.role IN ('owner', 'editor')
    )
  );

CREATE POLICY "projects_delete_own" ON public.projects 
  FOR DELETE USING (auth.uid() = user_id);
