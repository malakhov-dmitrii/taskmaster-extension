<script lang="ts">
  import { useMutation } from '@sveltestack/svelte-query';
  import { pb, supabase } from 'src/lib/db';
  import type { SupabaseTodo, Task, TodoItemResponsePromise } from 'src/lib/types';
  import { onMount } from 'svelte';
  import dayjs from 'dayjs';
  import utc from 'dayjs/plugin/utc';
  import timezone from 'dayjs/plugin/timezone';
  import Button from 'src/ui/Button.svelte';

  dayjs.extend(utc);
  dayjs.extend(timezone);

  export let id: string;
  let data: Task | null = null;
  let dateTime = null;
  let loading = true;

  onMount(async () => {
    data = await pb.collection('tasks').getOne<Task>(id);
    loading = false;
    if (data.date) dateTime = new Date(data.date).toISOString().slice(0, 16);
  });

  let updateItemMutation = useMutation(
    'updateItem',
    () => {
      const dateTime = data.date ? dayjs.tz(data.date) : null;
      console.log({ data });

      return Promise.resolve(
        pb.collection('tasks').update(id, {
          title: data.title,
          description: data.description,
          ...(dateTime && { date: dateTime.toISOString() }),
        }),
      );
    },
    {
      onMutate: () => {
        loading = true;
      },
      onSuccess: (res) => {
        data = res.data;
      },
      onSettled: () => {
        loading = false;
      },
    },
  );

  $: {
    console.log(dateTime);
  }
</script>

{#if loading}
  <p class="text-center font-bold animate-pulse">Loading...</p>
{:else}
  <main class="space-y-4">
    <h1 class="text-2xl font-medium">Edit item</h1>
    <div>
      <label>
        <p class="font-medium text-sm">Title</p>
        <input
          bind:value={data.title}
          type="text"
          class="mt-2 flex h-10 w-full rounded-md border border-slate-300 bg-transparent py-2 px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </label>
    </div>
    <div>
      <label>
        <p class="font-medium text-sm">Description</p>
        <textarea
          bind:value={data.description}
          name="description"
          class="mt-2 flex w-full rounded-md border border-slate-300 bg-transparent py-2 px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          rows="5"
        />
      </label>
    </div>
    <div>
      <label>
        <p class="font-medium text-sm">Date</p>
        <input
          bind:value={dateTime}
          type="datetime-local"
          class="mt-2 flex h-10 w-full rounded-md border border-slate-300 bg-transparent py-2 px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </label>
    </div>
    <!-- <div>
      <label class="flex items-center space-x-2">
        <input type="checkbox" bind:checked={data.client_inbox} class="rounded border-gray-300" />
        <p>
          Assigned to
          {#if !data.client_inbox}
            client
          {:else}
            assistant
          {/if}
        </p>
      </label>
    </div> -->

    <div class="flex justify-between">
      <Button
        on:click={() => {
          $updateItemMutation.mutateAsync().then(() => {
            window.close();
          });
        }}>Save & close</Button
      >
      <div>
        <Button
          variant="subtle"
          on:click={() => {
            $updateItemMutation.mutate();
          }}>Save</Button
        >
        <Button
          variant="subtle"
          on:click={() => {
            window.close();
          }}>Close</Button
        >
      </div>
    </div>
  </main>

  <!-- {#if $updateItemMutation.isError}
    <p class="text-red-500">Error: {$updateItemMutation.error}</p>
  {/if}
  {#if $updateItemMutation.status === 'success'}
    <p class="text-green-500">Saved!</p>
  {/if} -->
{/if}
