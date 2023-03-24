<script lang="ts">
  import { supabase } from 'src/lib/db';
  import type { Database } from 'src/lib/database.types';
  import _ from 'lodash';
  import ListItem from 'src/components/ListItem.svelte';
  import { useSWR } from 'sswr';
  import type { SupabaseTodo, Task, TodosResponse, TodosResponsePromise } from 'src/lib/types';
  import { useQuery, useMutation, useQueryClient } from '@sveltestack/svelte-query';
  import PocketBase from 'pocketbase';
  import EmptyList from 'src/components/EmptyList.svelte';

  export const pb = new PocketBase('https://pocketbase-malakhov.fly.dev');

  export let session_id: string;
  export let profile_id: string;

  const queryClient = useQueryClient();
  $: key = `todos/${session_id}/${profile_id}`;
  const query = useQuery(`todos/${session_id}/${profile_id}`, async () => {
    return Promise.resolve(pb.collection('tasks').getFullList<Task>({ filter: `session.id="${session_id}"` }));
  });
  const deleteMutation = useMutation((id: string) => Promise.resolve(pb.collection('tasks').delete(id)), {
    onMutate: async (id) => {
      await queryClient.cancelQueries(key);
      const previousTodos = queryClient.getQueryData<Task[]>(key);
      queryClient.setQueryData(key, (old: Task[]) => {
        console.log({ previousTodos });

        return (old ?? previousTodos)?.filter((i) => i.id !== id);
      });

      return { previousTodos };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(key, context.previousTodos);
    },
    onSettled: () => {
      queryClient.invalidateQueries(key);
    },
  });

  $: {
    console.log({ profile_id, session_id });
  }

  const handleCheck = async (todo: Task) => {
    await pb.collection('tasks').update(todo.id, { is_completed: !todo.is_completed });
    todo.is_completed = !todo.is_completed;
    $query.refetch();
  };
</script>

{#if $query.isLoading}
  <div>
    <p class="text-center font-bold animate-pulse my-8">Loading...</p>
  </div>
{/if}

{#if $query.data?.length > 0}
  <p class="font-bold text-xl mt-4">Tasks list:</p>
  <div class="space-y-4 mt-4 w-full">
    {#each $query.data as todo}
      <ListItem {todo} on:check={() => handleCheck(todo)} on:delete={() => $deleteMutation.mutate(todo.id)} />
    {/each}

    {#if $query.data.length === 0}
      <p class="text-center my-8">There are no items at this moment.</p>
    {/if}
  </div>
  <!-- <p class="font-bold text-xl">Outbox:</p>
  <div class="space-y-4 mt-4 w-full">
    {#each outboxTodos as todo}
      <ListItem {todo} on:check={() => handleCheck(todo)} on:delete={() => $deleteMutation.mutate(todo.id)} />
    {/each}

    {#if outboxTodos.length === 0}
      <p class="text-center my-8">There are no items at this moment.</p>
    {/if}
  </div> -->
{:else if !$query.isLoading}
  <EmptyList />
{/if}
