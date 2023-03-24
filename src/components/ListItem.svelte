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
  const dispatch = createEventDispatcher();
</script>

<div class={cx(`group relative flex items-start space-x-2 w-full`, todo.is_completed ? 'opacity-50' : '')}>
  <input
    type="checkbox"
    checked={todo.is_completed}
    on:change={() => {
      dispatch('check', todo);
    }}
    name=""
    id=""
    class="mt-1 h-5 w-5"
  />
  <div class="w-full space-y-2">
    <div
      on:click={() => {
        chrome.windows.create({
          url: chrome.runtime.getURL(`src/popup/popup.html?editTaskId=${todo.id}`),
          type: 'popup',
          width: 450,
          height: 700,
        });
      }}
    >
      <p class="scroll-m-20 text-lg font-semibold tracking-tight">
        {todo?.title}
      </p>
      <p class="text-sm mt-1 line-clamp-2 cursor-pointer">
        {todo.description.length > 100 ? `${todo?.description.slice(0, 100)}...` : todo?.description}
      </p>
    </div>

    <div class="flex space-x-4 items-center">
      {#if todo.date}
        <p class="text-xs font-light text-gray-700">
          <!-- UTC timezone -->
          Due date: {dayjs.tz(todo.date, 'Etc/UTC').format('YYYY-MM-DD HH:mm')}
        </p>
      {/if}
      <!-- <a class="truncate text-blue-700 text-xs max-w-[100px]" href={todo.url}>{todo.url}</a> -->
    </div>

    <div class="w-full h-px bg-gray-200" />
  </div>

  <div class="opacity-0 text-sm group-hover:opacity-100 transition top-0 right-2 absolute">
    <Button
      variant="destructive"
      size="sm"
      on:click={() => {
        dispatch('delete');
      }}>Delete</Button
    >
  </div>
</div>
