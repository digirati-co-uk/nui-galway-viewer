import Supplemental from './Supplemental';
import Link from './Link';
import Dragon from './Dragon';
import {flatten, parseFrag} from '../utils';

export default class Canvas {

  constructor($el) {
    // Dom fetch
    this.$el = $el;
    this.$imageContainer = document.createElement('div');
    this.$imageContainer.classList.add('viewer__image');
    this.$osdContainer = document.createElement('div');
    this.$osdContainer.classList.add('viewer__osd');

    // Sub components
    this.$supplimental = new Supplemental(document.querySelector('.supplemental'));
    this.$link = new Link(document.getElementById('linkDump'));
    this.openSeaDragonCache = {};
    this.$annotationOverlay = null;
    this.$image = null;

    window.addEventListener('resize', () => {
      if (this.$image && this.$annotationOverlay) {
        if (this.$replay) {
          this.$replay();
        }
        this.updateOverlaySize(this.$image, this.$annotationOverlay);
      }
    });

    // Events.
    this.$imageContainer.addEventListener('click', () => this.activateOSD());

    // DOM render.
    this.$el.appendChild(this.$osdContainer);
    this.$el.appendChild(this.$imageContainer);
    this.voidSetup();
  }


  activateOSD() {
    this.$imageContainer.classList.add('viewer__image--disabled');
    this.$osdContainer.classList.add('viewer__osd--active');
    document.querySelector('.zoom').classList.add('zoom--active');
    this.currentOsd.osd.viewport.zoomBy(1.1);
  }

  handleClick = canvasId => (href, e) => {
    e.preventDefault();
    e.stopPropagation();
    fetch(href, {cache: 'force-cache'})
    .then(r => r.json())
    .then(
      manifest => this.$supplimental.render({manifest, canvasId}),
    );
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

  preload({next, prev}) {
    this.void.next.innerText = '';
    if (next) {
      this.void.next.appendChild(Canvas.img(next));
    }
    this.void.previous.innerText = '';
    if (prev) {
      this.void.previous.appendChild(Canvas.img(prev));
    }
  }

  renderAnnotations(otherContent) {
    if (!otherContent) {
      return Promise.resolve(null);
    }
    return Promise.all(otherContent.map(
      content => fetch(content['@id'], {cache: 'force-cache'})
      .then(r => r.json())
      .then(({resources}) => {
        if (!resources) {
          return [];
        }
        return resources.map(
          annotation => {
            const linkToManifest = {
              xywh: null,
              url: null,
              canvasId: null,
              label: null,
              description: null,
            };
            if (Canvas.dropCaseComparison(annotation.motivation, 'oa:linking')) {
              const parts = annotation.on.split('#');
              linkToManifest.xywh = parts.length > 1 ? parts[1] : null;
              // will populate this object:
              if (annotation.resource['@type'] === 'sc:Manifest') {
                linkToManifest.url = annotation.resource['@id'];
                linkToManifest.label = annotation.resource.label;
                linkToManifest.description = annotation.resource.description;
              } else if (Canvas.dropCaseComparison(annotation.resource['@type'], 'sc:Canvas')) {
                // we MUST be given a within otherwise we're stuffed
                if (annotation.resource.within && Canvas.dropCaseComparison(annotation.resource.within['@type'], 'sc:Manifest')) {
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
          },
        );
      }),
    )).then(flatten);
  }

  updateOverlaySize($image, $annotationOverlay) {
    const {width, height} = $image.getBoundingClientRect();

    // const fullWidth = parseInt($image.getAttribute('data-width'), 10);
    const fullHeight = parseInt($image.getAttribute('data-height'), 10);
    const ratio = height / fullHeight;

    $annotationOverlay.style.height = `${height}px`;
    $annotationOverlay.style.width = `${width}px`;
    $annotationOverlay.style.marginLeft = `-${width / 2}px`;

  }

  createStaticAnnotation(label, description, position = null) {
    const $annotation = document.createElement('div');
    const px = n => `${n}px`;
    if (position) {
      $annotation.style.width = px(position.width);
      $annotation.style.height = px(position.height);
      $annotation.style.top = px(position.y);
      $annotation.style.left = px(position.x);
    }
    $annotation.classList.add('annotation');

    const $label = document.createElement('div');
    $label.innerText = label;
    $label.classList.add('annotation__label');
    $annotation.appendChild($label);

    const $description = document.createElement('div');
    $description.innerText = description;
    $description.classList.add('annotation__description');
    $annotation.appendChild($description);

    return $annotation;
  }

  render({canvas, nextCanvas, prevCanvas}) {

    this.$replay = () => this.render({canvas, nextCanvas, prevCanvas});
    // here you need to add sensible logic for your images. I know that Galway's are level 2 (Loris),
    // and I know that the annotated resource image is full size, and too big. So I'm going to ask for a smaller one.
    const imageUrl = canvas.images[0].resource.service.id + '/full/!1600,1600/0/default.jpg';
    const imageUrlNext = nextCanvas ? nextCanvas.images[0].resource.service.id + '/full/!1600,1600/0/default.jpg' : null;
    const imageUrlPrev = prevCanvas ? prevCanvas.images[0].resource.service.id + '/full/!1600,1600/0/default.jpg' : null;

    // Preload previous and next <img/> tags.
    this.preload({
      next: imageUrlNext,
      prev: imageUrlPrev,
    });

    // Reset open seadragon to default hidden view.
    document.querySelector('.zoom').classList.remove('zoom--active');
    this.$imageContainer.classList.remove('viewer__image--disabled');
    this.$osdContainer.classList.remove('viewer__osd--active');

    // Add image
    this.$imageContainer.innerHTML = '';
    this.$image = Canvas.img(imageUrl);
    this.$image.setAttribute('data-width', canvas.width);
    this.$image.setAttribute('data-height', canvas.height);
    this.$imageContainer.appendChild(this.$image);

    // Empty previous links and supplemental
    this.$supplimental.renderEmpty();

    // Load current OSD, using cached preload if available.
    this.loadOsd(canvas);
    this.renderOsd(this.openSeaDragonCache[canvas.id]);

    // Preload previous and next OSD viewers
    if (nextCanvas) {
      this.void.osdNext.innerHTML = '';
      this.loadOsd(nextCanvas, this.void.osdNext);
    }
    if (prevCanvas) {
      this.void.osdPrevious.innerHTML = '';
      this.loadOsd(prevCanvas, this.void.osdPrevious);
    }

    // Finally render the annotations, at this point we will have OSD.
    this.renderAnnotations(canvas.otherContent).then(annotations => {
      if (!annotations) {
        return null;
      }

      // Annotation container.
      this.$annotationOverlay = document.createElement('div');
      this.$annotationOverlay.classList.add('annotation-overlay');
      this.$imageContainer.appendChild(this.$annotationOverlay);
      this.updateOverlaySize(this.$image, this.$annotationOverlay);
      this.$image.addEventListener('load', () => {
        this.updateOverlaySize(this.$image, this.$annotationOverlay);
      });

      // Grab a best guess image ratio.
      const imageRatio = (this.$imageContainer.getBoundingClientRect().height / canvas.height);
      this.$annotationOverlay.innerHTML = '';

      // Remove container
      this.currentOsd.reset().then(() => {

        // Add annotations to container.
        annotations.map(linkToManifest => {
          const {x, y, width, height} = parseFrag(linkToManifest.xywh, imageRatio);
          const $annotation = this.createStaticAnnotation(linkToManifest.label, linkToManifest.description, {
            width,
            height,
            x,
            y,
          });
          const $viewerAnnotation = this.createStaticAnnotation(linkToManifest.label, linkToManifest.description);
          $annotation.addEventListener('click', e => {
            e.stopPropagation();
            this.handleClick(linkToManifest.canvasId)(linkToManifest.url, e);
          });

          const viewerPosition = parseFrag(linkToManifest.xywh);
          this.$annotationOverlay.appendChild($annotation);
          $viewerAnnotation.addEventListener('click', e => {
            e.stopPropagation();
            this.handleClick(linkToManifest.canvasId)(linkToManifest.url, e);
          });
          this.currentOsd.addOverlay($viewerAnnotation, viewerPosition);
        });
      });
    });
  }

}
