import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  withBemClass,
  Manifest,
  CanvasProvider,
  SingleTileSource,
  OpenSeadragonViewer,
  OpenSeadragonViewport,
  FullPageViewport,
  AnnotationRepresentation,
} from '@canvas-panel/core';
import {
  manifestNextCanvas,
  manifestPrevCanvas,
} from '@canvas-panel/redux/es/spaces/manifest';
import { selectAnnotation } from '@canvas-panel/redux/es/spaces/annotations';
import { manifestSetCanvas } from '@canvas-panel/redux/es/spaces/manifest';
import Paging from '../Paging/Paging';
import ViewerControls from '../ViewerControls/ViewerControls';
import './Viewer.scss';
import { hasManifestData } from '../../utils';

class Viewer extends Component {
  setViewport = viewport => {
    this.viewport = viewport;
    if (this.props.setViewport) {
      this.props.setViewport(viewport);
    }
  };

  zoomIn = () => {
    if (this.viewport) {
      this.viewport.zoomIn();
    }
  };

  zoomOut = () => {
    if (this.viewport) {
      this.viewport.zoomOut();
    }
  };

  pressArrows = e => {
    const { dispatch } = this.props;

    if (e.keyCode === 37 /* left arrow */) {
      dispatch(manifestPrevCanvas());
    }
    if (e.keyCode === 39 /* right arrow */) {
      dispatch(manifestNextCanvas());
    }

    if (e.keyCode === 189 /* dash */) {
      this.zoomOut();
    }

    if (e.keyCode === 187 /* equals */) {
      this.zoomIn();
    }
  };

  componentWillReceiveProps(nextProps, nextContext) {
    if (
      this.props.isPending === true &&
      nextProps.isPending === false &&
      nextProps.startCanvas
    ) {
      this.props.dispatch(manifestSetCanvas(nextProps.startCanvas));
    }
  }

  render() {
    const {
      bem,
      manifest,
      isLoaded,
      isPending,
      error,
      currentCanvas,
      annotations,
      dispatch,
      searchAvailable,
      currentAnnotation,
      search,
      isFullscreen,
      exitFullscreen,
      goFullscreen,
    } = this.props;

    if (error) {
      return <div>Error: {error}</div>;
    }

    if (!isLoaded || isPending) {
      return <div>loading...</div>;
    }

    return (
      <div className={bem} onKeyDown={this.pressArrows}>
        <ViewerControls
          onZoomIn={this.zoomIn}
          onZoomOut={this.zoomOut}
          isFullscreen={isFullscreen}
          onFullscreen={isFullscreen ? exitFullscreen : goFullscreen}
        />
        <Manifest jsonLd={manifest}>
          <CanvasProvider currentCanvas={currentCanvas}>
            {props => (
              <div>
                <Paging canvas={props.canvas} />
                <div className={bem.element('osd')}>
                  <FullPageViewport
                    interactive={true}
                    position="relative"
                    setRef={this.setViewport}
                    {...props}
                  >
                    <SingleTileSource viewportController={true}>
                      <OpenSeadragonViewport viewportController={true}>
                        <OpenSeadragonViewer
                          useMaxDimensions={true}
                          osdOptions={{
                            visibilityRatio: 1,
                            constrainDuringPan: true,
                            showNavigator: false,
                            // immediateRender: false,
                          }}
                        />
                      </OpenSeadragonViewport>
                    </SingleTileSource>
                    {searchAvailable ? (
                      <AnnotationRepresentation
                        annotations={search.annotations || []}
                        ratio={0.1}
                        growthStyle="fixed"
                        bemModifiers={() => ({ search: true })}
                      />
                    ) : (
                      <AnnotationRepresentation
                        annotations={annotations || []}
                        ratio={0.1}
                        growthStyle="fixed"
                        bemModifiers={annotation => ({
                          selected:
                            annotation.id &&
                            annotation.id === currentAnnotation,
                          linking: hasManifestData(annotation),
                        })}
                        annotationContent={(annotation, b) => {
                          if (
                            annotation &&
                            annotation.__jsonld &&
                            annotation.__jsonld.resource &&
                            annotation.__jsonld.resource.within &&
                            annotation.__jsonld.resource.within.label
                          ) {
                            return (
                              <div className={b.element('label')}>
                                {annotation.__jsonld.resource.within.label}
                              </div>
                            );
                          }
                        }}
                        onClickAnnotation={annotation =>
                          dispatch(
                            selectAnnotation(annotation.id, 'otherContent')
                          )
                        }
                      />
                    )}
                  </FullPageViewport>
                </div>
              </div>
            )}
          </CanvasProvider>
        </Manifest>
      </div>
    );
  }
}

function mapSearchState(state, currentCanvas) {
  const searchState = state.search;
  if (!searchState) {
    return null;
  }
  const { currentQuery, isLoading, queries, error } = searchState;
  const currentQueryResults = queries[currentQuery];

  return {
    currentQuery,
    isLoading,
    error,
    currentQueryResults,
    annotations:
      currentQueryResults && currentQueryResults.canvasMap
        ? currentQueryResults.canvasMap[currentCanvas.id] || []
        : [],
  };
}

function mapStateToProps(state) {
  const startCanvas = state.manifest.manifesto
    ? state.manifest.manifesto
        .getSequenceByIndex(0)
        .getCanvasIndexById(state.manifest.manifesto.__jsonld.startCanvas)
    : 0;
  const currentCanvasIndex = state.manifest.currentCanvas;
  const currentCanvas = state.manifest.manifesto
    ? state.manifest.manifesto
        .getSequenceByIndex(0)
        .getCanvasByIndex(currentCanvasIndex)
    : null;
  const annotationIds = currentCanvas
    ? state.annotations.canvasMap[currentCanvas.id]
    : null;
  const search = mapSearchState(state, currentCanvas);

  return {
    search,
    searchAvailable:
      search && search.currentQuery && search.isLoading === false,
    isLoaded: !!state.manifest.currentManifest,
    manifest: state.manifest.jsonLd,
    isPending: state.manifest.isPending,
    error: state.manifest.errorMessage,
    currentCanvas: state.manifest.currentCanvas,
    startCanvas,
    currentAnnotation: state.annotations.selected
      ? state.annotations.selected.id
      : null,
    currentAnnotationData:
      state.annotations.selected && state.annotations.selected.id
        ? state.annotations.index[state.annotations.selected.id]
        : null,
    annotationIds,
    annotations: annotationIds
      ? annotationIds.map(id => state.annotations.index[id])
      : [],
  };
}

export default connect(mapStateToProps)(withBemClass('viewer')(Viewer));
