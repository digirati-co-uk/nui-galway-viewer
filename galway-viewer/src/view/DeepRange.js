import {
  assignNumber,
  computeStyleFromItem,
  CurrentLevel,
  depthOf,
  div, EventBus,
  findLevel,
  flattenAll,
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

  constructor($el, structure) {

    this.$el = $el;
    this.structure = structure;
    this.maxDepth = depthOf(this.structure);
    this.depthMap = mapDepths(this.structure, this.maxDepth);
    this.bus = new EventBus('DeepRange');

    this.structure.forEach(assignNumber({num: 0}));
    this.structure.forEach((topLevel, key) => {
      function assignLevel(obj) {
        obj.level = key;
        if (obj.children) {
          obj.children.forEach(assignLevel);
        }
      }

      assignLevel(topLevel);
    });


    this.topLevelKeys = this.levelKeys(0);
    this.flatItems = flattenAll(this.structure).sort(sortByKey);

    // Initial DOM elements
    this.renderInitial($el);
  }


  generateColour(key) {
    const staticColoursThatWillBeChangedToSeed = [
      '#A84796',
      '#EC047D',
      '#D71D1B',
      '#DC876C',
      '#CA8A4D',
      '#EDB26C',
      '#FCC31D',
      '#F38413',
      '#A64D3A',
      '#CA8B7B'
    ];
    return staticColoursThatWillBeChangedToSeed[key % staticColoursThatWillBeChangedToSeed.length];
  }

  getBreadCrumbs(key) {
    const reducer = (path) => (found, item) => {
      if (found) {
        return found;
      }
      if (item.key === key) {
        return {item, path};
      }
      if (item.children) {
        const childPath = [...path, item];
        return item.children.reduce(reducer(childPath), false);
      }
      return found;
    };

    return this.structure.reduce(reducer([]), false);
  }

  onClickRange(func) {
    this.$elements.forEach(
      $el => {
        const key = this.$elements.indexOf($el);
        const item = this.flatItems[key];
        $el.addEventListener('click', e => {
          return func(item, key, $el, e);
        });
      }
    );
  }

  inRange(range) {
    return this.maxDepth >= range;
  }

  renderInitial($el) {
    const $tooltip = document.querySelector('.galway-timeline__tooltip-float');
    $el.addEventListener('mouseenter', (e) => {
      $tooltip.classList.add('galway-timeline__tooltip-float--active');
    });
    $el.addEventListener('mouseleave', () => {
      $tooltip.classList.remove('galway-timeline__tooltip-float--active');
    });

    function getX(palletW, clientX, windowW, offset = 15) {
      const halfPalletW = palletW / 2;
      if (clientX - halfPalletW - offset <= 0) {
        return offset;
      }
      if (clientX + halfPalletW + offset >= windowW) {
        return windowW - palletW - offset;
      }
      return clientX - halfPalletW;
    }

    $el.addEventListener('mousemove', (e) => {
      const calc = getX($tooltip.getBoundingClientRect().width, e.clientX, window.innerWidth);

      $tooltip.style.left = `${calc}px`;
    });

    this.$elements = this.flatItems.map(
      (item) => {
        // Only show top level, hide the rest.
        const visibility = this.topLevelKeys.indexOf(item.key) === -1 ? RANGE_DISPLAY_NONE : RANGE_DISPLAY_LARGE;
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
                background: this.generateColour(item.level)
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

  levelKeys = (level) => this.depthMap[level].items.map(item => item.key);

  renderTopLevel(canvasIndex) {
    this.$elements.forEach(($element, key) => {
      const currentLevel = this.topLevelKeys.indexOf(key);
      const item = this.structure[currentLevel];

      this.renderActive($element, item, canvasIndex);

      if (currentLevel !== -1) {
        setStyle($element, computeStyleFromItem(RANGE_DISPLAY_LARGE, item));
        return;
      }

      setStyle($element, computeStyleFromItem(RANGE_DISPLAY_NONE, item));
    });
  }

  isCurrent(item, canvasIndex) {
    return matchesRange(item, canvasIndex);
  }

  renderActive($element, item, canvasIndex) {
    if (matchesRange(item, canvasIndex)) {
      this.activeRange = {$el: $element, item};
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

  findCurrent() {
    return this.activeRange;
  }

  findCurrentTop() {
    return this.activeTopRange;
  }

  onChangeTopLevel(func) {
    this.onChangeTopLevelFunc = func;
    return this;
  }

  render(canvasIndex, depth) {
    this.currentDepth = depth;
    const activeTopRange = this.structure.filter(range => {
      return matchesRange(range, canvasIndex);
    }).pop();
    if (this.activeTopRange !== activeTopRange) {
      if (this.activeTopRange) {
        this.bus.dispatch('topRange:inactive', this.activeTopRange);
      }
      this.activeTopRange = activeTopRange;
      this.bus.dispatch('topRange:active', activeTopRange);
    }

    // If we are at the top level depth, we just render as normal.
    if (depth === 0) {
      return this.renderTopLevel(canvasIndex);
    }

    // Here we look for the current "view" which is the sub-sections expanded out.
    const currentLevelViews = findLevel(this.structure, canvasIndex, depth);
    if (currentLevelViews.length === 0) {
      // Default back to top level if we can't find a view.
      return this.renderTopLevel(canvasIndex);
    }

    // Array of keys for the current level.
    const fullLevelKeys = this.levelKeys(depth);
    const currentLevel = new CurrentLevel(currentLevelViews, fullLevelKeys);

    this.$elements.forEach(($element, key) => {
      const item = currentLevel.findCurrent(key);
      // Render the current item with class.
      this.renderActive($element, item, canvasIndex);

      if (currentLevel.isNext(key) || currentLevel.isPrevious(key)) {
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
