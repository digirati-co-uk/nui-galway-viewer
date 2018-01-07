import {
  byLevelsReducer,
  changePointsReducer,
  createMatrix,
  depthsReducer, div,
  rangeReducer, setStyle
} from "../utils";

export default class DeepRange {

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
            range: [0, 5]
          },
          {
            id: 'testing-1-2',
            label: 'testing-1-2',
            range: [6, 10]
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
          // @todo GAP FILLING, self reference
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

    /*
     * New Plan:
     * - Find max depth.
     * - For each depth create list of keys (next/prev).
     * - Use these to find current/next/prev.
     * - Most of it should be the same.
     */

    function assignNumber(vars) {
      return (singleItem) => {
        singleItem.key = vars.num;
        vars.num += 1;
        if (singleItem.children) {
          singleItem.children.forEach(assignNumber(vars))
        }
      }
    }

    const vars = { num: 0 };
    this.structure.forEach(assignNumber(vars));


    this.parentDescription = this.structure.reduce((state, topLevel, currentIndex) => ({
      ranges: rangeReducer(currentIndex)(state.ranges, topLevel),
      changePoints: changePointsReducer(state.changePoints, topLevel),
      depths: depthsReducer(0)(state.depths, topLevel)
    }), {ranges: [], changePoints: [], depths: []});

    this.byLevels = this.structure.reduce(byLevelsReducer(0), {
      depths: [],
      flattened: [],
    });


    this.byLevels.depths = this.byLevels.depths.map(singleDepth => {
      const r = singleDepth.map(e => this.parentDescription.ranges[e]);
      const missing = this.parentDescription.ranges.filter((i) => {
        return r.indexOf(i) === -1;
      });
      // console.log('SINGLE: ', singleDepth);

      return singleDepth
        .reduce((state, item, k) => {
          while (missing.length !== 0 && item > this.parentDescription.ranges.indexOf(missing[missing.length - 1])) {
            state.push(this.parentDescription.ranges.indexOf(missing.shift()));
          }
          state.push(item);
          return state;
        }, []);
    });


    this.matrix = createMatrix(this.byLevels, this.parentDescription);

    // this.matrix.map(m => console.table(m));

    const initialMatrix = this.getMatrixByIndexAndDepth(452, 1);
    // console.log(initialMatrix);
    /*
      <div class="galway-timeline__item" style="flex: 113">
        <div class="galway-timeline__representation"></div>
        <div class="galway-timeline__temporal">1888</div>
      </div>
     */
    this.$elements = initialMatrix.map(
      (visibility, key) => {
        const item = this.keyToItem(key);
        return (
          div({className: 'galway-timeline__item', style: this.computeStyleFromItem(item, visibility)}, [
            div({className: 'galway-timeline__representation'}),
            div({className: 'galway-timeline__temporal'}, [item.label]),
          ])
        )
      }
    );

    const $el = document.querySelector('.galway-timeline__item-container');
    $el.innerHTML = '';
    this.$elements.forEach($element => {
      $el.appendChild($element);
    })

    // let n = 0;

    // setInterval(() => {
    //   n += 10;
    //   const matrix = this.getMatrixByIndexAndDepth(n, 1);
    //   const currentItem = this.byLevels.depths[1][this.getPositionInDepth(n, 1)];
    //
    //   console.log(currentItem, this.byLevels);
    //
    //   matrix.forEach((visibility, key) => {
    //     const $element = this.$elements[key];
    //     const item = this.keyToItem(key);
    //     // console.log(key, pos);
    //     if (key === currentItem) {
    //       setStyle($element, { outline: '1px solid red' });
    //     } else {
    //       setStyle($element, { outline: 'none' });
    //     }
    //     setStyle($element, this.computeStyleFromItem(item, visibility));
    //   })
    // }, 500)
  }

  keyToItem(key) {
    return this.byLevels.flattened[key];
  }

  getPosition(index) {
    return this.parentDescription.changePoints.reduce((state, item, k) => {
      return index >= item ? k : state;
    }, null) - 1;
  }

  getPositionInDepth(index, depth) {
    return this.parentDescription.depths[depth].reduce((state, item, k) => {
      return index >= item ? k : state;
    }, null);
  }

  getMatrixByIndexAndDepth(index, depth) {
    const pos = this.getPositionInDepth(index, depth);

    return this.matrix[depth][pos];
  }

  findChildrenMatchingRange = (canvasIndex) => (found, structure, index) => {
    if (found === false) {
      const [from, to] = structure.range;
      if (canvasIndex >= from && canvasIndex <= to) {
        return structure;
      }
    }
    return found;
  };

  findLevel = (arr, canvasIndex, targetLevel, level = 0) => {
    if (!arr) {
      return [];
    }
    if (targetLevel === level) {
      return arr || [];
    }
    const found = arr.reduce(this.findChildrenMatchingRange(canvasIndex), false);
    const nextLevel = level + 1;
    if (targetLevel === nextLevel) {
      return found.children ? found.children : [found];
    }
    return this.findLevel(found.children, targetLevel, level + 1);
  };


  render(canvasIndex, depth) {
    const currentTopLevel = this.structure.reduce(this.findChildrenMatchingRange(canvasIndex), false);
    const topLevelKeys = this.structure.map(item => item.key);

    if (depth === 0) {
      this.$elements.forEach(($element, key) => {
        const currentLevel = topLevelKeys.indexOf(key);
        if (currentLevel !== -1) {
          const item = this.structure[currentLevel];
          setStyle($element, {flex: item.range[1] - item.range[0], 'flex-basis': '0px'});
          return;
        }

        setStyle($element, {flex: 0.0001, 'flex-basis': '0px'});
      });
      return;
    }


    // console.log('=> finding previous');
    // const prevLevelViews = (
    //   currentTopLevel.prev && currentTopLevel.prev.children
    //     ? this.findLevel(currentTopLevel.prev.children, canvasIndex, depth)
    //     : (currentTopLevel.prev ? [currentTopLevel.prev] : null)
    // );
    // const prevView = prevLevelViews ? prevLevelViews.shift() : null;

    const currentLevelViews = this.findLevel(this.structure, canvasIndex, depth);

    // console.log('=> finding next');
    // const nextLevelViews = (
    //   currentTopLevel.next && currentTopLevel.next.children
    //     ? this.findLevel(currentTopLevel.next.children, canvasIndex, depth)
    //     : (currentTopLevel.next ? [currentTopLevel.next] : null)
    // );
    // const nextView = nextLevelViews ? nextLevelViews.pop() : null;

    const currentLevelKeys = currentLevelViews.map(item => item.key);
    this.$elements.forEach(($element, key) => {
      // if (
      //   (prevView && prevView.key === key) ||
      //   (nextView && nextView.key === key)
      // ) {
      //   setStyle($element, {flex: '0 0 80px'});
      //   return;
      // }

      const currentLevel = currentLevelKeys.indexOf(key);
      if (currentLevel !== -1) {
        const item = currentLevelViews[currentLevel];
        setStyle($element, {flex: item.range[1] - item.range[0], 'flex-basis': '0px'});
        return;
      }

      setStyle($element, {flex: 0.0001, 'flex-basis': '0px'});
    });

    return;



    const matrix = this.getMatrixByIndexAndDepth(canvasIndex, depth);

    const currentItem = this.byLevels.depths[depth][this.getPositionInDepth(canvasIndex, depth)];

    matrix.forEach((visibility, key) => {
      const $element = this.$elements[key];
      const item = this.keyToItem(key);
      if (key === currentItem) {

        $element.classList.add('galway-timeline__item--active');
        // setStyle($element, {outline: '1px solid red'});
      } else {
        $element.classList.remove('galway-timeline__item--active');
        // setStyle($element, {outline: 'none'});
      }
      setStyle($element, this.computeStyleFromItem(item, visibility));
    })

  }

  computeStyleFromItem(item, visibility) {
    if (visibility === 0) {
      return {flex: 0.0001, 'flex-basis': '0px'};
    }
    if (visibility === 1) {
      return {flex: 1, 'flex-basis': '40px'}
    }

    return {flex: item.range[1] - item.range[0], 'flex-basis': '0px'}
  }
}
