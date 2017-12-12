export default class Header {

  constructor($el) {
    this.$el = $el;

    this.$menuButton = $el.querySelector('.galway-header__menu');
    this.$shareButton = $el.querySelector('.galway-header__share');
    this.$infoButton = $el.querySelector('.galway-header__info');
  }

  onClickMenu(fn) {
    return this.$menuButton.addEventListener('click', fn);
  }

  onClickShare(fn) {
    return this.$shareButton.addEventListener('click', fn);
  }

  onClickInfo(fn) {
    return this.$infoButton.addEventListener('click', fn);
  }

  render() {
    // Do not think there is anything to re-render.
  }

}
