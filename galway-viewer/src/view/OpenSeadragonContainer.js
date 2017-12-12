import Void from "./Void";
import Dragon from "./Dragon";
import {img} from "../utils";

export default class OpenSeadragonContainer {

  constructor($el) {
    this.$el = $el;
    this.openSeaDragonCache = {};
    this.$void = new Void(document.getElementById('void'));
    this.currentOsd = null;
    this.isRendering = false;
  }

  mountTo($parent) {
    $parent.appendChild(this.$el);
  }

  loadOsd(canvas, $target = null) {
    this.openSeaDragonCache[canvas.id] = this.openSeaDragonCache[canvas.id] ?
      this.openSeaDragonCache[canvas.id] :
      new Dragon(canvas);

    if ($target) {
      this.openSeaDragonCache[canvas.id].open($target);
    }
  }

  goHome(immediate = false) {
    return this.futureOsd.then(osd => osd.goHome(immediate));
  }

  reset() {
    return this.futureOsd.then(osd => osd.reset());
  }

  renderOsd(id) {
    let resolve;
    const promise = new Promise((res) => resolve = res);
    if (this.renderCycle) {
      clearTimeout(this.renderCycle);
    }
    this.renderCycle = setTimeout(() => {
      console.log('Rendering OSD - HEAVY OP', id);
      const toRender = this.openSeaDragonCache[id];
      if (!toRender) {
        return;
      }
      if (this.currentOsd) {
        this.currentOsd.close(this.$el);
      }
      this.currentOsd = toRender;
      if (this.$void.osdNext.contains(toRender.$container)) {
        this.$void.osdNext.removeChild(toRender.$container);
      }
      if (this.$void.osdPrevious.contains(toRender.$container)) {
        this.$void.osdPrevious.removeChild(toRender.$container);
      }
      toRender.open(this.$el);
      resolve(this.currentOsd);
    }, 100);

    this.futureOsd = promise;
    return promise;
  }

  addOverlay(element, props, canvasId) {
    return this.futureOsd.then(osd => {
      if (this.currentOsd === this.openSeaDragonCache[canvasId]) {
        osd.addOverlay(element, props)
      }
    });
  }

  preloadImages({next, prev, forceHttps}) {
    this.$void.next.innerText = '';
    if (next) {
      this.$void.next.appendChild(img(next, {forceHttps}));
    }
    this.$void.previous.innerText = '';
    if (prev) {
      this.$void.previous.appendChild(img(prev, {forceHttps}));
    }
  }

  fullScreen() {
    if (this.currentOsd) {
      this.currentOsd.fullScreen();
    }
  }

  exitFullScreen() {
    if (this.currentOsd) {
      this.currentOsd.exitFullScreen();
    }
  }

  enable() {
    this.$el.classList.add('galway-player__osd--active');
  }

  disable() {
    this.$el.classList.remove('galway-player__osd--active');
  }

  zoomBy(by) {
    if (this.currentOsd) {
      this.currentOsd.zoomBy(by);
    }
  }

  preLoadPrevious(previousCanvas) {
    this.$void.osdPrevious.innerHTML = '';
    this.loadOsd(previousCanvas, this.$void.osdPrevious);
  }

  preLoadNext(nextCanvas) {
    this.$void.osdNext.innerHTML = '';
    this.loadOsd(nextCanvas, this.$void.osdNext);
  }
}
