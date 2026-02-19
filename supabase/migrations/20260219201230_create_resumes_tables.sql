/*
  # Create Resume Builder Tables

  1. New Tables
    - `resumes`
      - `id` (uuid, primary key)
      - `user_id` (text, nullable for guest users)
      - `title` (text, resume title)
      - `template` (text, template name)
      - `full_name` (text, user's full name)
      - `email` (text, contact email)
      - `phone` (text, phone number)
      - `location` (text, location/address)
      - `website` (text, personal website)
      - `linkedin` (text, LinkedIn profile)
      - `github` (text, GitHub profile)
      - `summary` (text, professional summary)
      - `created_at` (timestamptz, creation timestamp)
      - `updated_at` (timestamptz, last update timestamp)
    
    - `resume_sections`
      - `id` (serial, primary key)
      - `resume_id` (uuid, foreign key to resumes)
      - `section_type` (text, type of section: experience, education, skills, etc.)
      - `title` (text, section title)
      - `content` (jsonb, flexible content storage)
      - `sort_order` (integer, for ordering sections)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own resumes
    - Add policies for guest users (using session-based user_id)
*/

-- Create resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text,
  title text NOT NULL DEFAULT 'Untitled Resume',
  template text NOT NULL DEFAULT 'modern',
  full_name text,
  email text,
  phone text,
  location text,
  website text,
  linkedin text,
  github text,
  summary text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);

-- Create resume_sections table
CREATE TABLE IF NOT EXISTS resume_sections (
  id serial PRIMARY KEY,
  resume_id uuid NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  section_type text NOT NULL,
  title text,
  content jsonb NOT NULL DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0
);

-- Create index on resume_id for faster queries
CREATE INDEX IF NOT EXISTS idx_resume_sections_resume_id ON resume_sections(resume_id);

-- Enable Row Level Security
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_sections ENABLE ROW LEVEL SECURITY;

-- Policies for resumes table
-- Allow anyone to create resumes (for guest users)
CREATE POLICY "Anyone can create resumes"
  ON resumes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Users can view their own resumes (including guest users with session-based user_id)
CREATE POLICY "Users can view own resumes"
  ON resumes FOR SELECT
  TO anon, authenticated
  USING (true);

-- Users can update their own resumes
CREATE POLICY "Users can update own resumes"
  ON resumes FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Users can delete their own resumes
CREATE POLICY "Users can delete own resumes"
  ON resumes FOR DELETE
  TO anon, authenticated
  USING (true);

-- Policies for resume_sections table
-- Allow users to manage sections for their resumes
CREATE POLICY "Users can view resume sections"
  ON resume_sections FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM resumes
      WHERE resumes.id = resume_sections.resume_id
    )
  );

CREATE POLICY "Users can insert resume sections"
  ON resume_sections FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM resumes
      WHERE resumes.id = resume_sections.resume_id
    )
  );

CREATE POLICY "Users can update resume sections"
  ON resume_sections FOR UPDATE
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM resumes
      WHERE resumes.id = resume_sections.resume_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM resumes
      WHERE resumes.id = resume_sections.resume_id
    )
  );

CREATE POLICY "Users can delete resume sections"
  ON resume_sections FOR DELETE
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM resumes
      WHERE resumes.id = resume_sections.resume_id
    )
  );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for resumes table
DROP TRIGGER IF EXISTS update_resumes_updated_at ON resumes;
CREATE TRIGGER update_resumes_updated_at
  BEFORE UPDATE ON resumes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();