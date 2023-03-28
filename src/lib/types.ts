import type { Database } from 'src/lib/database.types';

export type SupabaseTodo = Database['public']['Tables']['pa_todos']['Row'];
export type TodoItemResponse = { data?: SupabaseTodo };
export type TodosResponse = { data?: SupabaseTodo[] };
export type TodosResponsePromise = Promise<TodosResponse>;
export type TodoItemResponsePromise = Promise<TodoItemResponse>;

export interface Profile {
  id: string;

  name?: string;
  telegram_id?: string;
  sessions?: string[];
  verified?: boolean;
  full_name?: string;
  username?: string;
}

export interface Session {
  id: string;
  users: string[];
  expand?: {
    users: Profile[];
  };
}

export interface SessionWithUser extends Session {
  expand: {
    users: Profile[];
  };
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  session: string;
  date: string;
  etcDate: string;
  priority: boolean;
  assigned_to: string;
  is_completed: boolean;
  created: string;
}

export interface CreateTaskDTO {
  title: string;
  description?: string;
  session: string;
  date?: string;
  assigned_to?: string;
}
