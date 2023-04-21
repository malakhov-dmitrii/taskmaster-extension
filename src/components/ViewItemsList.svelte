<script lang="ts">
  import _ from 'lodash';
  import ListItem from 'src/components/ListItem.svelte';
  import type { Task } from 'src/lib/types';
  import { useQuery, useMutation, useQueryClient } from '@sveltestack/svelte-query';
  import PocketBase from 'pocketbase';
  import EmptyList from 'src/components/EmptyList.svelte';
  import { pick } from 'lodash';
  import { updateTasksBadge } from 'src/lib/updateTasksBadge';

  export const pb = new PocketBase('https://pocketbase-malakhov.fly.dev');

  export let session_id: string;
  export let profile_id: string;

  const queryClient = useQueryClient();

  const query = useQuery(['todos', session_id, profile_id], async () => {
    console.log('query');

    return Promise.resolve(
      pb.collection('tasks').getFullList<Task>({ filter: `session.id="${session_id}"`, expand: 'session' }),
    );
  });

  const deleteMutation = useMutation((id: string) => Promise.resolve(pb.collection('tasks').delete(id)), {
    onMutate: async (id) => {
      await queryClient.cancelQueries(['todos', session_id, profile_id]);
      const previousTodos = queryClient.getQueryData<Task[]>(['todos', session_id, profile_id]);
      queryClient.setQueryData(['todos', session_id, profile_id], (old: Task[]) => {
        console.log({ previousTodos });

        return (old ?? previousTodos)?.filter((i) => i.id !== id);
      });

      return { previousTodos };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['todos', session_id, profile_id], context.previousTodos);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['todos', session_id, profile_id]);
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        updateTasksBadge(tabs[0].url);
      });
    },
  });

  const handleToggleMutation = async (id: string) => {
    const task = await pb.collection('tasks').getOne<Task>(id, { expand: 'session' });
    const secondUserId = task.expand.session?.users.find((i) => i !== profile_id);

    const previousTodos = queryClient.getQueryData<Task[]>(['todos', session_id, profile_id]);
    queryClient.setQueryData(['todos', session_id, profile_id], (old: Task[]) => {
      return (old ?? previousTodos)?.map((i) => {
        if (i.id === id) {
          return { ...i, assigned_to: i.assigned_to === profile_id ? secondUserId : profile_id };
        }

        return i;
      });
    });

    if (task.assigned_to !== profile_id) {
      await Promise.resolve(pb.collection('tasks').update(id, { assigned_to: profile_id }));
    } else if (task.assigned_to === profile_id && secondUserId) {
      await Promise.resolve(pb.collection('tasks').update(id, { assigned_to: secondUserId }));
    } else {
      await Promise.resolve(pb.collection('tasks').update(id, { assigned_to: profile_id }));
    }

    // delay 500 ms to show animation
    await new Promise((resolve) => setTimeout(resolve, 500));
    return;
  };

  const toggleAssignMutation = useMutation(handleToggleMutation, {
    // onMutate: async (id) => {
    //   await queryClient.cancelQueries(['todos', session_id, profile_id]);
    //   const previousTodos = queryClient.getQueryData<Task[]>(['todos', session_id, profile_id]);
    //   const task = previousTodos.find((i) => i.id === id);
    //   const secondUserId = task.expand.session?.users.find((i) => i !== profile_id);

    //   console.log({ task, secondUserId });

    //   queryClient.setQueryData(['todos', session_id, profile_id], (old: Task[]) => {
    //     return (old ?? previousTodos)?.map((i) => {
    //       if (i.id === id) {
    //         return { ...i, assigned_to: i.assigned_to === profile_id ? secondUserId : profile_id };
    //       }

    //       return i;
    //     });
    //   });

    //   return { previousTodos };
    // },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['todos', session_id, profile_id], context.previousTodos);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['todos', session_id, profile_id]);
    },
  });

  const handleCheck = async (todo: Task) => {
    await pb.collection('tasks').update(todo.id, { is_completed: !todo.is_completed });
    todo.is_completed = !todo.is_completed;
    $query.refetch();
  };
</script>

{#if $query.isLoading}
  <div>
    <p class="text-center font-bold animate-pulse my-8">Loading tasks...</p>
  </div>
{/if}

{#if $query.data?.length > 0}
  <!-- <p class="font-bold text-xl mt-4">Tasks list:</p> -->
  <div class="space-y-4 mt-4 w-full">
    {#each $query.data as todo}
      <ListItem
        {profile_id}
        {todo}
        on:edit
        on:toggleAssignee={() => $toggleAssignMutation.mutate(todo.id)}
        on:check={() => handleCheck(todo)}
        on:delete={() => $deleteMutation.mutate(todo.id)}
      />
    {/each}

    {#if $query.data.length === 0}
      <p class="text-center my-8">There are no items at this moment.</p>
    {/if}
  </div>
{:else if !$query.isLoading}
  <EmptyList />
{/if}
