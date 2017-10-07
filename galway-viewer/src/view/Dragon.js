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

export default class Dragon {

  constructor(canvas) {
    this.state = {isOpen: true, isLoaded: false, isLoading: false, isClosed: true};
    this.canvasContent = canvas;
    this.$container = document.createElement('div');
    this.$container.classList.add('dragon');
    document.querySelector('.zoom__in').addEventListener('click', () => {
      this.activeOsd.then(osd => osd.viewport.zoomBy(1.2));
    });
    document.querySelector('.zoom__out').addEventListener('click', () => {
      this.activeOsd.then(osd => osd.viewport.zoomBy(0.8));
    });
  }

  close($target) {
    setTimeout(() => {
      if ($target.contains(this.$container)) {
        $target.removeChild(this.$container);
        this.changeState(state => ({
          isOpen: false,
        }), $target);
      }
    }, 0);
  }

  open($target) {
    this.activeOsd = new Promise(resolve => {
      this.resolveOsd = resolve;
    });
    this.changeState(state => ({
      isOpen: true,
    }), $target);
  }

  getManifest(url) {
    if (this._manifestCache[url]) {
      return this._manifestCache;
    }
    return this._manifestCache = fetch(url).then(m => m.json());
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

  findCanvas() {
    return Promise.resolve(this.canvasContent);
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

  reset() {
    return this.activeOsd.then(osd => {
      osd.clearOverlays();
      osd.overlaysContainer.innerHTML = '';
    });
  }

  changeState(func, $target) {
    this.state = {...this.state, ...func(this.state),};
    requestAnimationFrame(() => this.render($target));
  }

  addOverlay(element, {x, y, width, height}) {
    this.activeOsd.then(osd => {
      osd.addOverlay({
        element,
        location: this.osd.viewport.imageToViewportRectangle(
          new OpenSeadragon.Rect(x, y, width, height),
        ),
      });
    });
  }

  render($target) {
    const {isOpen, isLoading, isLoaded, isClosed} = this.state;

    if (isOpen && !isLoading && !isLoaded) {
      this.$container.classList.add('dragon--open');
      this.findCanvas().then((canvas) => {
        return this.resolveRealTileSource(
          canvas.images.map(image => this.getService(image.resource.service)).filter(e => e).pop(),
        ).then((tileSource) => {
          this.osd = OpenSeadragon({
            element: this.$container,
            tileSources: [tileSource],
            ajaxWithCredentials: false,
            showNavigator: true,
            showRotationControl: true,
            defaultZoomLevel: 0,
            maxZoomPixelRatio: 1,
            navigatorPosition: 'BOTTOM_RIGHT',
            animationTime: 0.6,
            immediateRender: false,
            preserveViewport: true,
            blendTime: 0.1,
            minPixelRatio: 1,
            visibilityRatio: 0.65,
            constrainDuringPan: false,
            showSequenceControl: false,
            showNavigationControl: false,
            showZoomControl: false,
            showHomeControl: false,
            showFullPageControl: false,
            sequenceMode: true,
          });
          this.changeState(() => ({
            isLoading: false,
            isLoaded: true,
          }), $target);
        });
      });
      // Open open sea dragon
      this.changeState(() => ({
        isLoading: true,
        isClosed: false,
      }), $target);
    }

    if (isOpen && isLoading) {
      // Show loading screen
    }

    if (isOpen && isLoaded) {
      if (this.osd) {
        this.resolveOsd(this.osd);
        this.osd.viewport.goHome(true);
      }
      $target.appendChild(this.$container);
    }

  }


}
