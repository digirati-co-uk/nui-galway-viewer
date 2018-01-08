import {
  assignNumber,
  computeStyleFromItem,
  CurrentLevel,
  depthOf,
  div,
  findLevel,
  flattenAll,
  mapDepths,
  matchesRange,
  RANGE_DISPLAY_LARGE,
  RANGE_DISPLAY_NONE,
  RANGE_DISPLAY_PREV_NEXT,
  setStyle,
  sortByKey
} from '../utils';

export default class DeepRange {

  static CSS_ITEM = 'galway-timeline__item';
  static CSS_ITEM_ACTIVE = 'galway-timeline__item--active';
  static CSS_ITEM_REPRESENTATION = 'galway-timeline__representation';
  static CSS_TEMPORAL = 'galway-timeline__temporal';
  static CSS_ITEM_CONTAINER = '.galway-timeline__item-container';

  constructor() {
    this.structure = [
      {
        id: 'testing-1',
        label: 'testing-1',
        range: [0, 10],
        children: [
          {
            id: 'testing-1-1',
            label: 'testing-1-1',
            range: [0, 5],
            children: [
              {
                id: 'testing-1-2-1',
                label: 'testing-1-2-1',
                range: [0, 1],
              },
              {
                id: 'testing-1-1',
                label: 'testing-1-1',
                range: [1, 5],
              }
            ]
          },
          {
            id: 'testing-1-2',
            label: 'testing-1-2',
            range: [6, 10],
          },
        ]
      },
      {
        id: 'testing-2',
        label: 'testing-2',
        range: [11, 30],
      },
      {
        id: 'testing-3',
        label: 'testing-3',
        range: [31, 40],
        children: [
          {
            id: 'testing-3-1',
            label: 'testing-3-1',
            range: [31, 35]
          },
          {
            id: 'testing-3-2',
            label: 'testing-3-2',
            range: [36, 40]
          },
        ]
      },
      {
        id: 'testing-4',
        label: 'testing-4',
        range: [41, 50],
        children: [
          {
            id: 'testing-4-1',
            label: 'testing-4-1',
            range: [41, 45]
          },
          {
            id: 'testing-4-2',
            label: 'testing-4-2',
            range: [46, 50]
          },
        ]
      },
    ];

    const maxDepth = depthOf(this.structure);
    this.depthMap = mapDepths(this.structure, maxDepth);

    this.structure.forEach(assignNumber({num: 0}));
    this.topLevelKeys = this.levelKeys(0);
    this.flatItems = flattenAll(this.structure).sort(sortByKey);

    // Initial DOM elements
    this.renderInitial();
  }

  onClickRange(func) {
    this.$elements.forEach(
      $el => {
        const key = this.$elements.indexOf($el);
        const item = this.flatItems[key];
        $el.addEventListener('click', e => {
          return func(item, key, $el, e);
        })
      }
    );
  }

  renderInitial() {
    this.$elements = this.flatItems.map(
      (item) => {
        // Only show top level, hide the rest.
        const visibility = this.topLevelKeys.indexOf(item.key) === -1 ? RANGE_DISPLAY_NONE : RANGE_DISPLAY_LARGE;
        return (
          div({className: DeepRange.CSS_ITEM, style: computeStyleFromItem(visibility, item)}, [
            div({className: DeepRange.CSS_ITEM_REPRESENTATION}),
            div({className: DeepRange.CSS_TEMPORAL}, [item.label]),
          ])
        );
      }
    );

    const $el = document.querySelector(DeepRange.CSS_ITEM_CONTAINER);
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

      DeepRange.renderActive($element, item, canvasIndex);

      if (currentLevel !== -1) {
        setStyle($element, computeStyleFromItem(RANGE_DISPLAY_LARGE, item));
        return;
      }

      setStyle($element, computeStyleFromItem(RANGE_DISPLAY_NONE, item));
    });
  }

  static renderActive($element, item, canvasIndex) {
    if (matchesRange(item, canvasIndex)) {
      $element.classList.add(DeepRange.CSS_ITEM_ACTIVE);
    } else if ($element.classList.contains(DeepRange.CSS_ITEM_ACTIVE)) {
      $element.classList.remove(DeepRange.CSS_ITEM_ACTIVE);
    }
  }

  render(canvasIndex, depth) {
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
      DeepRange.renderActive($element, item, canvasIndex);

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
