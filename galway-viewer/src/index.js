import GalwayViewer from './view/GalwayViewer';
import './style.css';
import 'whatwg-fetch';

const viewer = new GalwayViewer(document.querySelector('.main'));
viewer.loadUri('https://wellcomelibrary.org/iiif/b28047345/manifest');
