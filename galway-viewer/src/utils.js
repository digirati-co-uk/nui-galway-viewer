export const TEMPORAL = 'dcterms:temporal';

export function first(obj, predicate) {
  const array = asArray(obj);
  if (predicate) {
    return first(array.filter(predicate));
  }
  return array.length ? array[0] : null;
}

export function asArray(objOrArray) {
  return Array.isArray(objOrArray) ? objOrArray : [objOrArray];
}

export function parseFrag(xywh, ratio = 1) {
  const co = (xywh.split('=')[1] || '');
  const [x, y, width, height] = co.split(',').map(e => e.trim()).map(n => parseInt(n, 10));
  return {
    x: x * ratio,
    y: y * ratio,
    width: width * ratio,
    height: height * ratio,
  };
}

export function mapCanvasIds(manifest, canvasIds) {
  if (!(
      manifest &&
      manifest.sequences &&
      manifest.sequences[0] &&
      manifest.sequences[0].canvases
    )) {
    return [];
  }
  return canvasIds.map(function (canvasId) {
    return first(manifest.sequences[0].canvases, cv => cv.id === canvasId);
  }).filter(cv => cv);
}

export const flatten = list => Array.prototype.concat(...list);

export function startDurationTime(displayRanges) {
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
  const duration = end.getTime() - start.getTime();
  return {start, duration};
}

export function getDisplayRanges(manifest) {
  // wire up ranges into something more useful. This is making a lot of assumptions,
  // needs to be generalised to work with arbitrary manifests
  const rangesOfInterest = manifest.structures ? manifest.structures.filter(function (range) {
    return range[TEMPORAL] && range.canvases && range.canvases.length > 0;
  }) : [];
  return rangesOfInterest.map(function (iiifRange) {
    const dateStrings = iiifRange[TEMPORAL].split('/');
    return {
      start: new Date(dateStrings[0]),
      end: new Date(dateStrings[1]),
      label: iiifRange['label'],
      canvases: mapCanvasIds(manifest, iiifRange.canvases),
      id: iiifRange.id,
    };
  });
}

// Polyfills
if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = function (callback, thisArg) {
    thisArg = thisArg || window;
    for (var i = 0; i < this.length; i++) {
      callback.call(thisArg, this[i], i, this);
    }
  };
}
