<script lang="ts">
  import Button from 'src/ui/Button.svelte';
</script>

<div class="flex justify-center items-center mt-4">
  <Button on:click={() => chrome.storage.sync.clear().then(() => window.location.reload())}>Refresh</Button>
</div>
