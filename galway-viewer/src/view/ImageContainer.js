export default class ImageContainer {

  constructor($el) {
    this.$el = $el;
    this.imageCache = {};
  }

  onActivate(fn) {
    this.$el.addEventListener('click', fn);
    this.$el.addEventListener('touchstart', (e) => {
      e.preventDefault();
      fn(e)
    });
    this.$el.addEventListener('wheel', fn);
  }

  disable() {
    this.$el.classList.add('galway-player__image--disabled');
  }

  enable() {
    this.$el.classList.remove('galway-player__image--disabled');
  }

  mountTo($parent) {
    $parent.appendChild(this.$el);
  }

  getCachedImage(id, createImage) {
    if (!this.imageCache[id]) {
      this.imageCache[id] = createImage();
    }

    return this.imageCache[id];
  }

  render(id, createImage) {
    const $image = this.getCachedImage(id, createImage);

    this.clearContents();
    this.$el.appendChild($image);

    return $image;
  }

  clearContents() {
    while (this.$el.firstChild) {
      this.$el.removeChild(this.$el.firstChild);
    }
  }
}
