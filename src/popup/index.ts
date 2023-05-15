import 'virtual:windi.css';
import Loading from 'src/popup/Loading.svelte';
import * as amplitude from '@amplitude/analytics-browser';

amplitude.init('44555c92ae8880f2e94b64aa87a5f0e1');
const target = document.getElementById('app');

async function render() {
  target.innerHTML = '';
  amplitude.track('popup_opened');
  new Loading({ target, props: {} });
}

document.addEventListener('DOMContentLoaded', render);
document.addEventListener('focus', render);

chrome.history.onVisited.addListener(async (result) => {
  render();
});
