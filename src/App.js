import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import ReactGA from 'react-ga4';
import { ROUTES } from './routes';
import './scss/main.scss';
import Gallery from './pages/gallery';
import Activity from './pages/activity';
import Tokens from './pages/event';

import { Header } from './components/header';
import { Footer } from './components/footer';
import { Toaster } from 'react-hot-toast';
import { useAppMonitor } from './utilities/hooks/useAppMonitor';

function App() {
  const GA_MEASUREMENT_ID =
    process.env.REACT_APP_GA_MEASUREMENT_ID || 'G-W21W3VZBBN';

  if (process.env.NODE_ENV === 'production') {
    ReactGA.initialize(GA_MEASUREMENT_ID);
    ReactGA.send('pageview');
  }

  useAppMonitor();

  document.body.className = 'poap-app';

  return (
    <BrowserRouter>
      <Toaster
        position={'top-right'}
        toastOptions={{
          error: {
            style: {
              backgroundColor: '#ffb6b6',
            },
          },
        }}
      />
      <div className="landing">
        <Header />
        <Switch>
          <Redirect from={ROUTES.renderEvent} to={ROUTES.eventSlug} />
          <Route path={ROUTES.event}>
            <Tokens />
          </Route>
          <Route path={ROUTES.activity}>
            <Activity />
          </Route>
          <Route path={ROUTES.home}>
            <Gallery />
          </Route>
        </Switch>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
