import React, { Component } from 'react';
import { connect } from "react-redux";
import { push } from 'connected-react-router';
import { Route, Switch } from 'react-router';
import firebase from "firebase/compat/app";
import { Loader2 } from 'lucide-react';
import Login from './login/Login';
import PassordReparasjonDialog from './login/PassordReparasjonDialog';
import MinListe from './minliste/MinListe';
import Vennelister from './vennelister/VenneLister';
import MineKjoep from './minekjoep/MineKjoep';
import Profil from './profil/Profil';
import Admin from './admin/Admin';
import Tilbakemelding from './tilbakemelding/Tilbakemelding';
import Onboarding from './onboarding/Onboarding';
import AppBar from './components/AppBarComponent';
import InstallBanner from './components/InstallBanner';

import { brukerLoggetInn, lasterData } from "./actions/actions";
import { fetchAdminConfig, fetchListsIAmAllowedToView, fetchMineEkstraLister, fetchUsers, fetchViewersToMyList, fetdhMinOnskeliste } from "./Api";
import ChangesSinceLastLogin from "./utils/ChangesSinceLastLogin";
import { RootState } from './types';
import { Dispatch } from 'redux';
import { TooltipProvider } from './components/ui/tooltip';

interface AppProps {
  onSendTilLogin: () => void;
  onAbonnerPaaMinOnskeliste: () => void;
  onSubscribeToMyAllowedViewers: () => void;
  onBrukerLoggetInn: (user: any) => void;
  onFetchListsICanView: () => void;
  onFetchAllUsers: () => void;
  onSettLasterData: (isLoading: boolean) => void;
  onFetchAdminConfig: () => void;
  onFetchMineEkstraLister: () => void;
  isLoading: boolean;
}

class App extends Component<AppProps> {

  componentDidMount() {
    const { onSendTilLogin, onBrukerLoggetInn, onAbonnerPaaMinOnskeliste, onSubscribeToMyAllowedViewers,
      onFetchListsICanView, onFetchAllUsers, onSettLasterData, onFetchAdminConfig, onFetchMineEkstraLister } = this.props;
    onSettLasterData(true);
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        onBrukerLoggetInn(user);
        onFetchAdminConfig();
        onFetchAllUsers();
        onAbonnerPaaMinOnskeliste();
        onSubscribeToMyAllowedViewers();
        onFetchListsICanView();
        onFetchMineEkstraLister();
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
      <TooltipProvider>
        <div className="App flex flex-col min-h-screen">
          {isLoading && (
            <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
                <p className="text-slate-600 text-sm font-medium">Laster...</p>
              </div>
            </div>
          )}
          {!isLoading && <ChangesSinceLastLogin />}
          <PassordReparasjonDialog />
          <AppBar />
          <InstallBanner />
          <div className="flex-1 bg-slate-50 pb-16">
            <Switch>
              <Route exact path="/" component={Login} />
              <Route path="/minliste" component={MinListe} />
              <Route path="/vennelister" component={Vennelister} />
              <Route path="/minekjoep" component={MineKjoep} />
              <Route path="/profil" component={Profil} />
              <Route path="/admin" component={Admin} />
              <Route path="/tilbakemelding" component={Tilbakemelding} />
              <Route path="/onboarding" component={Onboarding} />
            </Switch>
          </div>
        </div>
      </TooltipProvider>
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
  onFetchMineEkstraLister: () => dispatch(fetchMineEkstraLister() as any),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
