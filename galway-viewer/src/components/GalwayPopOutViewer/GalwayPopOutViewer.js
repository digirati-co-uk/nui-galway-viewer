import React, { Component } from 'react';
import { withBemClass } from '@canvas-panel/core';
import App from '../../App';
import './GalwayPopOutViewer.scss';

class GalwayPopOutViewer extends Component {
  state = {
    isOpen: false,
  };

  open = () => this.setState({ isOpen: true });

  close = () => this.setState({ isOpen: false });

  render() {
    const { isOpen } = this.state;
    const { text, bem, placeholderClassName, ...props } = this.props;

    return (
      <div className={bem}>
        <span
          onClick={this.open}
          className={`${bem.element('trigger')} ${placeholderClassName}`.trim()}
        >
          {text}
        </span>
        <div className={bem.element('viewer').modifiers({ isOpen })}>
          <App onClose={this.close} {...props} />
        </div>
      </div>
    );
  }
}

export default withBemClass('galway-pop-out-viewer')(GalwayPopOutViewer);
