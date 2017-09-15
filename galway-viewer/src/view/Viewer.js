import {getDisplayRanges} from '../utils';
import Canvas from './Canvas';
import $ from 'jquery';

export default class Viewer {

  constructor() {
    this.canvas = new Canvas(document.getElementById('main'));
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
      this.makeCanvasNav(canvases, displayRanges);
      this.makeRangeNav(canvases, displayRanges);
      this.canvases = canvases;
      this.displayRanges = displayRanges;

      $('.canvasSource').on('click', (e) => {
        const cvid = e.currentTarget.getAttribute('data-canvasid');
        if (cvid) {
          this.navigateToCanvas(cvid);
        }
      });

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

  makeCanvasNav(canvases, displayRanges) {
    // see https://github.com/digirati-co-uk/nui-galway-viewer/issues/1

    let canvasWidth = 100.0 / canvases.length;
    let $canvases = $('#canvases');
    let $canvasDisplayRanges = $('#canvasDisplayRanges');
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
    for (let ri = 0; ri < displayRanges.length; ri++) {
      const displayRange = displayRanges[ri];
      const navRange = document.createElement('div');
      navRange.className = 'navRange canvasSource ' + (ri % 2 === 0 ? 'even' : 'odd');
      navRange.style.width = canvasWidth * displayRange.canvases.length + '%';
      navRange.textContent = displayRange.label;
      const index = canvases.findIndexById(displayRange.canvases[0].id);
      navRange.style.left = index * canvasWidth + '%';
      navRange.setAttribute('data-rangeid', displayRange.id);
      navRange.setAttribute('data-canvasid', displayRange.canvases[0].id);
      $canvasDisplayRanges.append(navRange);
    }

  }

  makeRangeNav(canvases, displayRanges) {
    // here we need to make the timeline div proportional to the time coverage of each range
    let start = null;
    let end = null;
    for (let ri = 0; ri < displayRanges.length; ri++) {
      const testRange = displayRanges[ri];
      if (!start || testRange.start < start) {
        start = testRange.start;
      }
      if (!end || testRange.end > end) {
        end = testRange.end;
      }
    }

    let $dateDisplayRanges = $('#ranges');

    let timelineDuration = end.getTime() - start.getTime();
    for (let ri = 0; ri < displayRanges.length; ri++) {
      const displayRange = displayRanges[ri];
      const navRange = document.createElement('div');
      navRange.className = 'navRange canvasSource ' + (ri % 2 === 0 ? 'even' : 'odd');
      const offset = displayRange.start.getTime() - start.getTime();
      const displayRangeDuration = displayRange.end.getTime() - displayRange.start.getTime();
      navRange.style.width = (displayRangeDuration * 100.0) / timelineDuration + '%';
      navRange.style.left = offset * 100.0 / timelineDuration + '%';
      navRange.textContent = displayRange.label;
      const index = canvases.findIndexById(displayRange.canvases[0].id);
      navRange.setAttribute('data-rangeid', displayRange.id);
      navRange.setAttribute('data-canvasid', displayRange.canvases[0].id);
      $dateDisplayRanges.append(navRange);
    }


  }

  navigateToCanvas(canvasId) {
    $('.canvasSource').removeClass('selected');
    const canvasIndex = this.canvases.findIndexById(canvasId);
    const canvas = this.canvases[canvasIndex];
    $('#main button').attr('data-canvasid', '');
    if (canvasIndex > 0) {
      $('#previous').attr('data-canvasid', this.canvases[canvasIndex - 1].id);
    }
    if (canvasIndex < this.canvases.length - 1) {
      $('#next').attr('data-canvasid', this.canvases[canvasIndex + 1].id);
    }
    // highlight active navigation element(s)
    $('.navCanvas').eq(canvasIndex).addClass('selected');
    for (let ri = 0; ri < this.displayRanges.length; ri++) {
      let displayRange = this.displayRanges[ri];
      for (let ci = 0; ci < displayRange.canvases.length; ci++) {
        if (displayRange.canvases[ci].id === canvas.id) {
          $('.navRange[data-rangeid=\'' + displayRange.id + '\']').addClass('selected');
        }
      }
    }
    $('#position').text(canvas['label'] + ' (' + (canvasIndex + 1) + ' of ' + this.canvases.length + ')');

    this.canvas.render({canvas});
  }
}
