/**
 * @flow
 */
import React, { Component } from 'react';
import { withBemClass } from '@canvas-panel/core';
import './Header.scss';

type Props = {
  bem: any,
  onClickInfo: any => void,
  onClickMenu: any => void,
  onClickClose: any => void,
  onClickShare: any => void,
};

class Header extends Component<Props> {
  render() {
    const {
      bem,
      onClickInfo,
      onClickMenu,
      onClickClose,
      onClickShare,
    } = this.props;
    return (
      <header className={bem}>
        <button
          onClick={onClickMenu}
          className={`${bem.element('menu')} material-icons`}
        >
          menu
        </button>
        <span className={`${bem.element('title')} mdc-typography`}>
          O’Shaughnessy Memoirs
        </span>
        {onClickShare ? (
          <button className={`${bem.element('share')} material-icons`}>
            share
          </button>
        ) : null}
        <button
          onClick={onClickInfo}
          className={`${bem.element('info')} material-icons`}
        >
          info
        </button>
        {onClickClose ? (
          <button
            onClick={onClickClose}
            className={`${bem.element('close')} material-icons`}
          >
            close
          </button>
        ) : null}
      </header>
    );
  }
}

export default withBemClass('header')(Header);
