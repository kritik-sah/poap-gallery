import React from 'react';
import {BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import { ROUTES } from './routes'
import './scss/main.scss'
import Gallery from './pages/gallery'
import Activity from './pages/activity'
import Tokens from './pages/event'

import Header from './components/header'
import Footer from './components/footer'
import useIntercom from "@reclaim-ai/react-intercom-hook";
import {Toaster} from "react-hot-toast";


function App() {

  // eslint-disable-next-line
  const intercom = useIntercom({
    app_id: process.env.REACT_APP_INTERCOM_APP_ID || 'syysagea'
  })
  document.body.className = 'poap-app'

  return (
    <BrowserRouter>
    <Toaster position={'top-right'} toastOptions={{
      error: {
        style: {
          backgroundColor: '#ffb6b6'
        }
      }
    }} />
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
        <Route  path={ROUTES.home}>
          <Gallery />
        </Route>
      </Switch>
      <Footer />
    </div>
    </BrowserRouter>
  );
}


export default App;
