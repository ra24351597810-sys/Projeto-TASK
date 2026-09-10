/*
# Smart Task Manager - Database Schema

## Overview
Creates the complete schema for a multi-user Smart Task Manager application with Brazilian Portuguese localization. Each user has their own private task data isolated via Row Level Security.

## New Tables

### 1. `categories`
- `id` (uuid, primary key)
- `user_id` (uuid, references auth.users, defaults to authenticated user)
- `name` (text, not null) - Category name in Portuguese
- `color` (text, not null) - Hex color for visual identification
- `icon` (text) - Lucide icon name
- `is_default` (boolean, default false) - Whether it's a built-in category
- `created_at` (timestamptz)

### 2. `tasks`
- `id` (uuid, primary key)
- `user_id` (uuid, references auth.users, defaults to authenticated user)
- `title` (text, not null) - Task title
- `description` (text) - Task description
- `due_date` (date) - Due date
- `due_time` (time) - Due time
- `priority` (text, not null, default 'media') - One of: baixa, media, alta, urgente
- `category_id` (uuid, references categories) - Category association
- `tags` (text[]) - Array of tags
- `estimated_time` (integer) - Estimated time in minutes
- `is_recurring` (boolean, default false) - Whether task repeats
- `recurrence_pattern` (text) - daily, weekly, monthly
- `notes` (text) - Additional notes
- `status` (text, not null, default 'pendente') - One of: pendente, concluida
- `planned_period` (text) - One of: manha, tarde, noite (for daily planner)
- `sort_order` (integer, default 0) - Ordering within planner
- `created_at` (timestamptz)
- `completed_at` (timestamptz) - When task was completed

### 3. `subtasks`
- `id` (uuid, primary key)
- `task_id` (uuid, references tasks ON DELETE CASCADE)
- `title` (text, not null) - Subtask title
- `completed` (boolean, default false)
- `sort_order` (integer, default 0)
- `created_at` (timestamptz)

### 4. `notifications`
- `id` (uuid, primary key)
- `user_id` (uuid, references auth.users, defaults to authenticated user)
- `title` (text, not null) - Notification title
- `message` (text) - Notification body
- `type` (text, not null) - One of: prazo, atrasada, importante, lembrete, agendada
- `read` (boolean, default false) - Whether notification was read
- `task_id` (uuid, references tasks ON DELETE SET NULL) - Related task
- `created_at` (timestamptz)

## Security
- RLS enabled on all tables.
- All tables scoped to `authenticated` users with ownership checks via `auth.uid() = user_id`.
- `subtasks` scoped through parent task ownership check.
- `notifications` scoped to owning user.
- Owner columns default to `auth.uid()` so inserts work without explicitly passing user_id.
*/

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#3b82f6',
  icon text DEFAULT 'Folder',
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_categories" ON categories;
CREATE POLICY "select_own_categories" ON categories FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_categories" ON categories;
CREATE POLICY "insert_own_categories" ON categories FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_categories" ON categories;
CREATE POLICY "update_own_categories" ON categories FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_categories" ON categories;
CREATE POLICY "delete_own_categories" ON categories FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  due_date date,
  due_time time,
  priority text NOT NULL DEFAULT 'media' CHECK (priority IN ('baixa', 'media', 'alta', 'urgente')),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  tags text[] DEFAULT '{}',
  estimated_time integer DEFAULT 0,
  is_recurring boolean NOT NULL DEFAULT false,
  recurrence_pattern text,
  notes text,
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'concluida')),
  planned_period text CHECK (planned_period IN ('manha', 'tarde', 'noite')),
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_tasks" ON tasks;
CREATE POLICY "select_own_tasks" ON tasks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_tasks" ON tasks;
CREATE POLICY "insert_own_tasks" ON tasks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_tasks" ON tasks;
CREATE POLICY "update_own_tasks" ON tasks FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_tasks" ON tasks;
CREATE POLICY "delete_own_tasks" ON tasks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Subtasks table
CREATE TABLE IF NOT EXISTS subtasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_subtasks" ON subtasks;
CREATE POLICY "select_own_subtasks" ON subtasks FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM tasks WHERE tasks.id = subtasks.task_id AND tasks.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_subtasks" ON subtasks;
CREATE POLICY "insert_own_subtasks" ON subtasks FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM tasks WHERE tasks.id = subtasks.task_id AND tasks.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_subtasks" ON subtasks;
CREATE POLICY "update_own_subtasks" ON subtasks FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM tasks WHERE tasks.id = subtasks.task_id AND tasks.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM tasks WHERE tasks.id = subtasks.task_id AND tasks.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_subtasks" ON subtasks;
CREATE POLICY "delete_own_subtasks" ON subtasks FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM tasks WHERE tasks.id = subtasks.task_id AND tasks.user_id = auth.uid())
  );

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text,
  type text NOT NULL DEFAULT 'lembrete' CHECK (type IN ('prazo', 'atrasada', 'importante', 'lembrete', 'agendada')),
  read boolean NOT NULL DEFAULT false,
  task_id uuid REFERENCES tasks(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_category_id ON tasks(category_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
