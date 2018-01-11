import Canvas from './Canvas';
import {getDisplayRanges, manifestToStructure} from '../utils';
import StartScreen from "./StartScreen";
import Header from "./Header";
import Drawer from "./Drawer";
import Controls from "./Controls";
import Timeline from './Timeline';

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
    this.structure = manifestToStructure(manifest);

    this.controls = new Controls(this.$el.querySelector('.galway-controls'), { totalElements: this.canvases.length });
    // Timeline
    this.timeline = new Timeline(this.$el.querySelector('.galway-timeline'), this.structure);
    this.timeline.onClickRange(item => {
      if (item && item.range) {
        this.goToPage(item.range[0]);
      }
    });
    this.timeline.onClickBreadcrumb(item => {
      if (item && item.range) {
        this.goToPage(item.range[0]);
      }
    });

    // Drawer.
    this.drawer = new Drawer(this.$el.querySelector('.galway-drawer'), this.structure);

    this.header.onClickMenu(() => {
      this.drawer.openMenu();
    });

    this.controls.onNext(() => this.nextPage());
    this.controls.onPrevious(() => this.prevPage());
    this.controls.onChangeSlider((n) => this.goToPage(n));

    this.drawer.bus.listenFor('topRange:active', this.timeline.bus);
    this.drawer.bus.listenFor('topRange:inactive', this.timeline.bus);
    this.drawer.bus.subscribe('item:click', item => {
      if (item && item.range) {
        this.goToPage(item.range[0]);
      }
    });

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
    const fakeDepth = 0;

    GalwayViewer.navigateTo(canvasId);
    const canvasIndex = this.canvases.findIndexById(canvasId);
    this.currentCanvas = canvasIndex;
    const canvas = this.canvases[canvasIndex];

    // Render.
    this.timeline.render(canvasIndex, fakeDepth);
    this.controls.setValue(canvasIndex);
    this.drawer.render(canvasIndex);

    this.canvas.render({
      canvas,
      nextCanvas: this.canvases[canvasIndex + 1] ? this.canvases[canvasIndex + 1] : null,
      prevCanvas: this.canvases[canvasIndex - 1] ? this.canvases[canvasIndex - 1] : null,
      forceHttps: this.forceHttps,
    });
  }

}

export default GalwayViewer;
