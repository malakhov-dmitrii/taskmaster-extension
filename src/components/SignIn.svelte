<script lang="ts">
  import Button from '../ui/Button.svelte';
  import { onMount } from 'svelte';

  import * as amplitude from '@amplitude/analytics-browser';

  let code: string = '';
  // const bot_url = import.meta.env.DEV
  //   ? 'https://t.me/va_assistant_task_trackerdev_bot'
  //   : 'https://t.me/va_assistant_task_tracker_bot';
  const bot_url = 'https://t.me/va_assistant_task_tracker_bot';

  onMount(async () => {
    const s = await chrome.storage.sync.get();
    code = s.code;
  });
</script>

<div class="space-y-4 container px-4 py-8">
  <div class="flex justify-center items-center">
    <h1 class="font-bold text-2xl">Sign Up</h1>
  </div>

  <div class="flex justify-center">
    <Button
      disabled={!code}
      on:click={() => {
        amplitude.track('sign_up', { code });
        window.open(`${bot_url}?start=${code}`);
      }}>Sign up with Telegram</Button
    >
  </div>
</div>

<style>
  /* .container {
    max-width: 300px;
    min-width: 300px;
  } */
</style>
