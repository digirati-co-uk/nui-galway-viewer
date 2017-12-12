import Supplemental from './Supplemental';
import Link from './Link';
import {div, flatten, img, mapAnnotation, parseFrag} from '../utils';
import ImageOverlay from './ImageOverlay';
import ImageContainer from "./ImageContainer";
import OpenSeadragonContainer from "./OpenSeadragonContainer";
import OsdControls from "./OsdControls";

export default class Canvas {

  static IMAGE = 'galway-player__image';
  static OSD = 'galway-player__osd';

  constructor($el) {
    // Dom fetch
    this.$el = $el;

    // OSD Container
    this.osdContainer = new OpenSeadragonContainer(div({className: Canvas.OSD}));
    this.osdContainer.mountTo($el);

    // Image container
    this.imageContainer = new ImageContainer(div({className: Canvas.IMAGE}));
    this.imageContainer.onActivate(() => this.activateOSD());
    this.imageContainer.mountTo($el);

    this.$controls = new OsdControls($el.querySelector('.galway-player__controls'));
    this.$controls.onZoomIn(() => this.osdContainer.zoomBy(1.4));
    this.$controls.onZoomOut(() => this.osdContainer.zoomBy(0.7));
    this.$controls.onFullscreen(() => this.osdContainer.fullScreen());

    this.$annotationOverlay = null;

    // Sub components
    this.$supplimental = new Supplemental(document.querySelector('.supplemental'));
    // this.$link = new Link(document.getElementById('linkDump'));

    this.$image = null;

    this.maxHeight = this.getMaxHeight();

    window.addEventListener('resize', () => {
      this.maxHeight = this.getMaxHeight();
      if (this.$image && this.$annotationOverlay) {
        this.$annotationOverlay.render(this.$image);
      }
    });
  }

  activateOSD() {
    this.imageContainer.disable();
    this.osdContainer.enable();
    this.$controls.enable();
    this.osdContainer.zoomBy(1.2);
  }

  handleClick = canvasId => (href, e) => {
    this.$el.classList.add('galway-player--loading');
    e.preventDefault();
    e.stopPropagation();
    fetch(href, {cache: 'force-cache'})
      .then(r => r.json())
      // Artificial delay for testing loading indicator.
      // .then(r => {
      //   return new Promise(resolve => setTimeout(() => resolve(r), 1000))
      // })
      .then(
        manifest => {
          this.$el.classList.remove('galway-player--loading');
          this.$supplimental.render({manifest, canvasId});
        },
      )
      .catch((e) => {
        this.$el.classList.remove('galway-player--loading');
        this.$el.classList.add('galway-player--error');
        console.error(`The supplemental at ${href} was not able to be displayed.`, e);
        setTimeout(() => {
          this.$el.classList.remove('galway-player--error');
        }, 2000);
      });
  };

  getAnnotations(otherContent) {
    if (!otherContent) {
      return Promise.resolve(null);
    }
    return Promise.all(otherContent.map(
      content => fetch(content['@id'], {cache: 'force-cache'})
        .then(r => r.json())
        .catch(err => {
          console.warn(err);
          return [];
        })
        .then(({resources}) => {
          if (!resources) {
            return [];
          }
          return resources.map(
            annotation => mapAnnotation(annotation),
          );
        }),
    )).then(flatten);
  }

  getMaxHeight() {
    const ratio = window.devicePixelRatio || 1;
    const absoluteMax = 1600;
    const rect = this.$el.getBoundingClientRect();
    return Math.min(
      Math.max(rect.width, rect.height) * ratio
    , absoluteMax);
  }

  render({canvas, nextCanvas, prevCanvas, forceHttps}) {
    const max = this.maxHeight;
    const imageUrl = `${canvas.images[0].resource.service.id}/full/!${max},${max}/0/default.jpg`;
    const imageUrlNext = nextCanvas ? `${nextCanvas.images[0].resource.service.id}/full/!${max},${max}/0/default.jpg` : null;
    const imageUrlPrev = prevCanvas ? `${prevCanvas.images[0].resource.service.id}/full/!${max},${max}/0/default.jpg` : null;

    // Preload previous and next <img/> tags.
    this.osdContainer.preloadImages({
      next: imageUrlNext,
      prev: imageUrlPrev,
      forceHttps,
    });

    // Reset open seadragon to default hidden view.
    this.imageContainer.enable();
    this.osdContainer.disable();
    this.$controls.disable();

    // Add image
    this.$image = this.imageContainer.render(canvas.id, () => {
      const $image = img(imageUrl, { forceHttps });
      $image.setAttribute('data-width', canvas.width);
      $image.setAttribute('data-height', canvas.height);
      return $image;
    });

    // Empty previous links and supplemental
    this.$supplimental.renderEmpty();

    // Load current OSD, using cached preload if available.
    this.osdContainer.loadOsd(canvas);
    this.osdContainer.renderOsd(canvas.id);

    // Preload previous and next OSD viewers
    if (nextCanvas) {
      this.osdContainer.preLoadNext(nextCanvas);
    }
    if (prevCanvas) {
      this.osdContainer.preLoadPrevious(nextCanvas);
    }

    // Finally render the annotations, at this point we will have OSD.
    this.getAnnotations(canvas.otherContent).then(annotations => {
      if (!annotations) {
        return null;
      }

      // Annotation container.
      this.$annotationOverlay = new ImageOverlay(canvas.id);
      this.$annotationOverlay.mountTo(this.imageContainer.$el);

      this.$image.addEventListener('load', () => {
        this.$annotationOverlay.render(this.$image);
      });

      const currentAnnotationOverlay = this.$annotationOverlay;

      this.renderAnnotations(annotations, currentAnnotationOverlay, canvas.id);
    });
  }

  renderAnnotations(annotations, currentAnnotationOverlay, canvasId) {
    // Add annotations to container.
    const osdAnnotations = annotations.map(linkToManifest => {
      const $annotation = ImageOverlay.createStaticAnnotation(linkToManifest.label, linkToManifest.description);
      const $viewerAnnotation = ImageOverlay.createStaticAnnotation(linkToManifest.label, linkToManifest.description);
      const viewerPosition = parseFrag(linkToManifest.xywh);
      const handleAnnotationClick = e => {
        this.osdContainer.exitFullScreen();
        this.osdContainer.goHome();
        e.preventDefault();
        e.stopPropagation();
        this.handleClick(linkToManifest.canvasId)(linkToManifest.url, e);
      };

      // Static annotations
      $annotation.addEventListener('click', handleAnnotationClick);
      $annotation.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });

      currentAnnotationOverlay.addAnnotation($annotation, viewerPosition, canvasId);

      // OSD annotations
      $viewerAnnotation.addEventListener('touchstart', handleAnnotationClick);
      $viewerAnnotation.addEventListener('click', handleAnnotationClick);

      return [$viewerAnnotation, viewerPosition, canvasId]
    });

    this.osdContainer.reset().then(() => {
      osdAnnotations.map(([$viewerAnnotation, viewerPosition, canvasId]) => {
        this.osdContainer.addOverlay($viewerAnnotation, viewerPosition, canvasId);
      })
    });

    currentAnnotationOverlay.render(this.$image, canvasId);
  }

}
