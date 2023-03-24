<script lang="ts">
  import type { CreateTaskDTO, Profile, Session, SessionWithUser, Task } from 'src/lib/types';
  // import { createClient } from '@supabase/supabase-js';
  // import { supabase } from 'src/lib/db';
  import type { StorageSession } from 'src/storage';
  import { onMount } from 'svelte';
  import PocketBase from 'pocketbase';
  import dayjs from 'dayjs';

  export const pb = new PocketBase('https://pocketbase-malakhov.fly.dev');

  let open = false;
  $: selection = null as Selection | null;
  $: selectionText = '';
  $: selectionNodeRect = selection?.focusNode?.parentElement?.getBoundingClientRect();
  $: position = { x: 0, y: 0 };

  $: loading = false;

  let profile: Profile;

  onMount(async () => {
    const storage = await chrome.storage.sync.get();
    profile = storage.profile as Profile;
  });

  /**
   * Update button position during selection
   */
  $: {
    if (selection && selection.toString().length > 0) {
      open = true;
      selectionText = selection.toString();
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
      console.log(existing.filter((i) => i.users.includes(profile.id)));

      const session = existing.find((i) => i.users.includes(profile.id));

      if (session) {
        return session;
      }

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
    const secondUser = await handleGetSecondUser(telegram_id);

    if (session.users.includes(secondUser.id)) return;

    await pb.collection('sessions').update(session.id, {
      users: [...session.users, secondUser.id],
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
    };

    // const newProfile = await pb.collection('profiles').create({});

    const res = await pb.collection('tasks').create(newTask);

    if (res) {
      window.open(chrome.runtime.getURL(`src/popup/popup.html?editTaskId=${res.id}`), '_blank', 'width=450,height=700');
    }

    loading = false;
  }

  onMount(() => {
    console.log('onMount');

    document.onmouseup = () => {
      console.log('onmouseup');
      console.log(selection?.toString());
      position = {
        x: selectionNodeRect?.left ?? 0,
        y: selectionNodeRect?.top ?? 0,
      };
    };
    document.addEventListener('selectionchange', () => {
      console.log('selectionchange');
      selection = document.getSelection();
    });

    document.addEventListener('scroll', () => {
      selection = null;
    });
  });
</script>

{#if open && profile}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    class="create-task-btn"
    style="left: {position.x}px; top: {position.y}px;"
    on:click={() => {
      if (loading) return;
      createTask(selectionText, window.location.href);
    }}
  >
    {#if loading}
      Loading...
    {:else}
      Create task from selection
    {/if}
  </div>
{/if}
