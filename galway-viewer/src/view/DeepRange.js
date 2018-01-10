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

  constructor($el) {
    this.$el = $el;
    this.structure = [
      {
        "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r1",
        "label": "Midwinter Exposition & Civil Engineering",
        "temporal": [
          1893,
          1899
        ],
        "range": [
          84,
          98
        ],
        "children": [
          {
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r2",
            "label": "Chief Engineer Midwinter Exposition",
            "temporal": [
              1893
            ],
            "range": [
              84,
              89
            ]
          },
          {
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r3",
            "label": "Chief Engineer Shasta County",
            "temporal": [
              1894
            ],
            "range": [
              90,
              95
            ]
          },
          {
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r4",
            "label": "Spring Valley Water Works",
            "temporal": [
              1897,
              1898
            ],
            "range": [
              96,
              98
            ]
          }
        ]
      },
      {
        "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r5",
        "label": "Hawaii",
        "temporal": [
          1899,
          1906
        ],
        "range": [
          99,
          151
        ],
        "children": [
          {
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r6",
            "label": "First Hawaiian Surveys",
            "temporal": [
              1899
            ],
            "range": [
              99,
              107
            ]
          },
          {
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r7",
            "label": "Return to San Francisco",
            "temporal": [
              1899
            ],
            "range": [
              108,
              110
            ]
          },
          {
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r8",
            "label": "Second Visit to Hawaii, irrigation",
            "temporal": [
              1899
            ],
            "range": [
              111,
              113
            ]
          },
          {
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r9",
            "label": "Closing San Francisco Office",
            "temporal": [
              1899
            ],
            "range": 114
          },
          {
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r10",
            "label": "Third Visit to Hawaii, sugar stock collapse",
            "temporal": [
              1900
            ],
            "range": [
              115,
              118
            ]
          },
          {
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r11",
            "label": "Fourth Visit to Hawaii, hydraulic power",
            "temporal": [
              1901
            ],
            "range": [
              119,
              123
            ]
          },
          {
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r12",
            "label": "Mill Valley Politics",
            "temporal": [
              1901
            ],
            "range": [
              124,
              126
            ]
          },
          {
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r13",
            "label": "Olokele Aqueduct",
            "temporal": [
              1901
            ],
            "range": [
              127,
              130
            ]
          },
          {
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r14",
            "label": "Koolau Viaduct",
            "temporal": [
              1903
            ],
            "range": [
              131,
              142
            ]
          },
          {
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r15",
            "label": "Kohala Aqueduct",
            "temporal": [
              1904
            ],
            "range": [
              143,
              146
            ]
          },
          {
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r16",
            "label": "Shipwreck Alameda",
            "temporal": [
              1905
            ],
            "range": [
              147,
              151
            ]
          }
        ]
      },
      {
        "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r17",
        "label": "San Francisco Earthquake (p. 149-159)",
        "temporal": [
          1906
        ],
        "range": [
          152,
          162
        ],
        "children": [
          {
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r18",
            "label": "News of Earthquake",
            "temporal": [
              1906
            ],
            "range": [
              152,
              154
            ]
          },
          {
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r19",
            "label": "Return to San Francisco",
            "temporal": [
              1906
            ],
            "range": [
              155,
              159
            ]
          },
          {
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r20",
            "label": "Finishing Kohala Aqueduct",
            "temporal": [
              1906
            ],
            "range": [
              160,
              162
            ]
          }
        ]
      },
      {
        "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r21",
        "label": "San Diego & the Morena Dam",
        "temporal": [
          1907,
          1912
        ],
        "range": [
          163,
          178
        ],
        "children": [
          {
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r22",
            "label": "First San Diego Visit",
            "temporal": [
              1907
            ],
            "range": [
              163,
              166
            ]
          },
          {
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r23",
            "label": "The Morena Dam",
            "temporal": [
              1907
            ],
            "range": [
              167,
              169
            ]
          },
          {
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r24",
            "label": "Personal contacts in San Diego",
            "temporal": [
              1907
            ],
            "range": [
              170,
              174
            ]
          },
          {
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r25",
            "label": "Sale San Diego System",
            "temporal": [
              1912
            ],
            "range": [
              175,
              178
            ]
          }
        ]
      }
    ];

  this.maxDepth = depthOf(this.structure);
    this.depthMap = mapDepths(this.structure, this.maxDepth);

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
      'green', 'blue', 'purple', 'orange', 'hotpink'
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
    this.$elements = this.flatItems.map(
      (item) => {
        console.log(item);
        // Only show top level, hide the rest.
        const visibility = this.topLevelKeys.indexOf(item.key) === -1 ? RANGE_DISPLAY_NONE : RANGE_DISPLAY_LARGE;
        return (
          div({className: DeepRange.CSS_ITEM, style: computeStyleFromItem(visibility, item)}, [
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
      if (item.children) {
        $element.classList.add(DeepRange.CSS_ITEM_CHILDREN);
      }
    } else if ($element.classList.contains(DeepRange.CSS_ITEM_ACTIVE)) {
      $element.classList.remove(DeepRange.CSS_ITEM_ACTIVE);
      $element.classList.remove(DeepRange.CSS_ITEM_CHILDREN);
    }
  }

  findCurrent() {
    return this.activeRange;
  }

  render(canvasIndex, depth) {
    this.currentDepth = depth;
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
