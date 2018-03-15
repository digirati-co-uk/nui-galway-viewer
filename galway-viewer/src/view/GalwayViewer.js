import Canvas from './Canvas';
import {
  CurrentLevel, DeepStructureState, depthOf, findLevel, getDisplayRanges, manifestToStructure, mapDepths,
  matchesRange
} from '../utils';
import StartScreen from "./StartScreen";
import Header from "./Header";
import Drawer from "./Drawer";
import Controls from "./Controls";
import Timeline from './Timeline';
import Pager from "./Pager";

class GalwayViewer {

  constructor($el) {
    this.$el = $el;
    this.useCanvasLabel = ($el.getAttribute('data-use-canvas-labels') || '').toLowerCase() === 'true';
    this.forceHttps = ($el.getAttribute('data-force-https') || '').toLowerCase() === 'true';
    this.currentCanvas = 0;

    // Start screen.
    this.startScreen = new StartScreen($el.querySelector('.galway-start-screen'));

    // Header.
    this.header = new Header($el.querySelector('.galway-header'));

    this.header.onClickInfo(() => {
      this.startScreen.openStartScreen();
    });

    this.canvas = new Canvas($el.querySelector('.galway-player'));
    this.pager = new Pager($el.querySelector('.galway-paging'), { useCanvasLabel: true });
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
    this.deepStructureState = new DeepStructureState(this.structure);

    this.controls = new Controls(this.$el.querySelector('.galway-controls'), {totalElements: this.canvases.length});

    // Timeline
    this.timeline = new Timeline(this.$el.querySelector('.galway-timeline'), this.deepStructureState);
    this.timeline.onClickRange((item) => {
      this.deepStructureState.increaseDepth();
      if (item && item.range) {
        this.goToPage(item.range[0]);
      }
    });
    this.timeline.onClickBreadcrumb(item => {
      this.deepStructureState.decreaseDepth();
      if (item && item.range) {
        this.goToPage(item.range[0]);
      }
    });
    this.timeline.onBack(() => {
      this.deepStructureState.decreaseDepth();
      this.render(this.lastCanvasIndex);
    });

    // Drawer.
    this.drawer = new Drawer(this.$el.querySelector('.galway-drawer'), this.structure);
    this.drawer.onItemClick(item => {
      this.deepStructureState.increaseDepth();
      if (item && item.range) {
        this.goToPage(item.range[0]);
      }
    });

    this.header.onClickMenu(() => {
      this.drawer.openMenu();
    });

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

    window.onpopstate = (event) => {
      const hash = GalwayViewer.readNavigation('canvas');
      if (hash) {
        this.render(hash);
      }
    };

  }

  render(canvasId) {
    const canvasIndex = this.canvases.findIndexById(canvasId);
    if (canvasIndex === this.currentCanvas) {
      return;
    }
    this.currentCanvas = canvasIndex;
    const model = this.deepStructureState.getModel(canvasIndex);
    GalwayViewer.navigateTo(canvasId);
    const canvas = this.canvases[canvasIndex];

    // Render.
    this.timeline.render(canvasIndex, model);
    this.controls.setValue(canvasIndex);
    this.drawer.render(canvasIndex, model);
    this.pager.render(canvas.label, canvasIndex, this.canvases.length);

    this.canvas.render({
      canvas,
      nextCanvas: this.canvases[canvasIndex + 1] ? this.canvases[canvasIndex + 1] : null,
      prevCanvas: this.canvases[canvasIndex - 1] ? this.canvases[canvasIndex - 1] : null,
      forceHttps: this.forceHttps,
    });

    // Set the last index for the next time.
    this.lastCanvasIndex = canvasIndex;
  }

}


export default GalwayViewer;
