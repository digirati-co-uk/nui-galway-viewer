export const TEMPORAL = 'dcterms:temporal';

export function DOM(tagName, {className, style, attributes} = {}, children) {
  const $el = document.createElement(tagName);
  if (className) {
    if (Array.isArray(className)) {
      className.forEach(c => $el.classList.add(c));
    } else {
      $el.classList.add(className);
    }
  }
  if (attributes) {
    Object.keys(attributes)
      .map(key => ({key, value: attributes[key]}))
      .forEach(attr => $el.setAttribute(attr.key, attr.value))
  }
  if (style) {
    Object.keys(style)
      .map(key => ({key, value: style[key]}))
      .forEach(styleAttr => $el.style[styleAttr.key] = styleAttr.value);
  }
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

export function img(src, { forceHttps, id, onLoad = null }) {
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
