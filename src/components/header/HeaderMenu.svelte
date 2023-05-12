<script lang="ts">
  import { Inspect, LogOut, Menu, Pin, RefreshCcw, Settings } from 'lucide-svelte';
  import { clickOutside } from 'src/lib/utils';
  import Button from 'src/ui/Button.svelte';
  import { onMount } from 'svelte';

  $: open = false;
  $: floatingMode = 'on';

  onMount(async () => {
    const store = await chrome.storage.sync.get('floatingMode');
    floatingMode = store.floatingMode ?? 'on';
  });

  function handleToggleFloating(v: 'on' | 'off') {
    chrome.storage.sync.set({ floatingMode: v });
    floatingMode = v;
  }
</script>

<div class="relative" use:clickOutside on:click_outside={() => (open = false)}>
  <Button variant="outline" size="sm" on:click={() => (open = !open)}>
    <Menu class="w-5 h-5" />
  </Button>

  {#if open}
    <div class="absolute right-0 top-0 mt-8 z-10">
      <div class="bg-white rounded-md border shadow-xl">
        <div class="py-2 px-2 space-y-1">
          <Button
            disabled={floatingMode === 'on'}
            class="w-full justify-start"
            variant="ghost"
            size="sm"
            on:click={() => handleToggleFloating('on')}
          >
            <Inspect class="w-4 h-4 mr-3" />
            Floating</Button
          >
          <Button
            disabled={floatingMode === 'off'}
            class="w-full justify-start"
            variant="ghost"
            size="sm"
            on:click={() => handleToggleFloating('off')}
          >
            <Pin class="w-4 h-4 mr-3" />
            Static</Button
          >
          <hr class="" />
          <Button
            class="w-full justify-start"
            variant="ghost"
            size="sm"
            on:click={() => {
              window.location.reload();
            }}
          >
            <RefreshCcw class="w-4 h-4 mr-3" />
            Refresh</Button
          >
          <Button
            class="w-full justify-start"
            variant="ghost"
            size="sm"
            on:click={() => {
              chrome.storage.sync.clear();
              window.location.reload();
            }}
          >
            <LogOut class="w-4 h-4 mr-3" />
            Logout</Button
          >
        </div>
      </div>
    </div>
  {/if}
</div>
