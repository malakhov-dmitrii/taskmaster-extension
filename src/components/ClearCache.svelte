<script lang="ts">
  import Button from 'src/ui/Button.svelte';
  import * as amplitude from '@amplitude/analytics-browser';
</script>

<div class="flex justify-center items-center mt-4">
  <Button
    on:click={() => {
      amplitude.track('clear_cache');
      chrome.storage.sync.clear().then(() => window.location.reload());
    }}>Refresh</Button
  >
</div>
