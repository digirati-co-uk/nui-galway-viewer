import {getDisplayRanges, startDurationTime} from '../utils';
import Canvas from './Canvas';
import $ from 'jquery';

export default class Viewer {

  constructor() {
    this.canvas = new Canvas(document.querySelector('.viewer'));
    this.$dateDisplayRanges = document.querySelector('.timeline__item-container');
    this.$canvasDisplayRanges = document.querySelector('.timeline__item-container');

    this.displayRanges = [];
    this.currentRange = null;
    this.currentCanvas = null;
    this.$notches = {};
  }

  loadUri(manifestUri) {
    $.ajax({
      dataType: 'json',
      url: manifestUri,
      cache: true,
      success: (manifest) => this.load(manifest),
    });
  }

  load(manifest) {
    IIIF.wrap(manifest);
    // we're going to assume that there is one top level range, and then the
    // child ranges. This is for the one manifest demo.
    if (manifest.structures && 'top' === manifest.structures[0].viewingHint) {
      let canvases = manifest.sequences[0].canvases;
      let displayRanges = getDisplayRanges(manifest);
      this.setDisplayRanges(displayRanges, canvases);
      this.canvases = canvases;

      document.getElementById('next').addEventListener('click', () => {
        if (this.canvases[this.currentCanvas + 1]) {
          this.navigateToCanvas(this.canvases[this.currentCanvas + 1].id);
        }
      });
      document.getElementById('previous').addEventListener('click', () => {
        if (this.canvases[this.currentCanvas - 1]) {
          this.navigateToCanvas(this.canvases[this.currentCanvas - 1].id);
        }
      });

      // $('.canvasSource').on('click', (e) => {
      //   const cvid = e.currentTarget.getAttribute('data-canvasid');
      //   if (cvid) {
      //     this.navigateToCanvas(cvid);
      //   }
      // });

      $('#scaleMode').change(function () {
        if (this.checked) {
          $('#canvases').hide();
          $('#canvasDisplayRanges').hide();
          $('#ranges').show();
        } else {
          $('#canvases').show();
          $('#canvasDisplayRanges').show();
          $('#ranges').hide();
        }
      });

      $('#ranges').hide();

      this.navigateToCanvas(this.canvases[0].id);

    } else {
      console.log('need a top level range');
    }
  }

  makeNotches(canvases) {
    // see https://github.com/digirati-co-uk/nui-galway-viewer/issues/1

    let canvasWidth = 100.0 / canvases.length;
    let $canvases = $('#canvases');
    // let $canvasDisplayRanges = $('#canvasDisplayRanges');
    // yeah, storing the model in the DOM...
    // create two sets of divs. First set has one div for each canvas:
    for (let ci = 0; ci < canvases.length; ci++) {
      const canvas = canvases[ci];
      const cv = document.createElement('div');
      cv.className = 'navCanvas canvasSource ' + (ci % 2 === 0 ? 'even' : 'odd');
      cv.style.width = canvasWidth + '%';
      cv.setAttribute('data-canvasid', canvas.id);
      $canvases.append(cv);
    }

    // We are going to make some very strong assumptions in the prototype.
    // We assume that within a range, the canvases are in the right order and that they are contiguous.
    // A more robust solution would do some sorting.
    // This approach also offers later possibility of stacked overlapping ranges:
    // ----    ---------   ----
    //    ------------   -----
    //        ---- ------
    // ...etc
    // for (let ri = 0; ri < displayRanges.length; ri++) {
    //   const displayRange = displayRanges[ri];
    //   const navRange = document.createElement('div');
    //   navRange.className = 'navRange canvasSource ' + (ri % 2 === 0 ? 'even' : 'odd');
    //   navRange.style.width = canvasWidth * displayRange.canvases.length + '%';
    //   navRange.textContent = displayRange.label;
    //   const index = canvases.findIndexById(displayRange.canvases[0].id);
    //   navRange.style.left = index * canvasWidth + '%';
    //   navRange.setAttribute('data-rangeid', displayRange.id);
    //   navRange.setAttribute('data-canvasid', displayRange.canvases[0].id);
    //   $canvasDisplayRanges.append(navRange);
    // }

  }

  setDisplayRanges(displayRanges, canvases) {
    const {start, duration} = startDurationTime(displayRanges);
    const canvasWidth = 100.0 / canvases.length;

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
        rangeWidth: (displayRangeDuration * 100.0) / duration,
        rangeOffset: offset * 100.0 / duration,
        next: this.displayRanges[index + 1] ? this.displayRanges[index + 1] : null,
        prev: this.displayRanges[index - 1] ? this.displayRanges[index - 1] : null,
        // Relative to canvas.
        canvasWidth: canvasWidth * displayRange.canvases.length,
        canvasOffset: canvasIndex * canvasWidth,
      };
    });

    this.makeCanvasNav(this.displayRanges);
    // this.makeRangeNav(this.displayRanges);

    // this.makeNotches(canvases);
  }

  makeRangeNav(displayRanges) {
    // Display
    this.displayRanges = displayRanges.map(range => {
      const navRange = document.createElement('div');
      navRange.className = 'navRange canvasSource ' + (range.index % 2 === 0 ? 'even' : 'odd');
      navRange.style.left = `${range.rangeOffset}%`;
      navRange.style.width = `${range.rangeWidth}%`;
      navRange.textContent = range.label;
      navRange.setAttribute('data-rangeid', range.id);
      navRange.setAttribute('data-canvasid', range.canvas);
      navRange.addEventListener('click', () => {
        this.navigateToCanvas(range.canvas);
      });

      return {
        ...range,
        $rangeNav: navRange
      };
    });

    this.displayRanges.map(
      item => this.$dateDisplayRanges.appendChild(item.$rangeNav),
    );
  }

  makeTimelineItem({ label, year, left, width }) {
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
        year: 2000,
      });

      navCanvas.setAttribute('data-rangeid', range.id);
      navCanvas.setAttribute('data-canvasid', range.canvas);

      navCanvas.addEventListener('click', () => {
        this.navigateToCanvas(range.canvas);
      });

      return {
        ...range,
        $canvasNav: navCanvas
      };
    });

    this.displayRanges.map(
      item => this.$canvasDisplayRanges.appendChild(item.$canvasNav),
    );
  }

  renderDateRanges(canvasId) {
    // Remove previously selected.
    // const selected = this.$dateDisplayRanges.querySelector('.selected');
    // if (selected) {
    //   selected.classList.remove('selected');
    // }
    const selectedC = this.$canvasDisplayRanges.querySelector('.timeline__item--active');
    if (selectedC) {
      selectedC.classList.remove('timeline__item--active');
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
    // this.currentRange.$rangeNav.classList.add('selected');
  }

  navigateToCanvas(canvasId) {
    const canvasIndex = this.canvases.findIndexById(canvasId);
    this.currentCanvas = canvasIndex;
    const canvas = this.canvases[canvasIndex];
    this.renderDateRanges(canvasId);

    $('#position').text(canvas['label'] + ' (' + (canvasIndex + 1) + ' of ' + this.canvases.length + ')');

    this.canvas.render({
      canvas,
      nextCanvas: this.canvases[canvasIndex + 1] ? this.canvases[canvasIndex + 1] : null,
      prevCanvas: this.canvases[canvasIndex - 1] ? this.canvases[canvasIndex - 1] : null,
    });
  }
}
