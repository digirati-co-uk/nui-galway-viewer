export const TEMPORAL = 'dcterms:temporal';

export function dropCaseComparison(a, b) {
  return (a ? a : '').toLowerCase() === (b ? b : '').toLowerCase();
}

export function mapAnnotation(annotation) {
  const linkToManifest = {
    xywh: null,
    url: null,
    canvasId: null,
    label: null,
    description: null,
  };
  if (dropCaseComparison(annotation.motivation, 'oa:linking')) {
    const parts = annotation.on.split('#');
    linkToManifest.xywh = parts.length > 1 ? parts[1] : null;
    // will populate this object:
    if (annotation.resource['@type'] === 'sc:Manifest') {
      linkToManifest.url = annotation.resource['@id'];
      linkToManifest.label = annotation.resource.label;
      linkToManifest.description = annotation.resource.description;
    } else if (dropCaseComparison(annotation.resource['@type'], 'sc:Canvas')) {
      // we MUST be given a within otherwise we're stuffed
      if (annotation.resource.within && dropCaseComparison(annotation.resource.within['@type'], 'sc:Manifest')) {
        linkToManifest.url = annotation.resource.within['@id'];
        linkToManifest.label = annotation.resource.within.label;
        linkToManifest.description = annotation.resource.within.description;
        linkToManifest.canvasId = annotation.resource['@id'];
      }
    }
  }
  if (!linkToManifest.url) {
    return null;
  }
  return linkToManifest;
}

export function setStyle($el, style) {
  if (style) {
    Object.keys(style)
      .map(key => ({key, value: style[key]}))
      .forEach(styleAttr => $el.style[styleAttr.key] = styleAttr.value);
  }
  return $el;
}

export function DOM(tagName, {className, onClick, style, attributes} = {}, children) {
  const $el = document.createElement(tagName);
  if (className) {
    if (Array.isArray(className)) {
      className.forEach(c => $el.classList.add(c));
    } else {
      $el.classList.add(className);
    }
  }
  if (onClick) {
    $el.addEventListener('click', onClick);
  }
  if (attributes) {
    Object.keys(attributes)
      .map(key => ({key, value: attributes[key]}))
      .forEach(attr => $el.setAttribute(attr.key, attr.value))
  }

  setStyle($el, style);

  if (children) {
    if (Array.isArray(children)) {
      children.forEach($child => $el.appendChild(typeof $child === 'string' ? document.createTextNode($child) : $child));
    }
    if (typeof children === 'string') {
      $el.innerText = children;
    }
  }
  return $el;
}

export function https(url) {
  if (url.substr(0, 5) !== 'http:') {
    return url;
  }
  return `https${url.substr(4)}`;
}

export function img(src, {forceHttps, id, onLoad = null}) {
  const image = document.createElement('img');
  if (id) {
    image.id = id;
  }
  if (onLoad) {
    image.addEventListener('load', (e) => onLoad(img));
  }
  image.src = forceHttps ? https(src) : src;
  return image;
}

export function link(href, text, onClick) {
  const link = document.createElement('a');
  link.href = href;
  link.innerText = text;
  link.addEventListener('click', (e) => {
    onClick(href, e);
  });
  return link;
}

export function paragraph(children, className) {
  const p = document.createElement('p');
  children.map($child =>
    p.appendChild(typeof $child === 'string' ? document.createTextNode($child) : $child),
  );
  if (className) {
    p.className = className;
  }
  return p;
}

export function div(props, children) {
  return DOM('div', props, children);
}

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

export class CurrentLevel {
  constructor(currentLevelViews, fullLevelKeys) {
    this.currentLevelViews = currentLevelViews;
    this.keys = currentLevelViews.map(item => item.key);
    this.first = fullLevelKeys.indexOf(currentLevelViews[0].key);
    this.last = fullLevelKeys.indexOf(currentLevelViews[currentLevelViews.length - 1].key);
    this.previous = this.first > 0 ? fullLevelKeys[this.first - 1] : null;
    this.next = this.last < fullLevelKeys.length ? fullLevelKeys[this.last + 1] : null;
  }

  findCurrent(key) {
    const index = this.keys.indexOf(key);
    if (index !== -1) {
      return this.currentLevelViews[index];
    }
  }

  isNext(key) {
    return (this.next && this.next === key);
  }

  isPrevious(key) {
    return (this.previous && this.previous === key);
  }
}

export function sortByKey(a, b) {
  if (a.key > b.key) {
    return 1;
  }
  if (a.key < b.key) {
    return -1;
  }
  return 0;
}

export function depthOf(object, level = 0) {
  const levels = [];
  for (const singleObj of object) {
    if (singleObj.children) {
      const depth = depthOf(singleObj.children, level + 1);
      levels.push(depth);
    }
  }
  level = Math.max(level, ...levels);
  return level;
}

export function findLevel(arr, canvasIndex, targetLevel, level = 0) {
  if (!arr) {
    return [];
  }
  if (targetLevel === level) {
    return arr || [];
  }
  const found = arr.reduce(findChildrenMatchingRange(canvasIndex), false);
  const nextLevel = level + 1;
  if (targetLevel === nextLevel) {
    return found.children ? found.children : (found ? [found] : []);
  }
  return findLevel(found.children, targetLevel, nextLevel);
}

export const RANGE_DISPLAY_NONE = 'RANGE_DISPLAY_NONE';
export const RANGE_DISPLAY_LARGE = 'RANGE_DISPLAY_LARGE';
export const RANGE_DISPLAY_PREV_NEXT = 'RANGE_DISPLAY_PREV_NEXT';

export function computeStyleFromItem(visibility, item) {
  if (visibility === RANGE_DISPLAY_NONE) {
    return {flex: 0.0001, 'flex-basis': '0px'};
  }
  if (visibility === RANGE_DISPLAY_PREV_NEXT) {
    return {flex: '0 0 80px'};
  }
  if (visibility === RANGE_DISPLAY_LARGE && item) {
    return {flex: item.range[1] - item.range[0], 'flex-basis': '0px'};
  }
  return {};
}

export function renderTemporal(item) {
  if (!item.temporal) {
    return '';
  }
  if (item.temporal.length <= 2) {
    return item.temporal.join(' - ');
  }
  return Math.min(item.temporal) + ' - ' + Math.max(item.temporal);
}

export function matchesRange(item, canvasIndex) {
  if (!item || !item.range) {
    return false;
  }
  const [from, to] = item.range;
  return (canvasIndex >= from && canvasIndex <= to);
}

export function findChildrenMatchingRange(canvasIndex) {
  return (found, structure) => {
    if (found === false && matchesRange(structure, canvasIndex)) {
      return structure;
    }
    return found;
  }
}

export function flattenDepth(object, targetLevel, level = 0) {
  if (targetLevel === level) {
    return object;
  }
  return object.reduce((children, singleChild) => {
    if ((level + 1) === targetLevel) {
      return children.concat(singleChild.children ? singleChild.children : [singleChild]);
    } else {
      return children.concat(singleChild.children ? flattenDepth(singleChild.children, targetLevel, level + 1) : singleChild);
    }
  }, []);
}

export function flattenAll(object) {
  return object.reduce((children, singleChild) => {
    children.push(singleChild);
    return children.concat(singleChild.children ? flattenAll(singleChild.children) : []);
  }, []);
}

export function assignNumber(vars) {
  return (singleItem) => {
    singleItem.key = vars.num;
    vars.num += 1;
    if (singleItem.children) {
      singleItem.children.forEach(assignNumber(vars));
    }
  };
}

export function mapDepths(structure, maxDepth) {
  const depthMap = [];
  for (let i = 0; i <= maxDepth; i++) {
    depthMap.push({
      depth: i,
      items: flattenDepth(structure, i)
    });
  }
  return depthMap;
}
