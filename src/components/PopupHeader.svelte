<script lang="ts">
  import Button from '../ui/Button.svelte';
  import { useQueryClient } from '@sveltestack/svelte-query';
  import { pb } from 'src/lib/db';
  let queryClient = useQueryClient();

  export let chat_id: string;
  export let session_id: string;
</script>

<div class="px-4 border-b border-slate-300 pb-4 flex items-center justify-between">
  <div class="flex space-x-2">
    <Button
      variant="subtle"
      size="sm"
      on:click={() => {
        queryClient.invalidateQueries('todos');
        queryClient.refetchQueries('todos');
      }}>Refresh</Button
    >
    <Button
      variant="ghost"
      size="sm"
      on:click={() => {
        console.log('sign out');

        chrome.storage.sync.clear();
        window.location.reload();
      }}>Sign Out</Button
    >
  </div>

  <Button
    size="sm"
    disabled={!session_id}
    on:click={async () => {
      const res = await pb.collection('tasks').create({
        session: session_id,
        title: 'New Task',
      });

      chrome.windows.create({
        url: chrome.runtime.getURL(`src/popup/popup.html?editTaskId=${res.id}`),
        type: 'popup',
        width: 450,
        height: 700,
      });
    }}
    }}>New Task</Button
  >
</div>
