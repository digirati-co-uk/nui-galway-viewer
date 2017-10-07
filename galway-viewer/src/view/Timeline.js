import {startDurationTime} from '../utils';

class Timeline {

  constructor($el, navigateToCanvas) {
    this.$timeline = $el;
    this.$canvasDisplayRanges = $el.querySelector('.timeline__item-container');
    this.$sliderContainer = $el.querySelector('.timeline__slider');
    this.minCanvasWidth = parseFloat($el.getAttribute('data-min-width')) || 0;
    this.displayRanges = [];
    this.currentRange = null;
    this.currentCanvas = null;
    this.navigateToCanvas = navigateToCanvas;

    // Mobile
    this.mobileRanges = document.createElement('div');
    this.mobileRanges.classList.add('timeline__menu');
    this.mobileToggle = document.createElement('div');
    this.mobileToggle.classList.add('timeline__toggle');
    this.mobileToggle.addEventListener('click', () => {
      this.mobileRanges.classList.toggle('timeline__menu--active');
    });
    this.mobileRanges.appendChild(this.mobileToggle);
    this.$timeline.appendChild(this.mobileRanges);
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
    this.makeMobileNav(this.displayRanges);
  }

  static createItem({label, year, endYear, left, width}) {
    const $item = document.createElement('div');
    $item.classList.add('timeline__item');
    if (left) {
      $item.style.left = `${left}%`;
    }
    if (width) {
      $item.style.width = `${width}%`;
    }

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
    if (endYear) {
      $year.textContent = `${year} – ${endYear}`;
    } else {
      $year.textContent = year;
    }

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
        endYear: range.end ? range.end.getFullYear() : null,
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

  makeMobileNav(displayRanges) {
    // Display
    this.displayRanges = displayRanges.map(range => {
      const navCanvas = Timeline.createItem({
        label: range.label,
        year: range.start.getFullYear(),
        endYear: range.end ? range.end.getFullYear() : null,
      });

      navCanvas.setAttribute('data-rangeid', range.id);
      navCanvas.setAttribute('data-canvasid', range.canvas);

      navCanvas.addEventListener('click', () => {
        this.mobileRanges.classList.remove('timeline__menu--active');
        this.navigateToCanvas(range.canvas);
      });

      return {
        ...range,
        $mobileNav: navCanvas,
      };
    });

    this.displayRanges.map(
      item => this.mobileRanges.appendChild(item.$mobileNav),
    );
  }

  render(canvasId, label) {
    // Remove previously selected.
    const selected = this.$canvasDisplayRanges.querySelector('.timeline__item--active');
    if (selected) {
      selected.classList.remove('timeline__item--active');
    }
    const selectedMobile = this.mobileRanges.querySelector('.timeline__item--active');
    if (selectedMobile) {
      selectedMobile.classList.remove('timeline__item--active');
    }

    // Find new to select.
    this.displayRanges.forEach(range => {
      if (range.canvasIds && range.canvasIds.indexOf(canvasId) !== -1) {
        this.currentRange = range;
      }
    });

    this.mobileToggle.innerText = this.currentRange ? this.currentRange.label : label;

    if (!this.currentRange) {
      return;
    }

    // Add text.
    this.mobileToggle.innerText = this.currentRange.label;
    // Add class.
    this.currentRange.$canvasNav.classList.add('timeline__item--active');
    this.currentRange.$mobileNav.classList.add('timeline__item--active');
  }


}

export default Timeline;
