import {
  assignNumber,
  computeStyleFromItem,
  CurrentLevel,
  depthOf,
  div, EventBus,
  findLevel,
  flattenAll, generateColour, getPalletXPosition,
  mapDepths,
  matchesRange,
  RANGE_DISPLAY_LARGE,
  RANGE_DISPLAY_NONE,
  RANGE_DISPLAY_PREV_NEXT,
  renderTemporal,
  setStyle,
  sortByKey
} from '../utils';

export default class DeepRange {

  static CSS_ITEM = 'galway-timeline__item';
  static CSS_ITEM_ACTIVE = 'galway-timeline__item--active';
  static CSS_ITEM_REPRESENTATION = 'galway-timeline__representation';
  static CSS_TEMPORAL = 'galway-timeline__temporal';
  static CSS_ITEM_CHILDREN = 'galway-timeline__item--children';

  constructor($el, model) {
    this.$el = $el;
    this.model = model;
    this.bus = new EventBus('DeepRange');
    // Initial DOM elements
    this.renderInitial($el);
  }

  onClickRange(func) {
    this.$elements.forEach(
      $el => {
        const key = this.$elements.indexOf($el);
        const item = this.model.flatItems[key];
        $el.addEventListener('click', e => {
          return func(item, key, $el, e);
        });
      }
    );
  }

  renderInitial($el) {
    const $tooltip = document.querySelector('.galway-timeline__tooltip-float');
    $el.addEventListener('mouseenter', (e) => {
      $tooltip.classList.add('galway-timeline__tooltip-float--active');
    });
    $el.addEventListener('mouseleave', () => {
      $tooltip.classList.remove('galway-timeline__tooltip-float--active');
    });


    $el.addEventListener('mousemove', (e) => {
      const calc = getPalletXPosition($tooltip.getBoundingClientRect().width, e.clientX, window.innerWidth);

      $tooltip.style.left = `${calc}px`;
    });

    this.$elements = this.model.flatItems.map(
      (item) => {
        // Only show top level, hide the rest.
        const visibility = this.model.topKeys.indexOf(item.key) === -1 ? RANGE_DISPLAY_NONE : RANGE_DISPLAY_LARGE;
        return (
          div({
            className: DeepRange.CSS_ITEM,
            style: computeStyleFromItem(visibility, item),
            onMouseEnter: () => {
              $tooltip.innerText = item.label;
              this.hoveredItem = item;
              this.bus.dispatch('item:hover', item);
            },
            onMouseLeave: () => {
              this.bus.dispatch('item:blur', item);
              if (this.hoveredItem === item) {
                this.hoveredItem = null;
              }
            },
          }, [
            div({
              className: DeepRange.CSS_ITEM_REPRESENTATION, style: {
                background: generateColour(item.level)
              }
            }),
            div({className: DeepRange.CSS_TEMPORAL}, [
              renderTemporal(item)
            ]),
          ])
        );
      }
    );

    $el.innerHTML = '';
    this.$elements.forEach($element => {
      $el.appendChild($element);
    });
  }

  renderTopLevel(canvasIndex, model) {
    this.$elements.forEach(($element, key) => {
      const currentLevel = model.topKeys.indexOf(key);
      const item = model.structure[currentLevel];

      this.renderActive($element, item, canvasIndex);

      if (currentLevel !== -1) {
        setStyle($element, computeStyleFromItem(RANGE_DISPLAY_LARGE, item));
        return;
      }

      setStyle($element, computeStyleFromItem(RANGE_DISPLAY_NONE, item));
    });
  }

  renderActive($element, item, canvasIndex) {
    if (matchesRange(item, canvasIndex)) {
      $element.classList.add(DeepRange.CSS_ITEM_ACTIVE);
      this.bus.dispatch('item:active', item);
      if (item.children) {
        $element.classList.add(DeepRange.CSS_ITEM_CHILDREN);
      }
    } else if ($element.classList.contains(DeepRange.CSS_ITEM_ACTIVE)) {
      this.bus.dispatch('item:inactive', item);
      $element.classList.remove(DeepRange.CSS_ITEM_ACTIVE);
      $element.classList.remove(DeepRange.CSS_ITEM_CHILDREN);
    }
  }

  render(canvasIndex, model) {
    // If we are at the top level depth, we just render as normal.
    if (model.depth === 0) {
      return this.renderTopLevel(canvasIndex, model);
    }

    // Here we look for the current "view" which is the sub-sections expanded out.
    if (model.currentViews.length === 0) {
      // Default back to top level if we can't find a view.
      return this.renderTopLevel(canvasIndex, model);
    }

    this.$elements.forEach(($element, key) => {
      const item = model.current.findCurrent(key);
      // Render the current item with class.
      this.renderActive($element, item, canvasIndex);

      if (model.current.isNext(key) || model.current.isPrevious(key)) {
        setStyle($element, computeStyleFromItem(RANGE_DISPLAY_PREV_NEXT, item));
        return;
      }

      if (item) {
        setStyle($element, computeStyleFromItem(RANGE_DISPLAY_LARGE, item));
        return;
      }

      setStyle($element, computeStyleFromItem(RANGE_DISPLAY_NONE, item));
    });

  }
}
