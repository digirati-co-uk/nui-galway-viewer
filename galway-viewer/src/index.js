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
import { htmlElementObserver, ObservableElement } from '@canvas-panel/core';
import App from './App';
import GalwayPopOutViewer from './components/GalwayPopOutViewer/GalwayPopOutViewer';

if (process.env.NODE_ENV !== 'production') {
  require('@fesk/plugin-micro-site/lib/js');
  require('css-reset-and-normalize-sass/scss/flavored-reset-and-normalize.scss');
  require('@fesk/plugin-markdown/lib/scss/markdown.scss');
  require('@fesk/plugin-markdown/lib/scss/prism.scss');
  require('@fesk/plugin-micro-site/lib/scss/micro-site.scss');
  require('./components/micro-site-fixes.scss');
}

const storeCache = {};
function getStoreFromCache(manifestId) {
  if (!storeCache[manifestId]) {
    storeCache[manifestId] = createStore(
      {
        structure: timelineReducer,
        search: searchReducer,
      },
      [],
      [timelineSaga, searchSaga]
    );
  }
  return storeCache[manifestId];
}

function isValidElement($el) {
  const manifest = $el.getAttribute('data-manifest');
  return !!manifest.trim();
}

function createGalwayViewerComponent($viewer) {
  if (!isValidElement($viewer)) {
    return null;
  }
  const initialProps = { ...$viewer.dataset };
  const innerText = $viewer.innerText;
  const store = getStoreFromCache(initialProps.manifest);

  render(
    <ObservableElement
      observer={htmlElementObserver($viewer)}
      initialProps={initialProps}
      render={props =>
        props.manifest ? (
          <Provider store={store}>
            <GalwayPopOutViewer
              {...props}
              text={innerText}
              getRef={osd => ($viewer.osd = osd)}
            />
          </Provider>
        ) : null
      }
    />,
    $viewer
  );
}

document.addEventListener('DOMContentLoaded', () => {
  const popup = Array.from(
    document.querySelectorAll('[data-element="galway-viewer-pop-out"]')
  );

  popup.forEach($popOut => {
    try {
      createGalwayViewerComponent($popOut);
    } catch (e) {
      console.warn('Unable to render viewer', e);
    }
  });

  const viewers = Array.from(
    document.querySelectorAll('[data-element="galway-viewer"]')
  );

  viewers.forEach($viewer => {
    if (!isValidElement($viewer)) {
      return null;
    }
    const manifest = $viewer.getAttribute('data-manifest');
    console.log(manifest);
    const store = getStoreFromCache(manifest);

    render(
      <Provider store={store}>
        <App manifest={$viewer.getAttribute('data-manifest')} />
      </Provider>,
      $viewer
    );
  });
});
