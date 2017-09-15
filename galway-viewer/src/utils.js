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
