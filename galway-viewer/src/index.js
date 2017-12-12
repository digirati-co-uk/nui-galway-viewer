import GalwayViewer from './view/GalwayViewer';
import {MDCTemporaryDrawer} from '@material/drawer';
import {MDCSlider} from '@material/slider';

import './style.css';
import './scss/main.scss';
import 'whatwg-fetch';

// const viewer = new GalwayViewer(document.querySelector('.main'));
// viewer.loadUri('https://iiif.library.nuigalway.ie/manifests/p135/memoir.json');

const slider = new MDCSlider(document.querySelector('.mdc-slider'));
slider.listen('MDCSlider:change', () => slider.layout() && console.log(`Value changed to ${slider.value}`));
slider.listen('MDCSlider:open', () => slider.layout());

const drawer = new MDCTemporaryDrawer(document.querySelector('.mdc-temporary-drawer'));
document.querySelector('.galway-header__menu').addEventListener('click', (e) => {
  e.preventDefault();
  drawer.open = !drawer.open
});
