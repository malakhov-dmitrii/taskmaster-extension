<script lang="ts">
  import { signInUser } from 'src/lib/telegram/utils';
  import { tg } from 'src/popup/telegram';
  import { onMount } from 'svelte';

  $: phone = '';
  $: password = '';
  $: code = '';

  onMount(() => {
    signInUser();
    // tg.call('help.getNearestDc').then((result) => {
    //   console.log('country:', result.country);
    // });
  });

  const handleNext = async () => {
    // await telegram.start({
    //   phoneNumber: () => {
    //     console.log('Get phone', phone);
    //     return Promise.resolve(phone);
    //   },
    //   password: () => {
    //     console.log('Get password', password);
    //     return Promise.resolve(password);
    //   },
    //   phoneCode: () => {
    //     console.log('Get code', code);
    //     return Promise.resolve(code);
    //   },
    //   onError: (error) => {
    //     console.log(error);
    //   },
    // });
  };
</script>

<div class="container p-4 text-base">
  <input bind:value={phone} type="text" placeholder="Phone number" />
  <input bind:value={password} type="text" placeholder="Password" />
  <input bind:value={code} type="text" placeholder="Code" />
  <button on:click={handleNext}>Next</button>
</div>

<style>
  .container {
    min-width: 500px;
    max-width: 500px;
  }
</style>
