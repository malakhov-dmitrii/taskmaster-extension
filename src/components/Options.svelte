<script lang="ts">
  import type { Profile, Session } from 'src/lib/types';
  import EditItemView from 'src/components/EditItemView.svelte';
  import PopupHeader from 'src/components/header/PopupHeader.svelte';
  import QueryProvider from 'src/components/QueryProvider.svelte';
  import SelectChatPlaceholder from 'src/components/SelectChatPlaceholder.svelte';
  import ViewItemsList from 'src/components/ViewItemsList.svelte';
  import { onMount } from 'svelte';
  import { getOrCreateSession } from 'src/lib/session';
  import ClearCache from 'src/components/ClearCache.svelte';

  export let profile: Profile;

  $: sessionPromise = null as Promise<Session | null>;
  $: chat_id = '';
  $: editTaskId = '';
  $: isChat = false;

  async function loadSession() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = tabs[0].url;
    chat_id = url.split('#')[1];

    isChat = url.includes('web.telegram.org') && !!chat_id;
    if (!isChat) return null;
    return getOrCreateSession(chat_id, profile.id);
  }

  onMount(() => {
    sessionPromise = loadSession();
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
  <!-- When no chat is opened -->
  {#if !isChat}
    <div class="container px-4 py-4 text-base">
      <SelectChatPlaceholder />
    </div>
  {/if}
  <!--  -->

  <!-- Chat opened -->
  {#if isChat}
    <!-- Load chat info -->
    {#await sessionPromise}
      <div class="container px-4 text-base">
        <p class="text-center font-bold text-xl animate-pulse my-8">Loading...</p>
      </div>
      <!-- Loading complete -->
    {:then session}
      <PopupHeader user_id={profile.id} {session} on:newTask={(event) => (editTaskId = event.detail)} />
      <div class="container px-4 mt-2 text-base">
        {#if editTaskId}
          <div class="px-4 mt-2">
            <EditItemView id={editTaskId} on:close={() => (editTaskId = '')} />
          </div>
        {:else}
          <div class="pb-4">
            <ViewItemsList
              on:edit={(e) => (editTaskId = e.detail.id)}
              session_id={session?.id}
              profile_id={profile?.id}
            />
          </div>
        {/if}
      </div>
      <!-- Loading failed -->
    {:catch error}
      <div class="container px-4 text-base">
        <p class="text-center font-bold my-8">
          Failed to load session
          <br />
          {error}
          <ClearCache />
        </p>
      </div>
    {/await}
  {/if}
</QueryProvider>
