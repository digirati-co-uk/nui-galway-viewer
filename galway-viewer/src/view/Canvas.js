import Supplemental from './Supplemental';
import Link from './Link';
import Dragon from './Dragon';
import $ from 'jquery';

export default class Canvas {

  constructor($el) {
    this.$el = $el;
    this.$imageContainer = document.createElement('div');
    this.$imageContainer.classList.add('viewer__image');
    this.$osdContainer = document.createElement('div');
    this.$osdContainer.classList.add('viewer__osd');

    this.$supplimental = new Supplemental(document.querySelector('.supplemental'));
    this.$link = new Link(document.getElementById('linkDump'));
    this.openSeaDragonCache = {};

    this.$imageContainer.addEventListener('click', () => {
      this.$imageContainer.classList.add('viewer__image--disabled');
      this.$osdContainer.classList.add('viewer__osd--active');
      this.currentOsd.osd.viewport.zoomBy(1.1);
    });

    this.$el.appendChild(this.$osdContainer);
    this.$el.appendChild(this.$imageContainer);
    this.voidSetup();
  }

  handleClick = canvasId => (href, e) => {
    e.preventDefault();
    e.stopPropagation();
    $.ajax({
      dataType: 'json',
      url: href,
      cache: true,
      success: (manifest) => {
        this.$supplimental.render({manifest, canvasId});
      },
    });
  };

  static dropCaseComparison(a, b) {
    return (a ? a : '').toLowerCase() === (b ? b : '').toLowerCase();
  }

  voidSetup() {
    const $cached = document.getElementById('void');
    $cached.innerText = '';
    this.void = {
      previous: document.createElement('div'),
      osdPrevious: document.createElement('div'),
      osd: document.createElement('div'),
      osdNext: document.createElement('div'),
      next: document.createElement('div'),
    };
    $cached.appendChild(this.void.previous);
    $cached.appendChild(this.void.osdPrevious);
    $cached.appendChild(this.void.osd);
    $cached.appendChild(this.void.osdNext);
    $cached.appendChild(this.void.next);
  }

  static img(src) {
    const image = document.createElement('img');
    image.src = src;
    return image;
  }

  renderOsd(toRender) {
    if (!toRender) {
      return;
    }
    if (this.currentOsd) {
      this.currentOsd.close(this.$osdContainer);
    }
    this.currentOsd = toRender;
    if (this.void.osdNext.contains(toRender.$container)) {
      this.void.osdNext.removeChild(toRender.$container);
    }
    if (this.void.osdPrevious.contains(toRender.$container)) {
      this.void.osdPrevious.removeChild(toRender.$container);
    }
    toRender.open(this.$osdContainer);
  }

  loadOsd(canvas, $target = null) {
    this.openSeaDragonCache[canvas.id] = this.openSeaDragonCache[canvas.id] ? this.openSeaDragonCache[canvas.id] : new Dragon(canvas);
    if ($target) {
      this.openSeaDragonCache[canvas.id].open($target);
    }
  }

  preload({ next, prev }) {
    this.void.next.innerText = '';
    this.void.next.appendChild(Canvas.img(next));
    this.void.previous.innerText = '';
    this.void.previous.appendChild(Canvas.img(prev));
  }

  render({canvas, nextCanvas, prevCanvas}) {
    // here you need to add sensible logic for your images. I know that Galway's are level 2 (Loris),
    // and I know that the annotated resource image is full size, and too big. So I'm going to ask for a smaller one.
    const imageUrl = canvas.images[0].resource.service.id + '/full/!1600,1600/0/default.jpg';
    const imageUrlNext = nextCanvas ? nextCanvas.images[0].resource.service.id + '/full/!1600,1600/0/default.jpg' : null;
    const imageUrlPrev = prevCanvas ? prevCanvas.images[0].resource.service.id + '/full/!1600,1600/0/default.jpg': null;

    this.preload({ next: imageUrlNext, prev: imageUrlPrev });

    this.$imageContainer.classList.remove('viewer__image--disabled');
    this.$osdContainer.classList.remove('viewer__osd--active');


    this.$imageContainer.innerHTML = '';
    const image = document.createElement('img');
    image.src = imageUrl;
    this.$imageContainer.appendChild(image);
    // this.$el.style.backgroundImage = `url(${imageUrl})`;
    this.$link.renderEmpty();
    this.$supplimental.renderEmpty();

    this.loadOsd(canvas);
    this.renderOsd(this.openSeaDragonCache[canvas.id]);
    if (nextCanvas) {
      this.void.osdNext.innerHTML = '';
      this.loadOsd(nextCanvas, this.void.osdNext);
    }
    if (prevCanvas) {
      this.void.osdPrevious.innerHTML = '';
      this.loadOsd(prevCanvas, this.void.osdPrevious);
    }

    if (canvas.otherContent) {
      for (let ai = 0; ai < canvas.otherContent.length; ai++) {
        $.ajax({
          dataType: 'json',
          url: canvas.otherContent[ai]['@id'],
          cache: true,
          success: (annoList) => {
            if (annoList.resources) {
              for (let ri = 0; ri < annoList.resources.length; ri++) {
                // we're only interested in links to canvases in other manifests here.
                const anno = annoList.resources[ri];
                if (Canvas.dropCaseComparison(anno.motivation, 'oa:linking')) {
                  const parts = anno.on.split('#');
                  const cvid = parts[0];
                  const xywh = parts.length > 1 ? parts[1] : null;
                  // will populate this object:
                  const linkToManifest = {
                    xywh: xywh,
                    url: null,
                    canvasId: null,
                    label: null,
                    description: null,
                  };
                  if (anno.resource['@type'] === 'sc:Manifest') {
                    linkToManifest.url = anno.resource['@id'];
                    linkToManifest.label = anno.resource.label;
                    linkToManifest.description = anno.resource.description;
                  } else if (Canvas.dropCaseComparison(anno.resource['@type'], 'sc:Canvas')) {
                    // we MUST be given a within otherwise we're stuffed
                    if (anno.resource.within && Canvas.dropCaseComparison(anno.resource.within['@type'], 'sc:Manifest')) {
                      linkToManifest.url = anno.resource.within['@id'];
                      linkToManifest.label = anno.resource.within.label;
                      linkToManifest.description = anno.resource.within.description;
                      linkToManifest.canvasId = anno.resource['@id'];
                    }
                  }
                  if (linkToManifest.url) {
                    this.$link.render({linkToManifest, handleClick: this.handleClick });
                  }
                }
              }
            }
          },
        });
      }
    }
  }

}
