<script lang="ts">
  import { useMutation } from '@sveltestack/svelte-query';
  import { supabase } from 'src/lib/db';
  import { getRandomCode } from 'src/lib/utils';
  import type { StorageSession } from 'src/storage';

  export let session: StorageSession;
  $: sessionCode = '';
  let updateNameMutation = useMutation('setusername', () =>
    Promise.resolve(supabase.from('pa_profiles').update({ username: session.username }).eq('id', session.id))
  );

  /**
   * We need to get chat by join_code. If it doesn't exist, we need to create it.
   */
  let findOrCreateSession = useMutation(
    'findOrCreateSession',
    async () => {
      $updateNameMutation.mutate();
      if (!sessionCode) {
        return Promise.resolve(
          supabase.from('pa_chats').insert({ join_code: getRandomCode(), assistant_id: session.id }).select().single()
        );
      } else {
        const chat = await supabase.from('pa_chats').update({ client_id: session.id }).eq('join_code', sessionCode).select().single();
        await supabase.from('pa_profiles').update({ role: 'client' }).eq('id', session.id);
        return Promise.resolve(chat);
      }
    },
    {
      onSuccess: async data => {
        if (data) {
          session.chat_id = data.data.id;
          await chrome.storage.sync.set({ session });
          window.location.reload();
        }
      },
    }
  );
</script>

<div class=" space-y-4 px-4 text-base">
  <!-- <button on:click={() => chrome.storage.sync.clear()}>clear session</button> -->
  <h1 class="font-bold text-2xl">Create new session</h1>

  <div class="">
    <label class="">
      <p class="text-sm">If you have session code, enter it here</p>
      <input bind:value={sessionCode} type="text" placeholder="123456" class="border rounded px-2 py-1 w-full" />
    </label>
  </div>

  <div class="">
    <label class="">
      <p class="text-sm">Enter your name</p>
      <input bind:value={session.username} placeholder="ex.: Dmitrii" type="text" class="border rounded px-2 py-1 w-full" />
    </label>
  </div>

  <div>
    <button
      on:click={async () => {
        if (!session.username.trim()) return;
        $findOrCreateSession.mutate();
      }}
      class="bg-blue-500 w-full rounded shadow px-6 py-2 text-white font-medium">Start</button
    >
  </div>
</div>
