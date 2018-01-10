const manifest = require('./src/manifest');

const range = [
  {
    'label': 'Midwinter Exposition & Civil Engineering',
    'temporal': [1893, 1899],
    'range': ['084', '099'],
    'members': [
      {
        'label': 'Chief Engineer Midwinter Exposition',
        'temporal': [1893],
        'range': ['084', '089']
      },
      {
        'label': 'Chief Engineer Shasta County',
        'temporal': [1894],
        'range': ['090', '095']
      },
      {
        'label': 'Spring Valley Water Works',
        'temporal': [1897, 1898],
        'range': ['096', '099']
      }
    ]
  },
  {
    'label': 'Hawaii',
    'temporal': [1899, 1906],
    'range': ['100', '148'],
    'members': [
      {
        'label': 'First Hawaiian Surveys',
        'temporal': [1899],
        'range': ['100', '108']
      },
      {
        'label': 'Return to San Francisco',
        'temporal': [1899],
        'range': ['109', '111']
      },
      {
        'label': 'Second Visit to Hawaii, irrigation',
        'temporal': [1899],
        'range': ['112', '114']
      },
      {
        'label': 'Closing San Francisco Office',
        'temporal': [1899],
        'range': ['115'],
      },
      {
        'label': 'Third Visit to Hawaii, sugar stock collapse',
        'temporal': [1900],
        'range': ['116', '119']
      },
      {
        'label': 'Fourth Visit to Hawaii, hydraulic power',
        'temporal': [1901],
        'range': ['120', '124']
      },
      {
        'label': 'Mill Valley Politics',
        'temporal': [1901],
        'range': ['125', '126']
      },
      {
        'label': 'Olokele Aqueduct',
        'temporal': [1901],
        'range': ['127', '130']
      },
      {
        'label': 'Koolau Viaduct',
        'temporal': [1903],
        'range': ['131', '141']
      },
      {
        'label': 'Kohala Aqueduct',
        'temporal': [1904],
        'range': ['142', '145']
      },
      {
        'label': 'Shipwreck Alameda',
        'temporal': [1905],
        'range': ['145a', '148']
      }
    ]
  },
  {
    'label': 'San Francisco Earthquake (p. 149-159)',
    'temporal': [1906],
    'range': ['149', '159'],
    'members': [
      {
        'label': 'News of Earthquake',
        'temporal': [1906],
        'range': ['149', '151']
      },
      {
        'label': 'Return to San Francisco',
        'temporal': [1906],
        'range': ['152', '156']
      },
      {
        'label': 'Finishing Kohala Aqueduct',
        'temporal': [1906],
        'range': ['157', '159']
      }
    ]
  },
  {
    'label': 'San Diego & the Morena Dam',
    'range': ['160', '175'],
    'temporal': [1907, 1912],
    'members': [
      {
        'label': 'First San Diego Visit',
        'temporal': [1907],
        'range': ['160', '163']
      },
      {
        'label': 'The Morena Dam',
        'temporal': [1907],
        'range': ['164', '166']
      },
      {
        'label': 'Personal contacts in San Diego',
        'temporal': [1907],
        'range': ['167', '171']
      },
      {
        'label': 'Sale San Diego System',
        'temporal': [1912],
        'range': ['172', '175']
      }
    ]
  }
];

const l = 'https://iiif.library.nuigalway.ie/manifests/p135/canvas/p135_memoir_'.length;
const allCanvases = manifest.sequences[0].canvases;
const canvasPages = allCanvases.reduce((acc, canvas, n) => {
  const prefixed = canvas['@id'].slice(l);
  const number = prefixed.slice(0, prefixed.indexOf('.'));
  canvas.key = n;
  acc[number] = canvas;
  return acc;
}, {});

const canvasNumMap = allCanvases.reduce((acc, canvas, num) => {
  acc[canvas['@id']] = num;
  return acc;
}, {});

function getCanvasIndex(pageKey) {
  return canvasPages[pageKey].key;
}

function flatten(acc, item) {
  acc.push(item);
  if (item.members) {
    return item.members.reduce(flatten, acc);
  }
  return acc;
}

function newRange(id, label, temporal) {
  return {
    '@id': `https://iiif.library.nuigalway.ie/manifests/p135/range/r${id}`,
    '@type': 'sc:Range',
    'label': label,
    'dcterms:temporal': temporal.length === 1 ? `${temporal[0]}-01-01` : temporal.map(t => `${t}-01-01`).join('/'),
  };
}

function pad(num, size) {
  return ('000000000' + num).substr(-size);
}

function addCanvases(item, range) {
  const from = getCanvasIndex(range[0]);
  const to = getCanvasIndex(range[1] || range[0]);
  const list = [];
  for (let id = from; id <= to; id++) {
    const canvas = allCanvases[id];
    list.push(canvas['@id']);
  }
  if (item.members) {
    item.members = [...item.members, ...list.map(item => {
      return {
        '@id': item,
        '@type': 'sc:Canvas'
      };
    })];
  } else {
    item.canvases = list;
  }

  return item;
}

function addMembers(item, members) {

  if (members) {
    item.members = members.map(member => {
      return {
        '@id': `https://iiif.library.nuigalway.ie/manifests/p135/range/r${member.key}`,
        '@type': 'sc:Range',
        'label': member.label
      };
    });
  }

  return item;
}

function createTopLevel(topLevelMembers) {
  const topLevel = {
    '@id': 'https://iiif.library.nuigalway.ie/manifests/p135/range/r0',
    '@type': 'sc:Range',
    'label': 'Timeline',
    'viewingHint': 'top',
  };
  return addMembers(topLevel, topLevelMembers);
}

const flattened = range.reduce(flatten, []);
const ranges = flattened.map((item, key) => {
  item.key = key + 1;
  return item;
}).map(
  (item) =>
    addCanvases(
      addMembers(
        newRange(item.key, item.label, item.temporal),
        item.members
      ),
      item.range
    )
);
manifest.structures = [
  createTopLevel(range),
  ...ranges
];

function createMap(acc, range) {
  acc[range['@id']] = range;
  return acc;
}

function findTopLevel(found, range) {
  if (!found && range.viewingHint === 'top') {
    return range;
  }
  return found;
}

function expander(mapped) {
  return (item) => mapped[item['@id']];
}

function enhancedStructure(expand) {
  return (input) => {
    const range = expand(input);
    if (range.members) {
      range.canvases = range.members.filter(member => member['@type'] === 'sc:Canvas').map(member => member['@id']);
      range.members = range.members.filter(member => member['@type'] === 'sc:Range').map(enhancedStructure(expand));
    }
    // console.log(canvasToNumber);
    range.canvasNumbers = range.canvases.map(i => canvasNumMap[i]);
    range.range = range.canvasNumbers.length === 1 ? range.canvasNumbers[0] : [
      Math.min(...range.canvasNumbers),
      Math.max(...range.canvasNumbers),
    ];
    range.temporal = range['dcterms:temporal'].split('/').map(date => parseInt(date.slice(0, 4)));

    const structure = {
      id: range['@id'],
      label: range.label,
      temporal: range.temporal,
      range: range.range,
    };
    if (range.members) {
      structure.children = range.members;
    }
    return structure;
  };
}

function createStructure(topLevel, mapped) {
  const expand = expander(mapped);
  return topLevel.members.map(enhancedStructure(expand));
}

const mapped = manifest.structures.reduce(createMap, {});
const topLevel = manifest.structures.reduce(findTopLevel, false);

const final = createStructure(topLevel, mapped);
console.log(
  JSON.stringify(final, null, 2)
);
