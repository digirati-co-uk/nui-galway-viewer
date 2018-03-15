import Void from "./Void";
import Dragon from "./Dragon";
import {img} from "../utils";
import SharedDragon from './SharedDragon';

export default class OpenSeadragonContainer {

  constructor($el) {
    this.$el = $el;
    this.$void = new Void(document.getElementById('void'));
    this.dragon = new SharedDragon();
    this.dragon.mountTo(this.$el);
  }

  mountTo($parent) {
    $parent.appendChild(this.$el);
  }

  goHome(immediate = false) {
    this.dragon.goHome(immediate);
  }

  reset() {
    return Promise.resolve(this.dragon.reset());
  }

  renderOsd(canvas) {
    this.dragon.render(canvas);
  }

  addOverlay(element, props, canvasId) {
    this.dragon.addOverlay(element, props, canvasId);
  }

  preloadImages({next, prev}) {
    this.$void.next.innerText = '';
    if (next) {
      this.$void.next.appendChild(next);
    }
    this.$void.previous.innerText = '';
    if (prev) {
      this.$void.previous.appendChild(prev);
    }
  }

  fullScreen() {
    this.dragon.fullScreen();
  }

  exitFullScreen() {
    this.dragon.exitFullScreen();
  }

  enable() {
    this.$el.classList.add('galway-player__osd--active');
  }

  disable() {
    this.$el.classList.remove('galway-player__osd--active');
  }

  zoomBy(by) {
    this.dragon.zoomBy(by);
  }
}
