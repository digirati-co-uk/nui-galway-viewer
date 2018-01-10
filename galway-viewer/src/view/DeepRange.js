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
        "label": "Childhood and Schooling",
        "temporal": [
          1864,
          1881
        ],
        "range": [
          2,
          37
        ],
        "children": [
          {
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r2",
            "label": "Living with maternal grandparents",
            "temporal": [
              1866
            ],
            "range": [
              2,
              4
            ]
          },
          {
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r3",
            "label": "Pallaskenry girls' National School",
            "temporal": [
              1868
            ],
            "range": [
              5,
              6
            ]
          },
          {
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r4",
            "label": "Pallaskenry boys' National School",
            "temporal": [
              1870
            ],
            "range": [
              6,
              7
            ]
          },
          {
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r5",
            "label": "Childhood mischief",
            "temporal": [
              187
            ],
            "range": [
              7,
              16
            ]
          },
          {
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r6",
            "label": "Marriage of Aunt Alice",
            "temporal": [
              1872
            ],
            "range": [
              17,
              18
            ]
          },
          {
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r7",
            "label": "Marriage of Uncle Maurice",
            "temporal": [
              1873
            ],
            "range": [
              22,
              24
            ]
          },
          {
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r8",
            "label": "Moriarty's wake",
            "temporal": [
              1873
            ],
            "range": [
              27,
              28
            ]
          },
          {
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r9",
            "label": "Escape to Kilkerin",
            "temporal": [
              1873
            ],
            "range": [
              30,
              32
            ]
          },
          {
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r10",
            "label": "School in Flean, near Loughill",
            "temporal": [
              1874
            ],
            "range": 32
          },
          {
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r11",
            "label": "School in Mount Trenchard",
            "temporal": [
              1875,
              1880
            ],
            "range": [
              33,
              34
            ]
          },
          {
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r12",
            "label": "School in Rockwell College",
            "temporal": [
              1881
            ],
            "range": [
              34,
              37
            ]
          }
        ]
      },
      {
        "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r13",
        "label": "University",
        "temporal": [
          1881,
          1884
        ],
        "range": [
          35,
          45
        ],
        "children": [
          {
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r14",
            "label": "Scholarship to Queen's College Cork",
            "temporal": [
              1881
            ],
            "range": [
              38,
              41
            ]
          },
          {
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r15",
            "label": "Move to Queen's College Galway",
            "temporal": [
              1882
            ],
            "range": [
              42,
              44
            ]
          }
        ]
      },
      {
        "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r16",
        "label": "San Francisco and Early Work",
        "temporal": [
          1885,
          1888
        ],
        "range": [
          46,
          67
        ],
        "children": [
          {
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r17",
            "label": "Emigration",
            "temporal": [
              1885
            ],
            "range": [
              46,
              49
            ]
          },
          {
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r18",
            "label": "Arrival in San Francisco",
            "temporal": [
              1885
            ],
            "range": [
              49,
              51
            ]
          },
          {
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r19",
            "label": "First Engineering Work, Sierra Valley & Mohawk Railroad Co.",
            "temporal": [
              1886
            ],
            "range": [
              52,
              54
            ]
          },
          {
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r20",
            "label": "Second Engineering Job, Southern Pacific Co.",
            "temporal": [
              1886,
              1888
            ],
            "range": [
              55,
              64
            ]
          },
          {
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r21",
            "label": "San Pedro Soundings and Townsites",
            "temporal": [
              1888
            ],
            "range": [
              65,
              68
            ]
          }
        ]
      },
      {
        "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r22",
        "label": "Rail, Mining & Civil Engineering Work",
        "temporal": [
          1888,
          1893
        ],
        "range": [
          68,
          83
        ],
        "children": [
          {
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r23",
            "label": "Eureka Ranch & Santa Ysabel",
            "temporal": [
              1888
            ],
            "range": [
              68,
              70
            ]
          },
          {
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r24",
            "label": "Mill Valley",
            "temporal": [
              1888,
              1890
            ],
            "range": [
              71,
              78
            ]
          },
          {
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r25",
            "label": "Ingleside race-track",
            "temporal": [
              1890,
              1894
            ],
            "range": [
              79,
              80
            ]
          },
          {
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r26",
            "label": "Market Street & Potrero Ave. Extensions",
            "temporal": [
              1891,
              1893
            ],
            "range": [
              81,
              83
            ]
          }
        ]
      },
      {
        "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r27",
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
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r28",
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
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r29",
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
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r30",
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
        "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r31",
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
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r32",
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
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r33",
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
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r34",
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
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r35",
            "label": "Closing San Francisco Office",
            "temporal": [
              1899
            ],
            "range": 114
          },
          {
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r36",
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
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r37",
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
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r38",
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
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r39",
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
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r40",
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
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r41",
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
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r42",
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
        "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r43",
        "label": "San Francisco Earthquake",
        "temporal": [
          1906
        ],
        "range": [
          152,
          162
        ],
        "children": [
          {
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r44",
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
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r45",
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
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r46",
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
        "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r47",
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
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r48",
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
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r49",
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
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r50",
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
            "id": "https://iiif.library.nuigalway.ie/manifests/p135/range/r51",
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
      '#A84796', '#C3DA34', '#6ECAE9', '#F38413'
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
