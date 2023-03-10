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
