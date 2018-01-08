import Canvas from './Canvas';
import {getDisplayRanges} from '../utils';
import StartScreen from "./StartScreen";
import Header from "./Header";
import Drawer from "./Drawer";
import Controls from "./Controls";
import DeepRange from "./DeepRange";

class GalwayViewer {

  constructor($el) {
    this.$el = $el;
    this.useCanvasLabel = ($el.getAttribute('data-use-canvas-labels')||'').toLowerCase() === 'true';
    this.forceHttps = ($el.getAttribute('data-force-https')||'').toLowerCase() === 'true';
    this.currentCanvas = 0;

    // Start screen.
    this.startScreen = new StartScreen($el.querySelector('.galway-start-screen'));

    // Header.
    this.header = new Header($el.querySelector('.galway-header'));

    // Drawer.
    this.drawer = new Drawer($el.querySelector('.galway-drawer'));

    // Deep range
    this.deepRange = new DeepRange();
    this.deepRange.onClickRange(item => {
      if (item && item.range) {
        this.goToPage(item.range[0]);
      }
    });

    this.header.onClickMenu(() => {
      this.drawer.openMenu();
    });

    this.header.onClickInfo(() => {
      this.startScreen.openStartScreen();
    });

    this.canvas = new Canvas($el.querySelector('.galway-player'));
  }

  // Core
  loadUri(manifestUri) {
    fetch(manifestUri, {cache: 'force-cache'}).then(m => m.json()).then(manifest => {
      this.load(manifest);
    });
  }

  goToPage(n) {
    if (this.canvases[n]) {
      this.render(this.canvases[n].id);
    }
  }

  // Core
  nextPage() {
    if (this.canvases[this.currentCanvas + 1]) {
      this.render(this.canvases[this.currentCanvas + 1].id);
    }
  }

  // Core
  prevPage() {
    if (this.canvases[this.currentCanvas - 1]) {
      this.render(this.canvases[this.currentCanvas - 1].id);
    }
  }

  static readNavigation() {
    const query = window.location.hash.slice(1, 2) === '?' ? window.location.hash.slice(2) : window.location.hash.slice(1);
    const vars = query.split('&');
    for (let i = 0; i < vars.length; i++) {
      const pair = vars[i].split('=');
      if (decodeURIComponent(pair[0]) === 'canvas') {
        return decodeURIComponent(pair[1]);
      }
    }
  }

  static navigateTo(canvasId) {
    window.location.hash = `#?canvas=${canvasId}`;
  }

  // Core
  load(manifest) {
    IIIF.wrap(manifest);
    // we're going to assume that there is one top level range, and then the
    // child ranges. This is for the one manifest demo.
    if (!manifest.structures || 'top' !== manifest.structures[0].viewingHint) {
      return null;
    }
    this.startCanvas = manifest.startCanvas || null;

    this.canvases = manifest.sequences[0].canvases;
    let displayRanges = getDisplayRanges(manifest);

    this.controls = new Controls(this.$el.querySelector('.galway-controls'), { totalElements: this.canvases.length });

    this.controls.onNext(() => this.nextPage());
    this.controls.onPrevious(() => this.prevPage());
    this.controls.onChangeSlider((n) => this.goToPage(n));

    // arrow keys, avoiding duplicates.
    document.addEventListener('keydown', (e) => {
      if (this.controls.isSliderElement(document.activeElement)) {
        return;
      }
      if (e.keyCode === 37/*left arrow*/) {
        this.prevPage();
      }
      if (e.keyCode === 39/*right arrow*/) {
        this.nextPage();
      }
    });

    const hash = GalwayViewer.readNavigation('canvas');

    this.render(hash ? hash : (this.startCanvas ? this.startCanvas : this.canvases[0].id));
  }

  render(canvasId) {
    GalwayViewer.navigateTo(canvasId);
    const canvasIndex = this.canvases.findIndexById(canvasId);
    this.currentCanvas = canvasIndex;
    const canvas = this.canvases[canvasIndex];

    // Render.
    this.deepRange.render(canvasIndex, 1);
    this.controls.setValue(canvasIndex);

    this.canvas.render({
      canvas,
      nextCanvas: this.canvases[canvasIndex + 1] ? this.canvases[canvasIndex + 1] : null,
      prevCanvas: this.canvases[canvasIndex - 1] ? this.canvases[canvasIndex - 1] : null,
      forceHttps: this.forceHttps,
    });
  }

}

export default GalwayViewer;
