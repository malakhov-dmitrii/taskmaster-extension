<script lang="ts">
  import ClearCache from 'src/components/ClearCache.svelte';
  import Options from 'src/components/Options.svelte';
  import SignIn from 'src/components/SignIn.svelte';
  import { pb } from 'src/lib/db';
  import type { Profile } from 'src/lib/types';
  import { onMount } from 'svelte';
  import * as amplitude from '@amplitude/analytics-browser';

  $: profilePromise = null as Promise<Profile | null>;

  function id(_profile: Profile) {
    const identifyEvent = new amplitude.Identify();
    identifyEvent.set('telegram_id', _profile?.telegram_id);
    identifyEvent.set('name', _profile?.full_name);
    identifyEvent.set('username', _profile?.username);
    identifyEvent.set('id', _profile?.id);
    amplitude.identify(identifyEvent);
  }

  async function loadProfile() {
    let _profile = null as Profile | null;
    const s = await chrome.storage.sync.get();

    console.log('Open popup', s);

    if (!s.code) {
      /**
       * Create code, user will be assigned later
       */
      const newCode = await pb.collection('verification_codes').create({});
      await chrome.storage.sync.set({ code: newCode.id });
    } else {
      const key = `profile_for_code/${s.code}`;
      if (s[key]) {
        _profile = s[key];
        id(_profile);
        return _profile;
      }

      const code = await pb.collection('verification_codes').getOne(s.code);

      console.log('code: ', code);

      if (!code) {
        console.log('no code: popup -> index.ts ');
        throw new Error('no code: popup -> index.ts');
      }

      console.log('code user: ', code?.user);
      if (code.user) {
        _profile = await pb.collection('profiles').getOne<Profile | null>(code.user);
        await chrome.storage.sync.set({ [key]: _profile });
      }
    }

    id(_profile);
    return _profile;
  }

  onMount(async () => {
    profilePromise = loadProfile();
  });
</script>

{#await profilePromise}
  <div class="container px-4">
    <p class="text-center font-bold animate-pulse text-xl my-8">Loading...</p>
  </div>
{:then profile}
  {#if !profile}
    <SignIn />
  {:else}
    <Options {profile} />
  {/if}
{:catch error}
  <div class="container px-4">
    <p class="text-center text-lg my-8">
      {`Auth error: ${error}`}
      <ClearCache />
    </p>
  </div>
{/await}
