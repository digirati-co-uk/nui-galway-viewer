const manifest = require('./src/manifest');

const range = [
  {
    label: 'Childhood and Schooling',
    temporal: [1864, 1881],
    range: ['001', '037'],
    members: [
      {
        label: 'Living with maternal grandparents',
        temporal: [1866],
        range: ['001', '003']
      },
      {
        label: 'Pallaskenry girls\' National School',
        temporal: [1868],
        range: ['004', '005']
      },
      {
        label: 'Pallaskenry boys\' National School',
        temporal: [1870],
        range: ['006', '007']
      },
      {
        label: 'Childhood mischief',
        temporal: [1871],
        range: ['008', '016']
      },
      {
        label: 'Marriage of Aunt Alice',
        temporal: [1872],
        // range: ['017', '018']
        range: ['017', '021']
      },
      {
        label: 'Marriage of Uncle Maurice',
        temporal: [1873],
        // range: ['022', '024']
        range: ['022', '026']
      },
      {
        label: 'Moriarty\'s wake',
        temporal: [1873],
        // range: ['027', '028']
        range: ['027', '029']
      },
      {
        label: 'Escape to Kilkerin',
        temporal: [1873],
        range: ['030', '032']
      },
      {
        label: 'School in Flean, near Loughill',
        temporal: [1874],
        range: ['031', '032']
      },
      {
        label: 'School in Mount Trenchard',
        temporal: [1875, 1880],
        range: ['033', '034']
      },
      {
        label: 'School in Rockwell College',
        temporal: [1881],
        range: ['035', '037']
      },
    ]
  },
  {
    label: 'University',
    temporal: [1881, 1884],
    range: ['038', '045'],
    members: [
      {
        temporal: [1881],
        label: 'Scholarship to Queen\'s College Cork',
        range: ['038', '041']
      },
      {
        temporal: [1882],
        label: 'Move to Queen\'s College Galway',
        range: ['042', '045']
      }
    ],
  },
  {
    label: 'San Francisco and Early Work (p. 46-67)',
    temporal: [1885, 1888],
    range: ['046', '067'],
    members: [
      {
        temporal: [1885],
        label: 'Emigration',
        range: ['046', '049']
      },
      {
        temporal: [1885],
        label: 'Arrival in San Francisco',
        range: ['050', '051']
      },
      {
        temporal: [1886],
        label: 'First Engineering Work, Sierra Valley & Mohawk Railroad Co.',
        range: ['052', '054']
      },
      {
        temporal: [1886, 1888],
        label: 'Second Engineering Job, Southern Pacific Co.',
        range: ['055', '064']
      },
      {
        temporal: [1888],
        label: 'San Pedro Soundings and Townsites',
        range: ['065', '068']
      },
    ]
  },
  {
    label: 'Rail, Mining & Civil Engineering Work',
    temporal: [1888, 1893],
    range: ['068', '083'],
    members: [
      {
        temporal: [1888],
        label: 'Eureka Ranch & Santa Ysabel',
        range: ['068', '070']
      },
      {
        temporal: [1888, 1890],
        label: 'Mill Valley',
        range: ['071', '078']
      },
      {
        temporal: [1890, 1894],
        label: 'Ingleside race-track',
        range: ['079', '080']
      },
      {
        temporal: [1891, 1893],
        label: 'Market Street & Potrero Ave. Extensions',
        range: ['081', '083']
      },
    ]
  },

  {
    label: 'Midwinter Exposition & Civil Engineering',
    temporal: [1893, 1899],
    range: ['084', '099'],
    members: [
      {
        label: 'Chief Engineer Midwinter Exposition',
        temporal: [1893],
        range: ['084', '089']
      },
      {
        label: 'Chief Engineer Shasta County',
        temporal: [1894],
        range: ['090', '095']
      },
      {
        label: 'Spring Valley Water Works',
        temporal: [1897, 1898],
        range: ['096', '099']
      }
    ]
  },
  {
    label: 'Hawaii',
    temporal: [1899, 1906],
    range: ['100', '148'],
    members: [
      {
        label: 'First Hawaiian Surveys',
        temporal: [1899],
        range: ['100', '108']
      },
      {
        label: 'Return to San Francisco',
        temporal: [1899],
        range: ['109', '111']
      },
      {
        label: 'Second Visit to Hawaii, irrigation',
        temporal: [1899],
        range: ['112', '114']
      },
      {
        label: 'Closing San Francisco Office',
        temporal: [1899],
        range: ['115', '116'],
      },
      {
        label: 'Third Visit to Hawaii, sugar stock collapse',
        temporal: [1900],
        range: ['117', '119']
      },
      {
        label: 'Fourth Visit to Hawaii, hydraulic power',
        temporal: [1901],
        range: ['120', '124']
      },
      {
        label: 'Mill Valley Politics',
        temporal: [1901],
        range: ['125', '126']
      },
      {
        label: 'Olokele Aqueduct',
        temporal: [1901],
        range: ['127', '130']
      },
      {
        label: 'Koolau Viaduct',
        temporal: [1903],
        range: ['131', '141']
      },
      {
        label: 'Kohala Aqueduct',
        temporal: [1904],
        range: ['142', '145']
      },
      {
        label: 'Shipwreck Alameda',
        temporal: [1905],
        range: ['145a', '148']
      }
    ]
  },
  {
    label: 'San Francisco Earthquake',
    temporal: [1906],
    range: ['149', '159'],
    members: [
      {
        label: 'News of Earthquake',
        temporal: [1906],
        range: ['149', '151']
      },
      {
        label: 'Return to San Francisco',
        temporal: [1906],
        range: ['152', '156']
      },
      {
        label: 'Finishing Kohala Aqueduct',
        temporal: [1906],
        range: ['157', '159']
      }
    ]
  },
  {
    label: 'San Diego & the Morena Dam',
    range: ['160', '175'],
    temporal: [1907, 1912],
    members: [
      {
        label: 'First San Diego Visit',
        temporal: [1907],
        range: ['160', '163']
      },
      {
        label: 'The Morena Dam',
        temporal: [1907],
        range: ['164', '166']
      },
      {
        label: 'Personal contacts in San Diego',
        temporal: [1907],
        range: ['167', '171']
      },
      {
        label: 'Sale San Diego System',
        temporal: [1912],
        range: ['172', '175']
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

console.log(
  JSON.stringify(manifest, null, 2)
);
process.exit();

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
// console.log(
//   JSON.stringify(manifest, null, 2)
// );
