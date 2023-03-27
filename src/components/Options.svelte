<script lang="ts">
  import type { Profile, Session, SessionWithUser } from 'src/lib/types';
  import { useQuery } from '@sveltestack/svelte-query';
  import EditItemView from 'src/components/EditItemView.svelte';
  import PopupHeader from 'src/components/PopupHeader.svelte';
  import QueryProvider from 'src/components/QueryProvider.svelte';
  import SelectChatPlaceholder from 'src/components/SelectChatPlaceholder.svelte';
  import SignIn from 'src/components/SignIn.svelte';
  import ViewItemsList from 'src/components/ViewItemsList.svelte';
  import { onMount } from 'svelte';

  import PocketBase from 'pocketbase';
  import EmptyList from 'src/components/EmptyList.svelte';

  export const pb = new PocketBase('https://pocketbase-malakhov.fly.dev');

  export let profile: Profile;
  let session: Session | null = null;
  let chat_id: string | null = null;

  let params = location.search
    .replaceAll('?', '')
    .split('&')
    .map((i) => {
      const [key, v] = i.split('=');
      return { [key]: v };
    });

  $: isChat = false;

  const handleGetSession = async (chat_id: string) => {
    const existing = await pb.collection('sessions').getFullList<SessionWithUser>({
      expand: 'users',
      filter: `users.telegram_id="${chat_id}"`,
    });
    if (existing.length > 0) {
      session = existing.find((i) => i.users.includes(profile.id));
    } else {
      session = await pb.collection('sessions').create({
        users: [profile.id],
      });
    }

    console.log({ session, chat_id });
  };

  onMount(() => {
    // if (!profile) return;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0].url;
      chat_id = url.split('#')[1];
      if (url.includes('web.telegram.org') && !!chat_id) {
        isChat = true;
        if (profile) handleGetSession(chat_id);
      }
    });
  });

  const editTaskId = params.find((i) => i.editTaskId)?.editTaskId;
</script>

{#if !profile}
  <div class="container px-4 py-4 text-base">
    <SignIn />
  </div>
{:else if !isChat && !editTaskId}
  <div class="container px-4 py-4 text-base">
    <SelectChatPlaceholder />
  </div>
{:else}
  <QueryProvider>
    <div class="container py-4 text-base">
      <PopupHeader {chat_id} session_id={session?.id} />
      {#if editTaskId}
        <div class="px-4 mt-2">
          <EditItemView id={editTaskId} />
        </div>
      {:else}
        <div class="px-4 mt-2">
          {#if session?.id}
            <ViewItemsList session_id={session?.id} profile_id={profile?.id} />
          {:else}
            <EmptyList />
            Code: 1
          {/if}
        </div>
      {/if}
    </div>
  </QueryProvider>
{/if}

<style>
  .container {
    min-width: 450px;
    max-width: 450px;
  }
</style>
