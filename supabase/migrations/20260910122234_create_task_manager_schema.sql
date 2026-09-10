/*
# Smart Task Manager - Database Schema


## Overview
Creates the complete schema for a multi-user Smart Task Manager application with Brazilian Portuguese localization.
Each user has their own private task data isolated via Row Level Security.


## New Tables


### 1. `categories`
- `id` (uuid, primary key)
- `user_id` (uuid, references auth.users, defaults to authenticated user)
- `name` (text, not null) - Category name
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