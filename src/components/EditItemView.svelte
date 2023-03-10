<script lang="ts">
  import { useMutation } from '@sveltestack/svelte-query';
  import { supabase } from 'src/lib/db';
  import type { Todo, TodoItemResponsePromise } from 'src/lib/types';
  import { onMount } from 'svelte';
  import dayjs from 'dayjs';
  import utc from 'dayjs/plugin/utc';
  import timezone from 'dayjs/plugin/timezone';

  dayjs.extend(utc);
  dayjs.extend(timezone);

  export let id: string;
  let data: Todo | null = null;
  let dateTime = null;
  let loading = true;

  onMount(async () => {
    const { data: reqData } = await supabase.from('pa_todos').select().eq('id', id).single();
    loading = false;
    data = reqData;
    if (data.date) dateTime = new Date(data.date).toISOString().slice(0, 16);
  });

  let updateItemMutation = useMutation(
    'updateItem',
    () => {
      const dateTime = dayjs.tz(data.date);

      return Promise.resolve(
        supabase
          .from('pa_todos')
          .update({ ...data, date: dateTime })
          .eq('id', id)
          .select()
          .single()
      );
    },
    {
      onMutate: () => {
        loading = true;
      },
      onSuccess: res => {
        data = res.data;
      },
      onSettled: () => {
        loading = false;
      },
    }
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
        <input bind:value={data.title} type="text" class="w-full rounded border-gray-300" />
      </label>
    </div>
    <div>
      <label>
        <p class="font-medium text-sm">Description</p>
        <textarea bind:value={data.description} name="description" class="w-full p-3 rounded border-gray-300" rows="5" />
      </label>
    </div>
    <div>
      <label>
        <p class="font-medium text-sm">Date</p>
        <input bind:value={dateTime} type="datetime-local" class="w-full rounded border-gray-300" />
      </label>
    </div>
    <div>
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
    </div>

    <button
      on:click={() => {
        $updateItemMutation.mutate();
      }}
      class="w-full bg-blue-500 hover:bg-blue-600 transition py-2 text-white font-medium rounded shadow">Save</button
    >
  </main>

  {#if $updateItemMutation.isError}
    <p class="text-red-500">Error: {$updateItemMutation.error}</p>
  {/if}
  {#if $updateItemMutation.status === 'success'}
    <p class="text-green-500">Saved!</p>
  {/if}
{/if}
