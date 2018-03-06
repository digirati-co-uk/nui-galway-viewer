import {div, renderTemporal} from "../utils";

export default class TimelineTitle {

  constructor($el, $breadcrumbs) {
    this.$el = $el;
    this.h1 = $el.querySelector('h1');
    this.span = $el.querySelector('span');
    this.breadcrumbs = $breadcrumbs;
    this.back = $breadcrumbs.querySelector('.galway-timeline__breadcrumb-back');
    this.breadcrumbContainer = $breadcrumbs.querySelector('.galway-timeline__breadcrumb-container');
    this.subTitle = document.querySelector('.galway-timeline__sub-title');
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
      div({
        className: 'material-icons',
      }, ['navigate_before']),
      item.label,
    ]);
  }

  setBreadcrumbClickHandler(onClick) {
    this.breadCrumbClickHandler = onClick;
  }

  render(breadcrumb) {
    // Render h1
    this.h1.innerText = breadcrumb.item.label;
    // Render span (hidden by css?)
    this.span.innerText = renderTemporal(breadcrumb.item);

    // Render breadcrumbs.
    if (breadcrumb.path && breadcrumb.path.length !== 0) {
      this.breadcrumbContainer.innerHTML = '';
      breadcrumb.path.forEach(p => {
        const crumb = this.createBreadcrumb(p);
        this.breadcrumbContainer.appendChild(crumb);
      });
      this.breadcrumbs.classList.add('galway-timeline__breadcrumbs--active');
    } else {
      this.breadcrumbContainer.innerHTML = '';
      this.breadcrumbContainer.appendChild(
        div({
          className: 'galway-timeline__breadcrumb-static',
        }, 'Timeline')
      );
      this.breadcrumbs.classList.remove('galway-timeline__breadcrumbs--active');
    }
  }

}
