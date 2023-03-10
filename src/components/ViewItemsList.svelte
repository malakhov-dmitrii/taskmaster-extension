<script lang="ts">
  import { supabase } from 'src/lib/db';
  import type { Database } from 'src/lib/database.types';
  import _ from 'lodash';
  import ListItem from 'src/components/ListItem.svelte';
  import { useSWR } from 'sswr';
  import type { Todo, TodosResponse, TodosResponsePromise } from 'src/lib/types';
  import { useQuery, useMutation, useQueryClient } from '@sveltestack/svelte-query';

  export let chat_id: number;

  const queryClient = useQueryClient();
  const query = useQuery('todos', () => Promise.resolve(supabase.from('pa_todos').select().eq('chat_id', chat_id)));
  const deleteMutation = useMutation((id: number) => Promise.resolve(supabase.from('pa_todos').delete().eq('id', id)), {
    onMutate: async id => {
      await queryClient.cancelQueries('todos');
      const previousTodos = queryClient.getQueryData<TodosResponse>('todos');
      queryClient.setQueryData('todos', (old: TodosResponse) => {
        return old.data?.filter(i => i.id !== id);
      });

      return { previousTodos };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData('todos', context.previousTodos);
    },
    onSettled: () => {
      queryClient.invalidateQueries('todos');
    },
  });

  $: outboxTodos = _.sortBy(
    $query.data?.data?.filter(i => !i.client_inbox),
    i => i.inserted_at
  ).reverse();
  $: inboxTodos = _.sortBy(
    $query.data?.data?.filter(i => i.client_inbox),
    i => i.inserted_at
  ).reverse();
</script>

{#if $query.isLoading}
  <div>
    <p class="text-center font-bold animate-pulse my-8">Loading...</p>
  </div>
{/if}

{#if $query.data?.data?.length > 0}
  <p class="font-bold text-xl">Inbox:</p>
  <div class="space-y-4 mt-4 w-full">
    {#each inboxTodos as todo}
      <ListItem
        {todo}
        on:check={() => {
          // loading = true;
          supabase
            .from('pa_todos')
            .update({ is_complete: !todo.is_complete })
            .eq('id', todo.id)
            .select()
            .then(res => {
              console.log('revalidate');
              todo.is_complete = !todo.is_complete;
              $query.refetch();
            });
        }}
        on:delete={() => $deleteMutation.mutate(todo.id)}
      />
    {/each}

    {#if inboxTodos.length === 0}
      <p class="text-center my-8">There are no items at this moment.</p>
    {/if}
  </div>
  <p class="font-bold text-xl">Outbox:</p>
  <div class="space-y-4 mt-4 w-full">
    {#each outboxTodos as todo}
      <ListItem
        {todo}
        on:check={() => {
          // loading = true;
          supabase
            .from('pa_todos')
            .update({ is_complete: !todo.is_complete })
            .eq('id', todo.id)
            .select()
            .then(res => {
              console.log('revalidate');
              todo.is_complete = !todo.is_complete;
              $query.refetch();
            });
        }}
        on:delete={() => $deleteMutation.mutate(todo.id)}
      />
    {/each}

    {#if outboxTodos.length === 0}
      <p class="text-center my-8">There are no items at this moment.</p>
    {/if}
  </div>
{:else if !$query.isLoading}
  <p class="text-center my-8">
    There are no items at this moment. You can add them by selecting text on page, right clicking and selecting "New task from text".
  </p>
{/if}
