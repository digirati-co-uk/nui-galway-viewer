
import {startDurationTime} from '../utils';

class Timeline {

  constructor($el, navigateToCanvas) {
    this.$timeline = $el;
    this.$canvasDisplayRanges = $el.querySelector('.timeline__item-container');
    this.$sliderContainer = $el.querySelector('.timeline__slider');
    this.minCanvasWidth = parseFloat($el.getAttribute('data-min-width')) || 20.0;
    this.displayRanges = [];
    this.currentRange = null;
    this.currentCanvas = null;
    this.navigateToCanvas = navigateToCanvas;
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

  static createItem({label, year, left, width}) {
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
      const navCanvas = Timeline.createItem({
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

  render(canvasId) {
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


}

export default Timeline;
