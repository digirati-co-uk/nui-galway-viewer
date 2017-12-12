export default class OsdControls {
  constructor($el) {
    this.$el = $el;
    this.$zoomIn = $el.querySelector('.galway-player__control--zoom-in');
    this.$zoomOut = $el.querySelector('.galway-player__control--zoom-out');
    this.$fullscreem = $el.querySelector('.galway-player__control--fullscreen');
  }

  enable() {
    this.$el.classList.add('galway-player__controls--active');
  }

  disable() {
    this.$el.classList.remove('galway-player__controls--active');
  }

  onZoomIn(fn) {
    this.$zoomIn.addEventListener('click', fn);
  }

  onZoomOut(fn) {
    this.$zoomOut.addEventListener('click', fn);
  }

  onFullscreen(fn) {
    this.$fullscreem.addEventListener('click', fn);
  }
}
