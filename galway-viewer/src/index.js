import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from '@canvas-panel/redux';
import {
  reducer as timelineReducer,
  saga as timelineSaga,
} from '@canvas-panel/timeline';
import {
  reducer as searchReducer,
  saga as searchSaga,
} from '@canvas-panel/search';
import App from './App';

if (process.env.NODE_ENV !== 'production') {
  require('@fesk/plugin-micro-site/lib/js');
  require('css-reset-and-normalize-sass/scss/flavored-reset-and-normalize.scss');
  require('@fesk/plugin-markdown/lib/scss/markdown.scss');
  require('@fesk/plugin-markdown/lib/scss/prism.scss');
  require('@fesk/plugin-micro-site/lib/scss/micro-site.scss');
}

const store = createStore(
  {
    structure: timelineReducer,
    search: searchReducer,
  },
  [],
  [timelineSaga, searchSaga]
);

render(
  <Provider store={store}>
    <App
      manifestUri={
        window.location.hash.substr(1) ||
        'https://gist.githubusercontent.com/stephenwf/8c417a212866a21f48bd3ce9182e2f28/raw/cbfc217bd4c2f9311438a881db9a43fd015481cb/raw.json'
      }
    />
  </Provider>,
  // <App manifestUri="https://wellcomelibrary.org/iiif/b18035723/manifest" />,
  document.querySelector('#app')
);
