import React, { Component } from 'react';
import { connect } from "react-redux";
import { push } from 'connected-react-router';
import { Route, Switch } from 'react-router';
import firebase from "firebase/compat/app";
import Login from './login/Login';
import MinListe from './minliste/MinListe';
import Vennelister from './vennelister/VenneLister';
import Profil from './profil/Profil';
import Admin from './admin/Admin';
import AppBar from './components/AppBarComponent';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { brukerLoggetInn, lasterData } from "./actions/actions";
import { fetchAdminConfig, fetchListsIAmAllowedToView, fetchUsers, fetchViewersToMyList, fetdhMinOnskeliste } from "./Api";
import ChangesSinceLastLogin from "./utils/ChangesSinceLastLogin";
import { RootState } from './types';
import { Dispatch } from 'redux';

interface AppProps {
  onSendTilLogin: () => void;
  onAbonnerPaaMinOnskeliste: () => void;
  onSubscribeToMyAllowedViewers: () => void;
  onBrukerLoggetInn: (user: any) => void;
  onFetchListsICanView: () => void;
  onFetchAllUsers: () => void;
  onSettLasterData: (isLoading: boolean) => void;
  onFetchAdminConfig: () => void;
  isLoading: boolean;
}

class App extends Component<AppProps> {

  componentDidMount() {
    const { onSendTilLogin, onBrukerLoggetInn, onAbonnerPaaMinOnskeliste, onSubscribeToMyAllowedViewers,
      onFetchListsICanView, onFetchAllUsers, onSettLasterData, onFetchAdminConfig } = this.props;
    onSettLasterData(true);
    onFetchAdminConfig();
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        onBrukerLoggetInn(user);
        onFetchAllUsers();
        onAbonnerPaaMinOnskeliste();
        onSubscribeToMyAllowedViewers();
        onFetchListsICanView();
      } else {
        if (window.location.pathname === "/") {
          onSettLasterData(false);
        }
        onSendTilLogin();
      }
    });
  }


  render() {
    const { isLoading } = this.props;
    return (
      <div className="App">
        <Backdrop className="backDrop" open={isLoading}>
          <CircularProgress color="secondary" />
        </Backdrop>
        {!isLoading && <ChangesSinceLastLogin />}
        <AppBar />
        <div className="content">
          <Switch>
            <Route exact path="/" component={Login} />
            <Route path="/minliste" component={MinListe} />
            <Route path="/vennelister" component={Vennelister} />
            <Route path="/profil" component={Profil} />
            <Route path="/admin" component={Admin} />
          </Switch>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  isLoading: state.config.isLoading,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onAbonnerPaaMinOnskeliste: () => dispatch(fetdhMinOnskeliste() as any),
  onSubscribeToMyAllowedViewers: () => dispatch(fetchViewersToMyList() as any),
  onBrukerLoggetInn: (user: any) => dispatch(brukerLoggetInn(user)),
  onFetchListsICanView: () => dispatch(fetchListsIAmAllowedToView() as any),
  onFetchAllUsers: () => dispatch(fetchUsers() as any),
  onSendTilLogin: () => dispatch(push('/')),
  onSettLasterData: (isLoading: boolean) => dispatch(lasterData(isLoading)),
  onFetchAdminConfig: () => dispatch(fetchAdminConfig() as any),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
