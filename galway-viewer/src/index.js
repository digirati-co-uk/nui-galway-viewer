import GalwayViewer from './view/GalwayViewer';
import manifest from './manifest.js';
import './style.css';


const viewer = new GalwayViewer(document.querySelector('.main'));
viewer.load(manifest);
