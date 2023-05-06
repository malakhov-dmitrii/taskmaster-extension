<script lang="ts">
  import Button from '../ui/Button.svelte';
  import { onMount } from 'svelte';

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

<div class=" space-y-4 px-4 text-base">
  <div class="flex justify-between items-center">
    <h1 class="font-bold text-2xl">Sign Up</h1>
  </div>

  <div class="flex justify-between">
    <Button disabled={!code} on:click={() => window.open(`${bot_url}?start=${code}`)}>Sign In with Telegram</Button>
    <Button
      variant="ghost"
      on:click={() => {
        chrome.storage.sync.clear();
        window.location.reload();
      }}
    >
      Clear cache
    </Button>
  </div>
</div>
