import {div} from '../utils';

function isValidTileSource(tileSource) {
  return !!(
    tileSource &&
    tileSource['@context'] &&
    tileSource['@id'] &&
    tileSource.protocol === 'http://iiif.io/api/image' &&
    tileSource.width &&
    tileSource.height &&
    tileSource.profile
  );
}

function getCanonicalImage(image) {
  if (image.substr(-9, 9) === 'info.json') {
    return image;
  }
  if (image.substr(-1, 1) === '/') {
    return `${image}info.json`;
  }
  return `${image}/info.json`;
}

export default class SharedDragon {

  constructor() {
    this.state = {isOpen: true, isLoaded: false, isLoading: false, isClosed: true, currentCanvas: null};
    this.$container = div({className: 'dragon'});
    this.overlays = {};
    this.osd = OpenSeadragon({
      element: this.$container,
      ajaxWithCredentials: false,
      showNavigator: true,
      showRotationControl: true,
      defaultZoomLevel: 0,
      navigatorPosition: 'BOTTOM_RIGHT',
      animationTime: 0.6,
      minZoomImageRatio: 1,
      immediateRender: true,
      preserveViewport: true,
      constrainDuringPan: false,
      showSequenceControl: false,
      showNavigationControl: false,
      showZoomControl: false,
      showHomeControl: false,
      showFullPageControl: false,
      sequenceMode: true,
    });
  }

  resolveRealTileSource(image) {
    if (isValidTileSource(image)) {
      return Promise.resolve(image);
    }

    if (image['@id']) {
      return fetch(getCanonicalImage(image['@id'])).then(r => r.json()).then(tileSource => isValidTileSource(tileSource) ? tileSource : null);
    }

    return Promise.resolve(null);
  }

  getService(service) {
    if (!service) {
      return null;
    }

    if (Object.prototype.toString.call(service) === '[object Array]') {
      return this.getService(service.filter(e => e['@context'] === 'http://iiif.io/api/image/2/context.json').pop());
    }

    if (service['@context'] === 'http://iiif.io/api/image/2/context.json') {
      return service;
    }

    return null;
  }

  zoomBy(num) {
    this.osd.viewport.zoomBy(num);
  }

  mountTo($parent) {
    $parent.appendChild(this.$container);
  }

  asyncAddTile(args) {
    return new Promise((success, err) => {
      if (!this.osd) {
        return null;
      }

      try {
        this.osd.addTiledImage.call(this.osd, {success, ...args});
      } catch (e) {
        err(e);
      }
    });
  }

  addOverlay(element, position, canvasId) {
    if (canvasId === this.state.currentCanvas) {
      this.overlays[canvasId] = this.overlays[canvasId] ? this.overlays[canvasId] : [];
      this.overlays[canvasId].push(
        {element, position}
      );
    }
  }

  flushOverlays(canvasId) {
    this.reset();
    if (!this.overlays[canvasId]) {
      return;
    }
    this.overlays[canvasId].forEach(({ element, position: {x, y, width, height} }) => {
      this.osd.addOverlay({
        element,
        location: this.osd.viewport.imageToViewportRectangle(
          new OpenSeadragon.Rect(x, y, width, height),
        ),
      });
    });
    this.overlays[canvasId] = [];
  }

  goHome(immediate = false) {
    this.osd.viewport.goHome(immediate);
  }

  reset() {
    this.osd.clearOverlays();
    this.osd.overlaysContainer.innerHTML = '';
  }

  fullScreen() {
    return this.osd.setFullScreen(true);
  }

  exitFullScreen() {
    return this.osd.setFullScreen(false);
  }

  render(canvas) {
    if (canvas.id !== this.state.currentCanvas) {
      this.osd.close();
      // Render new tile source.
      this.resolveRealTileSource(
        canvas.images.map(image => this.getService(image.resource.service)).filter(e => e).pop(),
      ).then(tileSource => {
        return this.asyncAddTile({tileSource});
      }).then(() => {
        this.flushOverlays(canvas.id);
        this.goHome();
      });
    }
    this.state.currentCanvas = canvas.id;
  }

}
