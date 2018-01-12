import DeepRange from './DeepRange';
import {div, EventBus, renderTemporal} from '../utils';
import TimelineTitle from "./TimelineTitle";

export default class Timeline {
  constructor($el, model) {
    // .galway-timeline
    this.$el = $el;

    // Deep range slider.
    this.deepRange = new DeepRange(
      $el.querySelector('.galway-timeline__item-container'),
      model
    );

    this.title = new TimelineTitle(
      $el.querySelector('.galway-timeline__title'),
      $el.querySelector('.galway-timeline__breadcrumbs')
    );
  }

  onBack(func) {
    return this.title.onBack(func);
  }

  onClickRange(func) {
    return this.deepRange.onClickRange(func);
  }

  onClickBreadcrumb(func) {
    return this.title.setBreadcrumbClickHandler(func);
  }

  render(canvasIndex, model) {
    this.deepRange.render(canvasIndex, model);

    if (model.activeItem) {
      this.title.render(model.breadcrumbs);
    }
  }
}
