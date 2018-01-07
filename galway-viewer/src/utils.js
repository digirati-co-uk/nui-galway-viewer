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

export function byLevelsReducer(level, index = {n: 0}) {
  return (state, {...range, children}) => {
    state.depths[level] = state.depths[level] ? state.depths[level] : [];
    state.depths[level].push(index.n);
    state.flattened.push(range);
    index.n++;
    return children ? children.reduce(byLevelsReducer(level + 1, index), state) : state;
  };
}

export function rangeReducer(parentNum) {
  return (state, range) => {
    state.push(parentNum);
    return range.children ? range.children.reduce(rangeReducer(parentNum), state) : state;
  }
}

export function changePointsReducer(state, range) {
  state.push(range.range[0]);
  return range.children ? range.children.reduce(changePointsReducer, state) : state;
}

export function depthsReducer(currentDepth) {
  return (state, range) => {
    state[currentDepth] = state[currentDepth] ? state[currentDepth] : [];
    state[currentDepth] = state[currentDepth] ? state[currentDepth] : [];
    state[currentDepth].push(range.range[0]);

    return range.children ? range.children.reduce(depthsReducer(currentDepth + 1), state) : state;
  };
}

export function createMatrix(byLevels, parentDescription) {
  const DISPLAY = {
    COMPACT: 1,
    RELATIVE: -1,
    HIDDEN: 0,
  };

  return byLevels.depths.map(
    (fullSingleDepth, n) => {
        return fullSingleDepth.map(depth => {
          const fullCurrent = byLevels.flattened[depth];
            if (n > 0) {
              return fullSingleDepth.reduce((state, k) => {
                // console.log('parentDescription.ranges[depth]', parentDescription.ranges[k]);
                if (parentDescription.ranges[k] === parentDescription.ranges[depth]) {
                  // Previous.
                  if (fullSingleDepth[fullSingleDepth.indexOf(k) - 1]) {
                    const prev = fullSingleDepth[fullSingleDepth.indexOf(k) - 1];
                    state[prev] = state[prev] === DISPLAY.RELATIVE ?  state[prev]: DISPLAY.COMPACT;
                  }

                  // Current.
                  state[k] = DISPLAY.RELATIVE;


                  if (fullSingleDepth[fullSingleDepth.indexOf(k) + 1]) {
                    const next = fullSingleDepth[fullSingleDepth.indexOf(k) + 1];
                    state[next] = state[next] === DISPLAY.RELATIVE ?  state[next]: DISPLAY.COMPACT;
                  }
                  // // Next.
                  // if ((k + 1) < byLevels.flattened.length) {
                  //   state[k + 1] = DISPLAY.COMPACT;
                  // }
                } else {
                  // state[k] = state[k] === 1 ? state[k] : DISPLAY.HIDDEN;
                }
                // console.log('zero:', state[0]);
                return state;
              }, (new Array(byLevels.flattened.length)).fill(DISPLAY.HIDDEN)); // Hide everything by default.
            }

            return byLevels.depths[0].reduce((state, topLevelItem) => {
              state[topLevelItem] = DISPLAY.RELATIVE;
              return state;
            }, (new Array(byLevels.flattened.length)).fill(DISPLAY.HIDDEN)); // Hide everything by default.)
            // console.log('PD', byLevels.depths[0])
            // console.log('REL', depth, (new Array(depth.length)).fill(DISPLAY.RELATIVE));
            // return (new Array(byLevels.flattened.length)).fill(DISPLAY.RELATIVE); // Top level is all relative.
          }
        )
    });
}
