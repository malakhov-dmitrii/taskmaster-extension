<script lang="ts">
  import type { Database } from 'src/lib/database.types';
  import { cx } from 'src/lib/utils';
  import { createEventDispatcher } from 'svelte';
  import dayjs from 'dayjs';
  import utc from 'dayjs/plugin/utc';
  import timezone from 'dayjs/plugin/timezone';
  import type { Task } from 'src/lib/types';
  import Button from 'src/ui/Button.svelte';

  dayjs.extend(utc);
  dayjs.extend(timezone);

  export let todo: Task;
  export let profile_id: string;
  const dispatch = createEventDispatcher();

  $: assignedToMe = todo.assigned_to === profile_id || !todo.assigned_to;
  $: {
    console.log({ assignedToMe, todo, profile_id });
  }
</script>

<div
  class={cx(
    `group rounded-xl pb-3 p-1 relative flex items-start space-x-2 w-3/4 `,
    assignedToMe ? 'bg-slate-100 ml-auto shadow' : 'bg-[#dcf8c5] mr-auto',
    todo.is_completed ? 'opacity-50' : '',
  )}
>
  <p class="text-slate-600 font-light text-xs absolute bottom-1 right-2">
    {dayjs(todo.created).format('DD MMM HH:mm')}
  </p>
  {#if todo?.priority}
    <p class="rounded-full px-2 text-white font-semibold text-xs absolute -top-2.5 bg-green-500 -left-1">Priority</p>
  {/if}
  <!-- <input
    type="checkbox"
    checked={todo.is_completed}
    on:change={() => {
      dispatch('check', todo);
    }}
    name=""
    id=""
    class="mt-1 h-5 w-5"
  /> -->
  <div class="w-full space-y-2">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
      on:click={() => {
        dispatch('edit', todo);
      }}
    >
      <p class="text-sm mt-1 line-clamp-2 cursor-pointer">
        {todo.description.length > 100 ? `${todo?.description.slice(0, 100)}...` : todo?.description}
      </p>
    </div>

    <div class="flex flex-col items-start justify-start">
      {#if todo.date}
        <p class="text-xs font-semibold text-red-700">
          Deadline: {dayjs.tz(todo.date, 'Etc/UTC').format('DD MMM HH:mm')}
        </p>
      {/if}
      {#if todo.etcDate}
        <p class="text-xs font-light text-gray-700">
          ETC: {dayjs.tz(todo.etcDate, 'Etc/UTC').format('DD MMM HH:mm')}
        </p>
      {/if}
    </div>
  </div>

  <div
    class={cx(
      'opacity-0 text-sm group-hover:opacity-100 transition top-0  space-x-2 flex  absolute',
      !assignedToMe ? '-right-28' : '-left-33',
    )}
  >
    <Button
      size="xs"
      variant="outline"
      on:click={() => {
        dispatch('delete');
      }}>Done</Button
    >
    <Button
      size="xs"
      on:click={() => {
        dispatch('toggleAssignee');
        // todo.assigned_to = assignedToMe ? 'any' : profile_id;
      }}
    >
      {#if assignedToMe}
        From
      {:else}
        To
      {/if}
      me</Button
    >
    <!-- <Button
      variant="destructive"
      size="xs"
      on:click={() => {
        dispatch('delete');
      }}>Delete</Button
    > -->
  </div>
</div>
