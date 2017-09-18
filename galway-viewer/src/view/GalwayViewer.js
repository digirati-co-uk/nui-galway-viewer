import Canvas from './Canvas';
import Slider from './Slider';
import Timeline from './Timeline';
import Pager from './Pager';
import {getDisplayRanges} from '../utils';

class GalwayViewer {

  constructor($el) {
    this.$el = $el;
    this.canvas = new Canvas($el.querySelector('.viewer')); // @todo change to viewer.
    this.timeline = new Timeline($el.querySelector('.timeline'), (canvasId) => this.render(canvasId));
    this.pager = new Pager($el.querySelector('.paging'), {
      nextPage: () => this.nextPage(),
      prevPage: () => this.prevPage(),
    });
    document.addEventListener('keydown', (e) => {
      if (e.keyCode === 37) {
        this.prevPage();
      }
      if (e.keyCode === 39) {
        this.nextPage();
      }
    });
  }

  // Core
  loadUri(manifestUri) {
    fetch(manifestUri, {cache: 'force-cache'}).then(m => m.json()).then(manifest => {
      this.load(manifest);
    });
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

  // Core
  load(manifest) {
    IIIF.wrap(manifest);
    // we're going to assume that there is one top level range, and then the
    // child ranges. This is for the one manifest demo.
    if (!manifest.structures || 'top' !== manifest.structures[0].viewingHint) {
      return null;
    }
    this.canvases = manifest.sequences[0].canvases;
    let displayRanges = getDisplayRanges(manifest);
    this.timeline.setDisplayRanges(displayRanges, this.canvases);
    this.slider = new Slider(this.$el.querySelector('.timeline__slider'), this.canvases.length, e => {
        const index = parseInt(e.currentTarget.value, 10);
        const canvas = this.canvases[index];
        if (canvas !== this.currentCanvas) {
          this.render(this.canvases[index].id);
        }
    });
    this.render(this.canvases[0].id);
  }

  render(canvasId) {
    const canvasIndex = this.canvases.findIndexById(canvasId);
    this.currentCanvas = canvasIndex;
    const canvas = this.canvases[canvasIndex];

    // Render.
    this.slider.render(canvasIndex);
    this.timeline.render(canvasId);
    this.pager.render(canvas, canvasIndex, this.canvases.length);
    this.canvas.render({
      canvas,
      nextCanvas: this.canvases[canvasIndex + 1] ? this.canvases[canvasIndex + 1] : null,
      prevCanvas: this.canvases[canvasIndex - 1] ? this.canvases[canvasIndex - 1] : null,
    });
  }

}

export default GalwayViewer;
