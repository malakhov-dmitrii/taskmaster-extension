<script lang="ts">
  import type { Session } from 'src/lib/types';

  export let sessions: Session[] = [];
</script>

<!-- If user have no sessions, we ask to open saved messages in Telegram -->
<!-- If they have at least one session, we give the list of them to open -->
<div class="flex h-64 col items-center justify-center">
  {#if sessions.length === 0}
    <h1
      class="text-center mt-10 scroll-m-20 pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0 dark:border-b-slate-700"
    >
      To get started, open any chat in <a class="text-blue-600 underline" href="https://web.telegram.org">Web Telegram</a>
    </h1>
  {/if}
</div>
