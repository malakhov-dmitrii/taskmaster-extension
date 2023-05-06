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
  import { getOrCreateSession } from 'src/lib/session';

  const pb = new PocketBase('https://pocketbase-malakhov.fly.dev');

  export let profile: Profile;

  $: session = null as Session | null;
  $: chat_id = '';
  $: editTaskId = '';
  $: isChat = false;
  $: tabReady = false;
  $: sessionLoadingState = 'idle' as 'idle' | 'loading' | 'error' | 'success';

  const handleGetSession = async (chat_id: string) => {
    console.log('handleGetSession', chat_id);

    sessionLoadingState = 'loading';
    session = await getOrCreateSession(chat_id, profile.telegram_id, profile.id).catch(() => {
      sessionLoadingState = 'error';
      return null;
    });
    sessionLoadingState = 'success';
  };

  onMount(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      tabReady = true;
      const url = tabs[0].url;
      chat_id = url.split('#')[1];
      if (url.includes('web.telegram.org') && !!chat_id) {
        isChat = true;
        if (profile) handleGetSession(chat_id);
      }
    });
  });

  // $: {
  //   console.log({
  //     profile,
  //     chat_id,
  //     isChat,
  //     sessionLoadingState,
  //     session,
  //   });
  // }
</script>

<QueryProvider>
  {#if !profile}
    <div class="container px-4 py-4 text-base">
      <SignIn />
    </div>
  {:else if !isChat}
    <div class="container px-4 py-4 text-base">
      <SelectChatPlaceholder />
    </div>
  {:else}
    <PopupHeader user_id={profile.id} {session} on:newTask={(event) => (editTaskId = event.detail)} />
    <div class="container px-4 py-4 text-base">
      {#if editTaskId}
        <div class="px-4 mt-2">
          <EditItemView id={editTaskId} on:close={() => (editTaskId = '')} />
        </div>
      {:else}
        <div class="px-4 mt-2">
          {#if session?.id}
            <ViewItemsList
              on:edit={(e) => (editTaskId = e.detail.id)}
              session_id={session?.id}
              profile_id={profile?.id}
            />
          {:else if sessionLoadingState === 'loading'}
            <div>
              <p class="text-center font-bold animate-pulse my-8">Loading session...</p>
            </div>
          {:else if sessionLoadingState === 'error'}
            <div>
              <p class="text-center font-bold animate-pulse my-8">Error loading session</p>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {/if}
</QueryProvider>

<style>
  .container {
    min-width: 500px;
    max-width: 500px;
  }
</style>
