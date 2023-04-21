<script lang="ts">
  import { fade, slide } from 'svelte/transition';
  import type { CreateTaskDTO, Profile, Session, SessionWithUser, Task } from 'src/lib/types';
  // import { updateTasksBadge } from 'src/lib/updateTasksBadge';
  import { onMount } from 'svelte';
  import PocketBase from 'pocketbase';
  import dayjs from 'dayjs';
  import { cn } from 'src/lib/utils';

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
    const code = await pb.collection('verification_codes').getOne(storage.code);

    if (!code) {
      console.log("Code doesn't exist: Main -> onMount");

      throw new Error('no code: Main -> onMount');
      return;
    }
    profile = await pb.collection('profiles').getOne(code.user);

    floatingMode = storage.floatingMode || 'on';
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
      setTimeout(() => {
        open = true;
      }, 200);
    } else {
      setTimeout(() => {
        open = false;
      }, 100);
    }
  }

  /**
   * Get session for opened chat and active user
   * If there is no session, create one
   */
  const handleGetSession = async (): Promise<Session> => {
    const chat_id = location.href.split('#')[1];

    const existing = await pb.collection('sessions').getFullList<SessionWithUser>({
      expand: 'users',
      filter: `users.telegram_id="${chat_id}"`,
    });
    if (existing.length > 0) {
      console.log({ existing });

      const session = existing.find((i) => i.users?.includes(profile.id));

      if (session) {
        return session;
      }

      const res = await pb.collection('sessions').create<Session>({
        users: [profile.id],
      });

      return res;
    } else {
      const res = await pb.collection('sessions').create<Session>({
        users: [profile.id],
      });

      return res;
    }
  };

  const handleGetSecondUser = async (telegram_id: string) => {
    const users = await pb.collection('profiles').getFullList({
      filter: `telegram_id="${telegram_id}"`,
    });

    if (users.length > 0) return users[0];

    const newUser = await pb.collection('profiles').create({
      telegram_id,
      name: getSecondUserName(),
    });

    return newUser;
  };

  const ensureSecondUserInSession = async (session: Session, telegram_id: string) => {
    console.log('session', session);

    const secondUser = await handleGetSecondUser(telegram_id);

    if (session.users?.includes(secondUser.id)) return;

    await pb.collection('sessions').update(session.id, {
      users: [...(session?.users ?? []), secondUser.id],
    });
  };

  function getSecondUserName() {
    return document.querySelector('.messages-layout .fullName')?.textContent;
  }

  async function createTask(text: string, url: string) {
    loading = true;

    const session = await handleGetSession();
    await ensureSecondUserInSession(session, location.href.split('#')[1]);

    const newTask: CreateTaskDTO = {
      description: text,
      title: `Chat with ${getSecondUserName()} on ${dayjs().format('DD MMM YYYY')}`,
      session: session.id,
      assigned_to: profile.id,
    };

    const res = await pb.collection('tasks').create(newTask);
    created = true;
    loading = false;
    setTimeout(() => {
      open = false;
    }, 1000);
  }

  $: {
    console.log(floatingMode);
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
