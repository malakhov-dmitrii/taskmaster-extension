<script lang="ts">
  import { useMutation, useQueryClient } from '@sveltestack/svelte-query';
  import { pb, supabase } from 'src/lib/db';
  import type { SupabaseTodo, Task, TodoItemResponsePromise } from 'src/lib/types';
  import { createEventDispatcher, onMount } from 'svelte';
  import dayjs from 'dayjs';
  import utc from 'dayjs/plugin/utc';
  import timezone from 'dayjs/plugin/timezone';
  import Button from 'src/ui/Button.svelte';
  import DatePreset from 'src/components/DatePreset.svelte';
  import { updateTasksBadge } from 'src/lib/updateTasksBadge';
  import * as amplitude from '@amplitude/analytics-browser';

  dayjs.extend(utc);
  dayjs.extend(timezone);

  export let id: string;
  let data: Task | null = null;
  let dateTime = null;
  let etcDateTime = null;
  let loading = true;

  const dispatch = createEventDispatcher();

  const dateToPicker = (date: string | dayjs.Dayjs) => dayjs(date).toISOString().slice(0, 19).replace('T', ' ');

  onMount(async () => {
    data = await pb.collection('tasks').getOne<Task>(id);
    loading = false;

    if (data.date) dateTime = dateToPicker(data.date);
    if (data.etcDate) etcDateTime = dateToPicker(data.etcDate);
  });

  let updateItemMutation = useMutation(
    'updateItem',
    () => {
      const dateTimeN = dateTime ? dayjs.tz(dateTime, 'Etc/UTC') : null;
      const etcDateTimeN = etcDateTime ? dayjs.tz(etcDateTime, 'Etc/UTC') : null;
      console.log({ data });

      loading = true;
      return Promise.resolve(
        pb.collection('tasks').update(id, {
          title: data.title,
          description: data.description,
          date: dateTimeN ? dateTimeN.toISOString() : null,
          etcDate: etcDateTimeN ? etcDateTimeN.toISOString() : null,
          priority: data.priority,
        }),
      );
    },
    {
      onError: (err, newTodo, context) => {},
      onSuccess: (res) => {
        data = res.data;
      },
      onSettled: () => {
        amplitude.track('task_update');
        loading = false;
        // window.location.reload();
      },
    },
  );

  $: {
    console.log(data);
  }
</script>

{#if loading || !data}
  <p class="text-center font-bold animate-pulse">Loading...</p>
{:else}
  <main class="space-y-4">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-medium">Edit item</h1>
      <Button
        variant="outline"
        size="sm"
        on:click={() => {
          $updateItemMutation.mutateAsync().then(async () => {
            await updateTasksBadge(window.location.href);
            window.close();
          });
        }}>Save & close</Button
      >
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
    <Button
      size="sm"
      on:click={() => {
        data.priority = !data?.priority;
      }}
      variant={data?.priority ? 'default' : 'outline'}
    >
      Priority: {data?.priority}
    </Button>

    <div>
      <label>
        <p class="font-medium text-sm">Deadline</p>
        <input
          bind:value={dateTime}
          type="datetime-local"
          class="mt-2 flex h-10 w-full rounded-md border border-slate-300 bg-transparent py-2 px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </label>
      <DatePreset
        on:clear={() => {
          dateTime = null;
        }}
        on:change={(v) => (dateTime = dateToPicker(v.detail))}
      />
    </div>
    <div>
      <label>
        <p class="font-medium text-sm">ETC</p>
        <input
          bind:value={etcDateTime}
          type="datetime-local"
          class="mt-2 flex h-10 w-full rounded-md border border-slate-300 bg-transparent py-2 px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </label>
      <DatePreset
        on:clear={() => {
          etcDateTime = null;
        }}
        on:change={(v) => (etcDateTime = dateToPicker(v.detail))}
      />
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
    <div>
      <div class="flex mt-8 justify-between">
        <Button
          on:click={() => {
            $updateItemMutation.mutateAsync().then(async () => {
              await updateTasksBadge(window.location.href);
              window.close();
            });
          }}>Save & close</Button
        >
        <div>
          <Button
            variant="subtle"
            on:click={() => {
              $updateItemMutation.mutate();
              updateTasksBadge(window.location.href);
            }}>Save</Button
          >
          <Button
            variant="subtle"
            on:click={() => {
              dispatch('close');
            }}>Close</Button
          >
        </div>
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
