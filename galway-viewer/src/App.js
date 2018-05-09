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
  manifestUri: string,
  dispatch: any => void,
};

class App extends Component<Props> {
  startScreen = null;
  drawer = null;

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
      manifestRequest(this.props.manifestUri, 'en-GB', { startCanvas: 2 })
    );
  }

  render() {
    return (
      <Layout
        header={() => (
          <div>
            <Supplemental />
            <StartScreen
              ref={startScreen =>
                (this.startScreen = startScreen
                  ? startScreen.getWrappedInstance()
                  : null)
              }
            />
            <Header
              onClickInfo={this.openStartScreen}
              onClickMenu={this.openMenu}
            />
            <Timeline />
            <Drawer
              ref={drawer =>
                (this.drawer = drawer
                  ? drawer.getWrappedInstance().getWrappedInstance()
                  : null)
              }
            />
          </div>
        )}
        content={() => <Viewer />}
        footer={() => [
          <SearchBox key="search" />,
          <RangeSlider key="range" />,
          <NavigationControls key="nav" />,
        ]}
      />
    );
  }
}

export default connect()(App);
