import {DOM} from '../utils';

class Slider {

  constructor($el, size, onChange) {
    this.$sliderContainer = $el;


    this.$slider = DOM('input', {
      attributes: {
        type: 'range',
        max: size - 1,
        value: 0,
      }
    });
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
