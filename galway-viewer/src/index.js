import GalwayViewer from './view/GalwayViewer';
import './style.css';
import 'whatwg-fetch';

const viewer = new GalwayViewer(document.querySelector('.main'));
viewer.loadUri('https://iiif.library.nuigalway.ie/manifests/p135/memoir.json');
