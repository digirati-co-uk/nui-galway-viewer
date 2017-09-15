import Viewer from './view/Viewer';
import manifest from './manifes.js';
import './style.css';

const viewer = new Viewer();
viewer.load(manifest);

// let app = document.querySelector('#app')
//
// app.innerHTML = '<h2>Welcome to galway-viewer</h2>'
