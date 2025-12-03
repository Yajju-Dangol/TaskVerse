# TaskVerse Platform - Supabase Setup Guide

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

To get these values:
1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the "Project URL" as `VITE_SUPABASE_URL`
4. Copy the "anon public" key as `VITE_SUPABASE_ANON_KEY`

## Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Run the SQL script to create all tables, policies, and triggers

## Storage Setup (for file uploads)

1. Go to Storage in your Supabase dashboard
2. Create a new bucket named `submissions`
3. Set it to public or configure policies as needed
4. Add the following policy:

```sql
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'submissions' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'submissions' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## Running the Application

1. Install dependencies: `npm install`
2. Set up your `.env` file with Supabase credentials
3. Run the database schema SQL script in Supabase
4. Start the development server: `npm run dev`

## Features Implemented

- ✅ User authentication (signup/login/logout)
- ✅ Role-based access (Intern/Business)
- ✅ Task management (create, view, edit, delete)
- ✅ Application system (interns apply to tasks)
- ✅ Submission system (interns submit work)
- ✅ Review system (businesses review and rate submissions)
- ✅ Points and leveling system
- ✅ Badge system
- ✅ Leaderboard
- ✅ Portfolio/profile pages
- ✅ File uploads for submissions

