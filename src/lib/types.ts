import type { Database } from 'src/lib/database.types';

export type Todo = Database['public']['Tables']['pa_todos']['Row'];
export type TodoItemResponse = { data?: Todo };
export type TodosResponse = { data?: Todo[] };
export type TodosResponsePromise = Promise<TodosResponse>;
export type TodoItemResponsePromise = Promise<TodoItemResponse>;
