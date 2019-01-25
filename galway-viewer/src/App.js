/**
 * @flow
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Timeline } from '@canvas-panel/timeline';
import { SearchBox, RangeSlider } from '@canvas-panel/search';
import StartScreen from './components/StartScreen/StartScreen';
import Header from './components/Header/Header';
import './components/main.scss';
import Viewer from './components/Viewer/Viewer';
import Layout from './components/Layout/Layout';
import { manifestRequest } from '@canvas-panel/redux/es/spaces/manifest';
import Drawer from './components/Drawer/Drawer';
import NavigationControls from './components/NavigationControls/NavigationControls';
import Supplemental from './components/Supplemental/Supplemental';

type Props = {
  manifest: string,
  dispatch: any => void,
  onClose?: any => void,
  getRef?: any => any,
  title: string,
  startScreenEnabled: boolean,
  drawerEnabled: boolean,
};

type State = {
  viewportAvailable: boolean,
};

class App extends Component<Props, State> {
  startScreen = null;
  drawer = null;
  viewport = null;

  state = { viewportAvailable: false };

  setViewport = viewport => {
    this.viewport = viewport;
    this.setState({ viewportAvailable: true });
  };

  openStartScreen = () => {
    if (this.startScreen) {
      this.startScreen.openStartScreen();
    }
  };

  openMenu = () => {
    if (this.drawer) {
      this.drawer.openDrawer();
    }
  };

  componentWillMount() {
    this.props.dispatch(
      manifestRequest(this.props.manifest, 'en-GB', { startCanvas: 2 })
    );
  }

  render() {
    const { onClose, title, startScreenEnabled, drawerEnabled } = this.props;

    return (
      <Layout>
        <Layout.Modal>
          <Supplemental />
          {startScreenEnabled ? (
            <StartScreen
              ref={startScreen =>
                (this.startScreen = startScreen
                  ? startScreen.getWrappedInstance()
                  : null)
              }
            />
          ) : null}
          {drawerEnabled ? (
            <Drawer
              ref={drawer =>
                (this.drawer = drawer
                  ? drawer.getWrappedInstance().getWrappedInstance()
                  : null)
              }
            />
          ) : null}
        </Layout.Modal>
        <Layout.Header>
          <Header
            title={title}
            onClickInfo={startScreenEnabled ? this.openStartScreen : null}
            onClickMenu={drawerEnabled ? this.openMenu : null}
            onClickClose={onClose}
          />
          <Timeline />
        </Layout.Header>
        <Layout.Main>
          <Viewer setViewport={this.setViewport} />
        </Layout.Main>
        <Layout.Footer>
          <SearchBox key="search" />
          <RangeSlider key="range" />
          <NavigationControls key="nav" />
        </Layout.Footer>
      </Layout>
    );
  }
}

export default connect()(App);
