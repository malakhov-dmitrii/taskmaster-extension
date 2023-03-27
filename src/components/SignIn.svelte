<script lang="ts">
  import Button from '../ui/Button.svelte';
  import { useMutation } from '@sveltestack/svelte-query';
  import { pb, supabase } from 'src/lib/db';
  import { getRandomCode } from 'src/lib/utils';
  import { storage, type StorageSession } from 'src/storage';
  import type { Profile, Session } from 'src/lib/types';
  import { onMount } from 'svelte';

  let code: string = '';
  const bot_url = import.meta.env.DEV
    ? 'https://t.me/va_assistant_task_trackerdev_bot'
    : 'https://t.me/va_assistant_task_tracker_bot';

  onMount(async () => {
    const s = await chrome.storage.sync.get();
    code = s.code;
  });

  // $: {
  //   console.log({ profile, code });
  // }

  // const openTelegram = async () => chrome.tabs.create({ url: 'https://web.telegram.org/' });

  // const handleSave = async () => {
  //   const existing = await pb.collection('profiles').getFullList<Profile>({
  //     filter: `telegram_id="${profile.telegram_id}"`,
  //   });
  //   if (!!existing.length) {
  //     profile.id = existing[0]?.id;
  //     await pb.collection('profiles').update(profile.id, { name: profile.name, telegram_id: profile.telegram_id });
  //   } else {
  //     await pb.collection('profiles').create({ name: profile.name, telegram_id: profile.telegram_id });
  //   }
  //   await storage.set({ profile });
  //   window.location.reload();
  // };
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

  <!-- <div class="flex space-x-4"> -->
  <!--   <div class="w-full"> -->
  <!--     <label class=""> -->
  <!--       <p class="text-sm">Name</p> -->
  <!--       <input -->
  <!--         bind:value={profile.name} -->
  <!--         placeholder="ex.: Dmitrii" -->
  <!--         type="text" -->
  <!--         class="mt-1 flex h-10 w-full rounded-md border border-slate-300 bg-transparent py-2 px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-50 dark:focus:ring-slate-400 dark:focus:ring-offset-slate-900" -->
  <!--       /> -->
  <!--     </label> -->
  <!--   </div> -->
  <!-- </div> -->

  <!-- <div class="flex space-x-2 items-end"> -->
  <!--   <div class="w-full"> -->
  <!--     <label class=""> -->
  <!--       <p class="text-sm">Telegram ID</p> -->
  <!--       <input -->
  <!--         bind:value={profile.telegram_id} -->
  <!--         type="text" -->
  <!--         placeholder="ex.: 123456" -->
  <!--         class="mt-1 flex h-10 w-full rounded-md border border-slate-300 bg-transparent py-2 px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-50 dark:focus:ring-slate-400 dark:focus:ring-offset-slate-900" -->
  <!--       /> -->
  <!--       <p class="text-xs text-slate-600"> -->
  <!--         open Telegram Web, go to Saved Messages, and copy the number from the URL after # -->
  <!--       </p> -->
  <!--     </label> -->
  <!--   </div> -->
  <!-- </div> -->

  <!-- <div class="flex space-x-2"> -->
  <!--   <Button variant="outline" class="flex-1" on:click={openTelegram}>Open Telegram</Button> -->

  <!--   <Button on:click={handleSave} disabled={!profile.telegram_id?.trim() || !profile.name?.trim()} class="flex-1" -->
  <!--     >Save</Button -->
  <!--   > -->
  <!-- </div> -->
</div>
