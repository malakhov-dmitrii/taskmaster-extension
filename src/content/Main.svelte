<script lang="ts">
  import { fade, slide } from 'svelte/transition';
  import type { CreateTaskDTO, Profile, Session, SessionWithUser, Task } from 'src/lib/types';
  // import { updateTasksBadge } from 'src/lib/updateTasksBadge';
  import { onMount } from 'svelte';
  import PocketBase from 'pocketbase';
  import dayjs from 'dayjs';
  import { badgeIncrement, cn } from 'src/lib/utils';
  export const pb = new PocketBase('https://pocketbase-malakhov.fly.dev');

  let open = false;
  $: selection = null as Selection | null;
  $: selectionText = '';
  $: selectionNodeRect = selection?.focusNode?.parentElement?.getBoundingClientRect();
  $: floatingMode = 'off';
  $: position = { x: 'unset', y: 'unset', right: '16px', bottom: '100px' };

  $: loading = false;
  $: created = false;

  let profile: Profile;

  onMount(async () => {
    const storage = await chrome.storage.sync.get();
    floatingMode = storage.floatingMode || 'on';

    const key = `profile_for_code/${storage.code}`;
    if (storage[key]) {
      console.log('profile from storage: ', storage[key]);

      profile = storage[key];
      return;
    }

    const code = await pb.collection('verification_codes').getOne(storage.code);

    if (!code) {
      console.log("Code doesn't exist: Main -> onMount");

      throw new Error('no code: Main -> onMount');
    }
    profile = await pb.collection('profiles').getOne(code.user);
  });

  $: {
    console.log(profile);
  }

  /**
   * Update button position during selection
   */
  $: {
    if (selection && selection.toString().length > 0) {
      created = false;
      selectionText = selection.toString();
      console.log('selection: ', selectionText, profile);
      setTimeout(() => {
        open = true;
      }, 200);
    } else {
      setTimeout(() => {
        open = false;
      }, 100);
    }
  }

  function getSecondUserName() {
    return document.querySelector('.messages-layout .fullName')?.textContent ?? '';
  }

  const getOrCreateSession = async (chat_id: string, profile_id: string, omit_create = false): Promise<Session> => {
    const store = await chrome.storage.sync.get(chat_id);
    if (store[chat_id]) {
      console.log('session from storage: ', store[chat_id]);
      return store[chat_id];
    }

    console.log('session from db');

    const userMe = await pb.collection('profiles').getOne(profile_id);
    let companionUser = await pb
      .collection('profiles')
      .getFirstListItem(`telegram_id="${chat_id}"`)
      .catch(() => null);

    if (!companionUser) {
      companionUser = await pb.collection('profiles').create({
        telegram_id: chat_id,
      });
    }

    let session;
    const mySessions = await pb.collection('sessions').getFullList<SessionWithUser>({
      expand: 'users',
      filter: `users.telegram_id ?= "${userMe.telegram_id}"`,
      sort: '-created',
    });

    console.log('my sessions: ', mySessions);
    console.log(
      'match with companionUser id: ',
      mySessions.filter((i) => i.expand.users.find((j) => j.telegram_id === chat_id)),
    );

    session = mySessions.find((i) => i.expand.users.find((j) => j.telegram_id === chat_id));
    if (!session && !omit_create) {
      session = await pb.collection('sessions').create({
        users: [userMe.id, companionUser.id],
      });
      console.log('new session: ', session);
    }

    return session;
  };

  async function createTask(text: string, url: string) {
    const chat_id = location.href.split('#')[1];
    loading = true;

    const session = await getOrCreateSession(chat_id, profile.id);

    // await ensureSecondUserInSession(session, chat_id);
    const companionId = session?.users?.find((i) => i !== profile.id);

    const newTask: CreateTaskDTO = {
      description: text,
      title: `Chat with ${getSecondUserName()} on ${dayjs().format('DD MMM YYYY')}`,
      session: session.id,
      assigned_to: companionId,
    };

    const res = await pb.collection('tasks').create(newTask);
    created = true;
    loading = false;

    chrome.runtime.sendMessage('badgeIncrement');
    setTimeout(() => {
      open = false;
    }, 1000);
  }

  onMount(() => {
    document.onmouseup = async () => {
      const store = await chrome.storage.sync.get('floatingMode');
      floatingMode = store.floatingMode || 'on';

      if (floatingMode === 'on') {
        const x = selectionNodeRect?.left || document.body.clientWidth - 300;
        const y = selectionNodeRect?.top - 40 || document.body.clientHeight - 120;
        // @ts-ignore
        position = {
          x: `${x}px`,
          y: `${y}px`,
        };
      }
    };
    document.addEventListener('selectionchange', () => {
      // console.log('selectionchange');
      selection = document.getSelection();
    });

    const tgMessagesList = document.querySelector('.MessageList');
    tgMessagesList.addEventListener('scroll', () => {
      selection = null;
      open = false;
      created = false;
    });
  });
</script>

{#if open && profile}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    in:slide={{ duration: 200 }}
    out:fade={{ duration: 200 }}
    class={cn('create-task-btn')}
    style="left: {position.x}; top: {position.y};"
    on:click={() => {
      if (loading) return;
      createTask(selectionText, window.location.href);
    }}
  >
    {#if loading}
      Loading...
    {:else if created}
      Saved!
    {:else}
      Create task from selection
    {/if}
  </div>
{/if}
