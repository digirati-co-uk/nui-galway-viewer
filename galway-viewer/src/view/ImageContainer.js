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

  render(id, createImage) {
    if (!this.imageCache[id]) {
      this.imageCache[id] = createImage();
    }

    this.clearContents();
    this.$el.appendChild(this.imageCache[id]);

    return this.imageCache[id];
  }

  clearContents() {
    while (this.$el.firstChild) {
      this.$el.removeChild(this.$el.firstChild);
    }
  }
}
