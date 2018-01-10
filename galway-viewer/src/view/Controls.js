import {MDCSlider} from '@material/slider';

export default class Controls {

  constructor($el, { totalElements }) {
    this.$el = $el;

    this.$sliderElement = document.querySelector('.galway-controls__slider');
    this.$slider = new MDCSlider(this.$sliderElement);
    this.$slider.max = totalElements;
    this.$slider.listen('MDCSlider:change', () => this.$slider.layout());
    this.$slider.listen('MDCSlider:open', () => this.$slider.layout());

    this.$next = document.querySelector('.galway-controls__button--next');
    this.$previous = document.querySelector('.galway-controls__button--previous');
  }

  setValue(index) {
    this.$slider.value = index;
  }

  isSliderElement($el) {
    return $el === this.$sliderElement;
  }

  onNext(fn) {
    this.$next.addEventListener('click', fn);
  }

  onPrevious(fn) {
    this.$previous.addEventListener('click', fn);
  }

  onChangeSlider(fn) {
    this.$slider.listen('MDCSlider:change', () => fn(this.$slider.value, this.$slider));
  }
}
