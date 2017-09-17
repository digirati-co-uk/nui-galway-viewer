import {getDisplayRanges, startDurationTime} from '../utils';
import Canvas from './Canvas';

export default class Viewer {

  constructor() {
    this.canvas = new Canvas(document.querySelector('.viewer'));
    this.$timeline = document.querySelector('.timeline');
    this.$canvasDisplayRanges = document.querySelector('.timeline__item-container');
    this.$sliderContainer = document.querySelector('.timeline__slider');
    this.minCanvasWidth = parseFloat(this.$timeline.getAttribute('data-min-width')) || 20.0;
    const $paging = document.querySelector('.paging');
    this.$pagingPosition = $paging.querySelector('.paging__position');
    this.$pagingTimeout = null;

    document.addEventListener('keydown', (e) => {
      if (e.keyCode === 37) {
        this.prevPage();
      }
      if (e.keyCode === 39) {
        this.nextPage();
      }
    });

    $paging.querySelector('.paging__next').addEventListener('click', () => this.nextPage());
    $paging.querySelector('.paging__previous').addEventListener('click', () => this.prevPage());

    this.displayRanges = [];
    this.currentRange = null;
    this.currentCanvas = null;
    this.$notches = {};
  }

  loadUri(manifestUri) {
    fetch(manifestUri, {cache: 'force-cache'}).then(m => m.json()).then(manifest => {
      this.load(manifest);
    });

    // $.ajax({
    //   dataType: 'json',
    //   url: manifestUri,
    //   cache: true,
    //   success: (manifest) => this.load(manifest),
    // });
  }

  nextPage() {
    if (this.canvases[this.currentCanvas + 1]) {
      this.navigateToCanvas(this.canvases[this.currentCanvas + 1].id);
    }
  }

  prevPage() {
    if (this.canvases[this.currentCanvas - 1]) {
      this.navigateToCanvas(this.canvases[this.currentCanvas - 1].id);
    }
  }

  load(manifest) {
    IIIF.wrap(manifest);
    // we're going to assume that there is one top level range, and then the
    // child ranges. This is for the one manifest demo.
    if (!manifest.structures || 'top' !== manifest.structures[0].viewingHint) {
      return null;
    }
    let canvases = manifest.sequences[0].canvases;
    let displayRanges = getDisplayRanges(manifest);
    this.setDisplayRanges(displayRanges, canvases);
    this.canvases = canvases;

    this.createSlider(displayRanges);

    this.navigateToCanvas(this.canvases[0].id);
  }

  createSlider() {
    this.$slider = document.createElement('input');
    this.$slider.setAttribute('type', 'range');
    this.$slider.setAttribute('max', this.canvases.length);
    this.$slider.setAttribute('value', 0);
    const onChange = (e) => {
      const index = parseInt(e.currentTarget.value, 10);
      const canvas = this.canvases[index];
      if (canvas !== this.currentCanvas) {
        this.navigateToCanvas(this.canvases[index].id);
      }
    };
    this.$slider.addEventListener('change', onChange);
    // This optimisation does not work.
    // this.$slider.addEventListener('mousemove', onChange);
    this.$sliderContainer.appendChild(this.$slider);
  }

  setDisplayRanges(displayRanges, canvases) {
    const relative = 100.0 - this.minCanvasWidth;

    const {start, duration} = startDurationTime(displayRanges);
    const canvasWidth = relative / canvases.length;
    const minWidth = this.minCanvasWidth / displayRanges.length;

    this.displayRanges = displayRanges.map((displayRange, index) => {
      const offset = displayRange.start.getTime() - start.getTime();
      const displayRangeDuration = displayRange.end.getTime() - displayRange.start.getTime();
      const canvasIndex = canvases.findIndexById(displayRange.canvases[0].id);


      return {
        ...displayRange,
        canvas: displayRange.canvases[0].id,
        canvasIds: displayRange.canvases.map(c => c.id),
        index,

        // Relative to range.
        timeOffset: offset,
        displayRangeDuration,
        rangeWidth: (displayRangeDuration * relative) / duration,
        rangeOffset: offset * relative / duration,
        next: this.displayRanges[index + 1] ? this.displayRanges[index + 1] : null,
        prev: this.displayRanges[index - 1] ? this.displayRanges[index - 1] : null,
        // Relative to canvas.
        canvasWidth: canvasWidth * displayRange.canvases.length + minWidth,
        canvasOffset: canvasIndex * canvasWidth + (minWidth * index),
      };
    });

    this.makeCanvasNav(this.displayRanges);
  }

  makeTimelineItem({label, year, left, width}) {
    const $item = document.createElement('div');
    $item.classList.add('timeline__item');
    $item.style.left = `${left}%`;
    $item.style.width = `${width}%`;

    const $box = document.createElement('div');
    $box.classList.add('timeline__box');

    const $label = document.createElement('div');
    $label.classList.add('timeline__label');
    $label.textContent = label;
    const $tool = document.createElement('div');
    $tool.classList.add('timeline__tooltip');
    $tool.textContent = label;

    const $year = document.createElement('div');
    $year.classList.add('timeline__year');
    $year.textContent = year;

    $box.appendChild($label);
    $box.appendChild($tool);
    $item.appendChild($year);
    $item.appendChild($box);
    return $item;
  }

  makeCanvasNav(displayRanges) {
    // Display
    this.displayRanges = displayRanges.map(range => {
      const navCanvas = this.makeTimelineItem({
        left: range.canvasOffset,
        width: range.canvasWidth,
        label: range.label,
        year: range.start.getFullYear(),
      });

      navCanvas.setAttribute('data-rangeid', range.id);
      navCanvas.setAttribute('data-canvasid', range.canvas);

      navCanvas.addEventListener('click', () => {
        this.navigateToCanvas(range.canvas);
      });

      return {
        ...range,
        $canvasNav: navCanvas,
      };
    });

    this.displayRanges.map(
      item => this.$canvasDisplayRanges.appendChild(item.$canvasNav),
    );
  }

  renderDateRanges(canvasId) {
    // Remove previously selected.
    const selected = this.$canvasDisplayRanges.querySelector('.timeline__item--active');
    if (selected) {
      selected.classList.remove('timeline__item--active');
    }

    // Find new to select.
    this.displayRanges.forEach(range => {
      if (range.canvasIds && range.canvasIds.indexOf(canvasId) !== -1) {
        this.currentRange = range;
      }
    });

    if (!this.currentRange) {
      return;
    }

    // Add class.
    this.currentRange.$canvasNav.classList.add('timeline__item--active');
  }

  navigateToCanvas(canvasId) {
    const canvasIndex = this.canvases.findIndexById(canvasId);
    this.$slider.value = canvasIndex;
    this.currentCanvas = canvasIndex;
    const canvas = this.canvases[canvasIndex];
    this.renderDateRanges(canvasId);

    clearTimeout(this.$pagingTimeout);
    this.$pagingPosition.classList.add('paging__position--active');
    this.$pagingTimeout = setTimeout(() => {
      this.$pagingPosition.classList.remove('paging__position--active');
    }, 2000);
    this.$pagingPosition.innerText = `${canvas['label']} (${canvasIndex + 1} of ${this.canvases.length})`;

    this.canvas.render({
      canvas,
      nextCanvas: this.canvases[canvasIndex + 1] ? this.canvases[canvasIndex + 1] : null,
      prevCanvas: this.canvases[canvasIndex - 1] ? this.canvases[canvasIndex - 1] : null,
    });
  }
}
