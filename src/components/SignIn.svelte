<script lang="ts">
  import Button from '../ui/Button.svelte';
  import { useMutation } from '@sveltestack/svelte-query';
  import { pb, supabase } from 'src/lib/db';
  import { getRandomCode } from 'src/lib/utils';
  import { storage, type StorageSession } from 'src/storage';
  import type { Profile, Session } from 'src/lib/types';

  export let profile: Profile;

  const openTelegram = async () => chrome.tabs.create({ url: 'https://web.telegram.org/' });

  const handleSave = async () => {
    const existing = await pb.collection('profiles').getFullList<Profile>({
      filter: `telegram_id="${profile.telegram_id}"`,
    });
    if (existing) {
      profile.id = existing[0].id;
    }

    const profileUpdate = await pb
      .collection('profiles')
      .update(profile.id, { name: profile.name, telegram_id: profile.telegram_id });
    if (profileUpdate.error) {
      console.log(profileUpdate.error);
    } else {
      await storage.set({ profile });
      window.location.reload();
    }
  };
</script>

<div class=" space-y-4 px-4 text-base">
  <div class="flex justify-between items-center">
    <h1 class="font-bold text-2xl">Sign Up</h1>
  </div>

  <div class="flex space-x-4">
    <div class="w-full">
      <label class="">
        <p class="text-sm">Name</p>
        <input
          bind:value={profile.name}
          placeholder="ex.: Dmitrii"
          type="text"
          class="mt-1 flex h-10 w-full rounded-md border border-slate-300 bg-transparent py-2 px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-50 dark:focus:ring-slate-400 dark:focus:ring-offset-slate-900"
        />
      </label>
    </div>
  </div>

  <div class="flex space-x-2 items-end">
    <div class="w-full">
      <label class="">
        <p class="text-sm">Telegram ID</p>
        <input
          bind:value={profile.telegram_id}
          type="text"
          placeholder="ex.: 123456"
          class="mt-1 flex h-10 w-full rounded-md border border-slate-300 bg-transparent py-2 px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-50 dark:focus:ring-slate-400 dark:focus:ring-offset-slate-900"
        />
        <p class="text-xs text-slate-600">
          open Telegram Web, go to Saved Messages, and copy the number from the URL after #
        </p>
      </label>
    </div>
  </div>

  <div class="flex space-x-2">
    <Button variant="outline" class="flex-1" on:click={openTelegram}>Open Telegram</Button>

    <Button on:click={handleSave} disabled={!profile.telegram_id?.trim() || !profile.name?.trim()} class="flex-1"
      >Save</Button
    >
  </div>
</div>
