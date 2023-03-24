// import 'virtual:windi.css';
import Main from 'src/content/Main.svelte';
import { storage } from '../storage';

// Some global styles on the page
import './styles.css';

console.log('Hello from content script!');

const root = document.createElement('div');
root.id = 'extension-root';
document.body.appendChild(root);

const render = () => new Main({ target: root });
render();

// function waitForElement(selector, callback) {
//   const element = document.querySelector(selector);
//   if (element) {
//     callback(element.parentNode);
//   } else {
//     setTimeout(() => waitForElement(selector, callback), 500);
//   }
// }

// function performActions() {
//   const searchInput = document.querySelector('input[placeholder="Search"]');
//   if (searchInput) {
//     searchInput.value = 'Saved messages';
//     searchInput.dispatchEvent(new Event('input', { bubbles: true }));

//     setTimeout(() => {
//       waitForElement('.search-section .saved-messages', element => {
//         console.log('element', element);
//         setTimeout(() => {
//           element[0]?.click();
//           const openedUrl = window.location.href;
//           console.log('Opened URL:', openedUrl);
//         }, 1000);
//       });
//     }, 2000);
//   }
// }

// chrome.storage.sync.get().then(r => {
//   console.log('r', r);
//   if (window.location.href.includes('web.telegram.org') && !r.fetchChatId) {
//     chrome.storage.sync.set({ fetchChatId: false });
//     setTimeout(() => {
//       performActions();
//     }, 1000);
//   }
// });
