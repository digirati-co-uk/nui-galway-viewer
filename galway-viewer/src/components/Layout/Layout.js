import React, { Component } from 'react';
import { withBemClass } from '@canvas-panel/core';
import './Layout.scss';

class Layout extends Component {
  render() {
    const { bem, children, ...props } = this.props;
    return (
      <main className={bem} {...props}>
        {children}
      </main>
    );
  }
}

const StyledLayout = withBemClass('layout')(Layout);

StyledLayout.Header = withBemClass('layout')(
  class LayoutHeader extends Component {
    render() {
      const { children, bem } = this.props;
      return <header className={bem.element('header')}>{children}</header>;
    }
  }
);

StyledLayout.Main = withBemClass('layout')(
  class LayoutMain extends Component {
    render() {
      const { children, bem } = this.props;
      return <article className={bem.element('main')}>{children}</article>;
    }
  }
);

StyledLayout.Footer = withBemClass('layout')(
  class LayoutFooter extends Component {
    render() {
      const { children, bem } = this.props;
      return <footer className={bem.element('footer')}>{children}</footer>;
    }
  }
);

StyledLayout.Modal = withBemClass('layout')(
  class LayoutModal extends Component {
    render() {
      const { children, bem } = this.props;
      return <div className={bem.element('modal')}>{children}</div>;
    }
  }
);

export default StyledLayout;
