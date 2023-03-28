<script lang="ts">
  import dayjs from 'dayjs';
  import relativeTime from 'dayjs/plugin/relativeTime';
  import Button from 'src/ui/Button.svelte';
  import { createEventDispatcher } from 'svelte';

  $: days = 0;
  $: weeks = 0;
  $: months = 0;
  const dispatch = createEventDispatcher();
</script>

<div class="flex space-x-2 text-xs mt-2 font-medium text-slate-600">
  <div class="flex w-full justify-between">
    <div class="flex items-center space-x-2">
      <p>in</p>
      <input
        type="text"
        bind:value={days}
        on:change={() => {
          dispatch('change', dayjs().add(days, 'day').add(weeks, 'week').add(months, 'month'));
        }}
        class="flex h-6 w-full rounded-md border border-slate-300 bg-transparent py-2 px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 max-w-10"
      />
      <span>days</span>
      <input
        type="text"
        bind:value={weeks}
        on:change={() => {
          dispatch('change', dayjs().add(days, 'day').add(weeks, 'week').add(months, 'month'));
        }}
        class="flex h-6 w-full rounded-md border border-slate-300 bg-transparent py-2 px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 max-w-10"
      />
      <span>weeks</span>
      <input
        type="text"
        bind:value={months}
        on:change={() => {
          dispatch('change', dayjs().add(days, 'day').add(weeks, 'week').add(months, 'month'));
        }}
        class="flex h-6 w-full rounded-md border border-slate-300 bg-transparent py-2 px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 max-w-10"
      />
      <span>months</span>
    </div>
    <Button
      size="xs"
      variant="outline"
      on:click={() => {
        months = 0;
        weeks = 0;
        days = 0;
        dispatch('clear');
      }}>Clear</Button
    >
  </div>
</div>
