<script lang="ts">
  import { filter } from 'lodash';
  import { sortBy } from 'lodash';
  import { pb } from 'src/lib/db';
  import type { Session, Task } from 'src/lib/types';
  import { onMount } from 'svelte';

  let sessions: Session[] = [];
  let profile: string = '';
  let tasksCount: Record<string, number> = {};

  onMount(async () => {
    const s = await chrome.storage.sync.get();
    const code = s.code;

    const codeRecord = await pb.collection('verification_codes').getOne(code);
    const profileRecord = await pb.collection('profiles').getOne(codeRecord.user);
    profile = profileRecord.id;
    sessions = await pb.collection('sessions').getFullList<Session>({
      expand: 'users',
      filter: `users.id="${profileRecord.id}"`,
    });
    const tasks = await pb.collection('tasks').getFullList<Task>({
      filter: `session.users.id="${profileRecord.id}"`,
    });

    tasksCount = tasks.reduce((acc, task) => {
      if (acc[task.session]) {
        acc[task.session] += 1;
      } else {
        acc[task.session] = 1;
      }
      return acc;
    }, {} as Record<string, number>);
  });
</script>

<!-- If user have no sessions, we ask to open saved messages in Telegram -->
<!-- If they have at least one session, we give the list of them to open -->
<div class="flex h-64 col items-center justify-center">
  {#if sessions.length === 0}
    <h1
      class="text-center mt-10 scroll-m-20 pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0 dark:border-b-slate-700"
    >
      To get started, open any chat in <a class="text-blue-600 underline" href="https://web.telegram.org"
        >Web Telegram</a
      >
    </h1>
  {:else}
    <h1>
      <div class="flex flex-col items-center justify-center">
        <h1
          class="text-center mt-10 scroll-m-20 pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0 dark:border-b-slate-700"
        >
          Recent chats:
        </h1>
        <div class="flex flex-col space-y-1 items-center justify-center">
          {#each sortBy(sessions, (s) => tasksCount[s.id])
            .slice(0, 5)
            .filter((i) => !!tasksCount[i.id])
            .reverse() as session}
            {@const user = session.expand.users.find((i) => i.id !== profile)}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-missing-attribute -->
            <a
              class="cursor-pointer hover:underline"
              on:click={() => chrome.tabs.create({ url: `https://web.telegram.org/z/#${user.telegram_id}` })}
            >
              {user?.full_name || user.username || `ID: ${user.telegram_id}` || '<name_unset>'} ({tasksCount[
                session.id
              ] || 0})
            </a>
          {/each}
        </div>
      </div>
    </h1>
  {/if}
</div>
