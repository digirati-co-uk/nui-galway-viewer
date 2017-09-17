
class Slider {

  constructor($el, size, onChange) {
    this.$sliderContainer = $el;

    this.$slider = document.createElement('input');
    this.$slider.setAttribute('type', 'range');
    this.$slider.setAttribute('max', size);
    this.$slider.setAttribute('value', 0);
    this.$slider.addEventListener('change', onChange);
    // This optimisation does not work.
    // this.$slider.addEventListener('mousemove', onChange);
    this.$sliderContainer.appendChild(this.$slider);
  }

  render(value) {
    this.$slider.value = value;
  }

}

export default Slider;
