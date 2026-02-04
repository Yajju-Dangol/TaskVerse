import { supabase } from './supabase';
import type { Database } from './supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Task = Database['public']['Tables']['tasks']['Row'];
type Application = Database['public']['Tables']['applications']['Row'];
type Submission = Database['public']['Tables']['submissions']['Row'];
type Badge = Database['public']['Tables']['badges']['Row'];
type InternBadge = Database['public']['Tables']['intern_badges']['Row'];

// Shared types for computed views
export type TaskWithBusiness = Task & { business_name?: string };
export type SubmissionWithMeta = Submission & { intern_name?: string; task_title?: string };

// Profile functions
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) {
    console.error('Error updating profile:', error);
    return false;
  }

  return true;
}

export async function getBusinessStats(businessId: string) {
  const [
    { count: totalTasks },
    { count: activeTasks },
    { count: completedTasks },
    { data: profile }
  ] = await Promise.all([
    supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('business_id', businessId),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('business_id', businessId).eq('status', 'in-progress'),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('business_id', businessId).eq('status', 'completed'),
    supabase.from('profiles').select('average_rating').eq('id', businessId).single()
  ]);

  // Re-do intern count properly
  // Get all tasks for this business first
  const { data: tasks } = await supabase.from('tasks').select('id').eq('business_id', businessId);
  let totalInterns = 0;
  if (tasks && tasks.length > 0) {
    const taskIds = tasks.map(t => t.id);
    const { count } = await supabase
      .from('applications')
      .select('intern_id', { count: 'exact', head: true })
      .eq('status', 'accepted')
      .in('task_id', taskIds);
    totalInterns = count || 0;
  }

  return {
    totalTasks: totalTasks || 0,
    activeTasks: activeTasks || 0,
    completedTasks: completedTasks || 0,
    totalInterns: totalInterns || 0,
    averageRating: profile?.average_rating || 0
  };
}

// Task functions
export async function getTasks(filters?: {
  businessId?: string;
  status?: string;
  category?: string;
  difficulty?: string;
  search?: string;
}): Promise<TaskWithBusiness[]> {
  let query = supabase
    .from('tasks')
    .select(`
      *,
      profiles!tasks_business_id_fkey(name, business_name)
    `);

  if (filters?.businessId) {
    query = query.eq('business_id', filters.businessId);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.category && filters.category !== 'all') {
    query = query.eq('category', filters.category);
  }

  if (filters?.difficulty && filters.difficulty !== 'all') {
    query = query.eq('difficulty', filters.difficulty);
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  const { data, error } = await query.order('posted_date', { ascending: false });

  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }

  return (data || []).map((item: any) => ({
    ...item,
    business_name: item.profiles?.business_name || item.profiles?.name,
  }));
}

export async function getRecentCollaborators(businessId: string) {
  // Get tasks for this business
  const { data: tasks } = await supabase.from('tasks').select('id').eq('business_id', businessId);

  if (!tasks || tasks.length === 0) return [];

  const taskIds = tasks.map(t => t.id);

  // Get accepted applications for these tasks
  const { data: applications } = await supabase
    .from('submissions') // Actually submissions are better for "collaborators" who finished work
    .select(`
      intern_id,
      rating,
      profiles!submissions_intern_id_fkey (
        name,
        email
      )
    `)
    .in('task_id', taskIds)
    .eq('status', 'approved')
    .order('submitted_date', { ascending: false })
    .limit(5);

  if (!applications) return [];

  // Group by intern to avoid duplicates if they did multiple tasks? 
  // For simplicity, just return list.
  return applications.map((app: any) => ({
    name: app.profiles.name,
    email: app.profiles.email,
    rating: app.rating || 0,
    tasks_completed: 1 // Simplified
  }));
}

export async function getTask(taskId: string): Promise<TaskWithBusiness | null> {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      profiles!tasks_business_id_fkey(name, business_name)
    `)
    .eq('id', taskId)
    .single();

  if (error) {
    console.error('Error fetching task:', error);
    return null;
  }

  return {
    ...data,
    business_name: data.profiles?.business_name || data.profiles?.name,
  } as TaskWithBusiness;
}

export async function createTask(task: Database['public']['Tables']['tasks']['Insert']): Promise<Task | null> {
  const { data, error } = await supabase
    .from('tasks')
    .insert(task)
    .select()
    .single();

  if (error) {
    console.error('Error creating task:', error);
    return null;
  }

  return data;
}

export async function updateTask(taskId: string, updates: Partial<Task>): Promise<boolean> {
  const { error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId);

  if (error) {
    console.error('Error updating task:', error);
    return false;
  }

  return true;
}

export async function deleteTask(taskId: string): Promise<boolean> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);

  if (error) {
    console.error('Error deleting task:', error);
    return false;
  }

  return true;
}

// Application functions
export async function createApplication(application: Database['public']['Tables']['applications']['Insert']): Promise<Application | null> {
  // Ensure idempotency with UNIQUE(task_id, intern_id)
  const { data: existing, error: existingError } = await supabase
    .from('applications')
    .select('*')
    .eq('task_id', application.task_id)
    .eq('intern_id', application.intern_id)
    .maybeSingle();

  if (existingError) {
    console.error('Error checking existing application:', existingError);
  }

  if (existing) {
    // Already applied for this task; treat as success
    return existing as Application;
  }

  const { data, error } = await supabase
    .from('applications')
    .insert({
      ...application,
      status: 'accepted',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating application:', error);
    return null;
  }

  // Update task status to in-progress
  await supabase
    .from('tasks')
    .update({ status: 'in-progress' })
    .eq('id', application.task_id);

  return data;
}

export async function getApplications(filters?: {
  taskId?: string;
  internId?: string;
  status?: string;
  businessId?: string;
}): Promise<Application[]> {
  let query = supabase.from('applications').select('*');

  if (filters?.taskId) {
    query = query.eq('task_id', filters.taskId);
  }

  if (filters?.internId) {
    query = query.eq('intern_id', filters.internId);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.businessId) {
    // Limit applications to tasks owned by this business
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id')
      .eq('business_id', filters.businessId);

    if (tasks && tasks.length > 0) {
      query = query.in('task_id', tasks.map(t => t.id));
    } else {
      return [];
    }
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching applications:', error);
    return [];
  }

  return data || [];
}

export async function updateApplication(applicationId: string, updates: Partial<Application>): Promise<boolean> {
  const { error } = await supabase
    .from('applications')
    .update(updates)
    .eq('id', applicationId);

  if (error) {
    console.error('Error updating application:', error);
    return false;
  }

  return true;
}

// Submission functions
export async function createSubmission(submission: Database['public']['Tables']['submissions']['Insert']): Promise<Submission | null> {
  const { data, error } = await supabase
    .from('submissions')
    .insert({
      ...submission,
      submitted_date: new Date().toISOString().split('T')[0],
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating submission:', error);
    return null;
  }

  // Update task status to under-review
  await supabase
    .from('tasks')
    .update({ status: 'under-review' })
    .eq('id', submission.task_id);

  return data;
}

export async function getSubmissions(filters?: {
  taskId?: string;
  internId?: string;
  businessId?: string;
  status?: string;
}): Promise<SubmissionWithMeta[]> {
  let query = supabase
    .from('submissions')
    .select(`
      *,
      profiles!submissions_intern_id_fkey(name),
      tasks!submissions_task_id_fkey(title)
    `);

  if (filters?.taskId) {
    query = query.eq('task_id', filters.taskId);
  }

  if (filters?.internId) {
    query = query.eq('intern_id', filters.internId);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.businessId) {
    // Get submissions for tasks owned by this business
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id')
      .eq('business_id', filters.businessId);

    if (tasks && tasks.length > 0) {
      query = query.in('task_id', tasks.map(t => t.id));
    } else {
      return [];
    }
  }

  const { data, error } = await query.order('submitted_date', { ascending: false });

  if (error) {
    console.error('Error fetching submissions:', error);
    return [];
  }

  return (data || []).map((item: any) => ({
    ...item,
    intern_name: item.profiles?.name,
    task_title: item.tasks?.title,
  }));
}

export async function updateSubmission(submissionId: string, updates: Partial<Submission>): Promise<boolean> {
  const { error } = await supabase
    .from('submissions')
    .update(updates)
    .eq('id', submissionId);

  if (error) {
    console.error('Error updating submission:', error);
    return false;
  }

  return true;
}

// Intern portfolio
export interface InternPortfolioItem {
  id: string;
  task_title: string;
  business_name: string;
  completed_date: string;
  description: string;
  task_description: string;
  review: string | null;
  skills: string[];
  rating: number;
  points: number;
}

export async function getInternPortfolio(internId: string): Promise<InternPortfolioItem[]> {
  const { data, error } = await supabase
    .from('submissions')
    .select(`
      id,
      description,
      rating,
      feedback,
      submitted_date,
      status,
      task:task_id (
        title,
        description,
        points,
        skills,
        business:business_id (
          business_name,
          name
        )
      )
    `)
    .eq('intern_id', internId)
    .eq('status', 'approved')
    .order('submitted_date', { ascending: false });

  if (error) {
    console.error('Error fetching intern portfolio:', error);
    return [];
  }

  return (data || []).map((item: any) => {
    const task = item.task || {};
    const businessProfile = task.business || {};

    return {
      id: item.id as string,
      task_title: task.title as string,
      business_name: (businessProfile.business_name || businessProfile.name || 'Business') as string,
      completed_date: item.submitted_date as string,
      description: item.description as string, // Intern's submission description
      task_description: task.description as string,
      review: item.feedback as string | null,
      skills: (task.skills || []) as string[],
      rating: (item.rating || 0) as number,
      points: (task.points || 0) as number,
    };
  });
}

// Badge functions
export async function getBadges(): Promise<Badge[]> {
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .order('requirement_value', { ascending: true });

  if (error) {
    console.error('Error fetching badges:', error);
    return [];
  }

  return data || [];
}

export async function getInternBadges(internId: string): Promise<InternBadge[]> {
  const { data, error } = await supabase
    .from('intern_badges')
    .select('*')
    .eq('intern_id', internId);

  if (error) {
    console.error('Error fetching intern badges:', error);
    return [];
  }

  return data || [];
}



// Leaderboard function
export async function getLeaderboard(limit: number = 50): Promise<Array<{
  rank: number;
  intern_id: string;
  name: string;
  points: number;
  level: number;
  tasks_completed: number;
  badges: number;
}>> {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      name,
      points,
      level
    `)
    .eq('role', 'intern')
    .order('points', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }

  // Get additional stats for each intern
  const leaderboard = await Promise.all(
    (data || []).map(async (profile, index) => {
      const [completedSubmissions, badges] = await Promise.all([
        supabase
          .from('submissions')
          .select('id', { count: 'exact', head: true })
          .eq('intern_id', profile.id)
          .eq('status', 'approved'),
        supabase
          .from('intern_badges')
          .select('id', { count: 'exact', head: true })
          .eq('intern_id', profile.id),
      ]);

      return {
        rank: index + 1,
        intern_id: profile.id,
        name: profile.name,
        points: profile.points || 0,
        level: profile.level || 1,
        tasks_completed: completedSubmissions.count || 0,
        badges: badges.count || 0,
      };
    })
  );

  // Sort leaderboard by points > badges > tasks_completed
  leaderboard.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.badges !== a.badges) return b.badges - a.badges;
    return b.tasks_completed - a.tasks_completed;
  });

  // Re-assign ranks
  return leaderboard.map((entry, index) => ({
    ...entry,
    rank: index + 1
  }));
}

// File upload function
export async function uploadFile(file: File, userId: string): Promise<string | null> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('submissions')
    .upload(fileName, file);

  if (error) {
    console.error('Error uploading file:', error);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('submissions')
    .getPublicUrl(data.path);

  return publicUrl;
}

