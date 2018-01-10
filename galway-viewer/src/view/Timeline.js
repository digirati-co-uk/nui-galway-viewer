import DeepRange from './DeepRange';
import {div, renderTemporal} from '../utils';

export default class Timeline {
  constructor($el, initialDepth = 0) {
    // .galway-timeline
    this.$el = $el;

    // Deep range slider.
    this.deepRange = new DeepRange($el.querySelector('.galway-timeline__item-container'));

    this.title = new TimelineTitle(
      $el.querySelector('.galway-timeline__title'),
      $el.querySelector('.galway-timeline__breadcrumbs')
    );

    this.title.onBack(() => {
      if (this.deepRange.inRange(this.depth - 1)) {
        this.depth -= 1;
        this.render(this.currentCanvasIndex);
      }
    });

    // Initial dept to show.
    this.depth = initialDepth;
  }

  onClickRange(func) {
    return this.deepRange.onClickRange((item, key, $el, e) => {
      if (
        // this.deepRange.isCurrent(item, this.currentCanvasIndex) &&
        this.deepRange.inRange(this.depth + 1)
      ) {
        this.depth += 1;
      }
      func(item, key, $el, e);
    });
  }

  onClickBreadcrumb(func) {
    return this.title.setBreadcrumbClickHandler((item, e) => {
      if (
        this.deepRange.inRange(this.depth - 1)
      ) {
        this.depth -= 1;
      }
      func(item, e);
    });
  }

  render(canvasIndex) {
    this.currentCanvasIndex = canvasIndex;
    this.deepRange.render(canvasIndex, this.depth);
    const currentRange = this.deepRange.findCurrent();
    if (currentRange) {
      const breadCrumbs = this.deepRange.getBreadCrumbs(currentRange.item.key);
      this.title.render(breadCrumbs);
    }
  }
}

class TimelineTitle {

  constructor($el, $breadcrumbs) {
    this.$el = $el;
    this.h1 = $el.querySelector('h1');
    this.span = $el.querySelector('span');
    this.breadcrumbs = $breadcrumbs;
    this.back = $breadcrumbs.querySelector('.galway-timeline__breadcrumb-back');
    this.breadcrumbContainer = $breadcrumbs.querySelector('.galway-timeline__breadcrumb-container');
  }

  onBack(func) {
    if (this.back) {
      return this.back.addEventListener('click', func);
    }
  }

  createBreadcrumb(item) {
    return div({
      className: 'galway-timeline__breadcrumb-item',
      onClick: (e) => this.breadCrumbClickHandler ? this.breadCrumbClickHandler(item, e) : null
    }, [
      item.label,
    ]);
  }

  setBreadcrumbClickHandler(onClick) {
    this.breadCrumbClickHandler = onClick;
  }

  render(breadcrumb) {
    this.h1.innerText = breadcrumb.item.label;
    this.span.innerText = renderTemporal(breadcrumb.item);
    this.breadcrumbContainer.innerHTML = '';
    if (breadcrumb.path && breadcrumb.path.length !== 0) {
      breadcrumb.path.forEach(p => {
        const crumb = this.createBreadcrumb(p);
        this.breadcrumbContainer.appendChild(crumb);
      });
      this.breadcrumbs.classList.add('galway-timeline__breadcrumbs--active');
    } else {
      this.breadcrumbs.classList.remove('galway-timeline__breadcrumbs--active');
    }
  }

}
