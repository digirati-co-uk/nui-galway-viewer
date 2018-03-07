import "@babel/polyfill";
import GalwayViewer from './view/GalwayViewer';
import manifest from './manifest';

import './style.css';
import './scss/main.scss';
import 'whatwg-fetch';

const viewer = new GalwayViewer(document.querySelector('.main'));
// viewer.loadUri('https://iiif.library.nuigalway.ie/manifests/p135/memoir.json');
viewer.load(manifest);
