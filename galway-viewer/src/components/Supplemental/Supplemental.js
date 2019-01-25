import React, { Component } from 'react';
import { connect } from 'react-redux';
import './Supplemental.scss';
import {
  Manifest,
  CanvasProvider,
  CanvasNavigation,
  SingleTileSource,
  OpenSeadragonViewer,
  withBemClass,
  FullPageViewport,
  OpenSeadragonViewport,
} from '@canvas-panel/core';
import { deselectAnnotation } from '@canvas-panel/redux/es/spaces/annotations';
import { getManifestData } from '../../utils';

class Supplemental extends Component {
  state = {
    loading: false,
    manifest: null,
  };

  componentWillMount() {
    this.setAnnotation(this.props.annotation);
  }

  pressEscape = e => (e.keyCode === 27 ? this.close() : null);

  componentDidMount() {
    document.addEventListener('keydown', this.pressEscape);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.pressEscape);
  }

  componentWillReceiveProps(newProps) {
    if (newProps.annotation !== this.props.annotation) {
      this.setAnnotation(newProps.annotation);
    }
  }

  setAnnotation(annotation) {
    if (!annotation) {
      return;
    }
    const manifestData = getManifestData(annotation.annotation);
    if (manifestData) {
      this.setState({
        loading: true,
        manifestId: manifestData.manifest,
      });
      fetch(manifestData.manifest, { cache: 'force-cache' })
        .then(r => r.json())
        .then(manifest => {
          if (manifestData.manifest === this.state.manifestId) {
            this.setState({
              loading: false,
              manifest,
              active: true,
            });
          }
        });
    }
  }

  close = () => {
    this.setState({ active: false });
    this.props.dispatch(deselectAnnotation());
  };

  getRepositoryLink = () => {
    const { manifest } = this.state;
    if (manifest && manifest.related) {
      const repo = Array.isArray(manifest.related)
        ? manifest.related[0]
        : manifest.related;
      if (repo.id || repo['@id']) {
        return {
          url: repo.id || repo['@id'],
          label: repo.label || 'More info',
        };
      }
    }

    return null;
  };

  render() {
    const { manifest, loading, active } = this.state;
    const { annotation, bem } = this.props;
    const repository = this.getRepositoryLink();
    return (
      <div className={bem.modifiers({ active })}>
        <div onClick={this.close} className={bem.element('lightbox')} />
        {annotation && manifest && loading === false ? (
          <div className={bem.element('inner-content')}>
            <div onClick={this.close} className={bem.element('close')}>
              &times;
            </div>
            <div className={bem.element('inner')}>
              <div className={bem.element('aside')}>
                <div className={bem.element('title')}>{manifest.label}</div>
                <div className={bem.element('description')}>
                  {manifest.description || '(no description)'}
                </div>
                {repository ? (
                  <a
                    className={bem.element('link')}
                    target="_blank"
                    href={repository.url}
                  >
                    {repository.label} <i className="material-icons">launch</i>
                  </a>
                ) : null}
              </div>
              <div className={bem.element('images')}>
                <Manifest jsonLd={manifest}>
                  <CanvasProvider startCanvas={0}>
                    <SingleTileSource>
                      <FullPageViewport interactive={true} position="relative">
                        <OpenSeadragonViewport
                          useMaxDimensions={true}
                          osdOptions={{
                            visibilityRatio: 1,
                            constrainDuringPan: true,
                            showNavigator: false,
                          }}
                        />
                      </FullPageViewport>
                    </SingleTileSource>
                  </CanvasProvider>
                </Manifest>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    annotationId: state.annotations.selected.id,
    annotation: state.annotations.selected.id
      ? state.annotations.index[state.annotations.selected.id]
      : null,
  };
}

export default connect(mapStateToProps)(
  withBemClass('supplemental')(Supplemental)
);
