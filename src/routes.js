import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Home from './screens/Home';
import CreatePoint from './screens/CreatePoint';

const Routes = () => (
  <Switch>
    <Route exact path="/" component={ Home } />
    <Route exact path="/create-point" component={ CreatePoint } />
  </Switch>
);

export default Routes;