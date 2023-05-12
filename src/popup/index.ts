import 'virtual:windi.css';
import Loading from 'src/popup/Loading.svelte';

const target = document.getElementById('app');

async function render() {
  target.innerHTML = '';
  new Loading({ target, props: {} });
}

document.addEventListener('DOMContentLoaded', render);
document.addEventListener('focus', render);

chrome.history.onVisited.addListener(async (result) => {
  render();
});
