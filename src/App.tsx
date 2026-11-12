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
import GlobalErrorHandler from './components/GlobalErrorHandler';

import { brukerLoggetInn, lasterData } from "./actions/actions";
import { fetchAdminConfig, fetchAdminsForMyList, fetchListsIAmAllowedToAdminister, fetchListsIAmAllowedToView, fetchMineEkstraLister, fetchUsers, fetchViewersToMyList, fetdhMinOnskeliste, subscribeToIncomingAccessRequests, subscribeToOutgoingAccessRequests } from "./Api";
import ChangesSinceLastLogin from "./utils/ChangesSinceLastLogin";
import AccessRequestNotification from "./utils/AccessRequestNotification";
import { RootState } from './types';
import { Dispatch } from 'redux';
import { TooltipProvider } from './components/ui/tooltip';

interface AppProps {
  onSendTilLogin: () => void;
  onAbonnerPaaMinOnskeliste: () => void;
  onSubscribeToMyAllowedViewers: () => void;
  onSubscribeToIncomingAccessRequests: () => void;
  onSubscribeToOutgoingAccessRequests: () => void;
  onBrukerLoggetInn: (user: any) => void;
  onFetchListsICanView: () => void;
  onFetchAllUsers: () => void;
  onSettLasterData: (isLoading: boolean) => void;
  onFetchAdminConfig: () => void;
  onFetchMineEkstraLister: () => void;
  onFetchAdminsForMyList: () => void;
  onFetchListsICanAdminister: () => void;
  isLoading: boolean;
}

class App extends Component<AppProps> {

  componentDidMount() {
    const { onSendTilLogin, onBrukerLoggetInn, onAbonnerPaaMinOnskeliste, onSubscribeToMyAllowedViewers,
      onSubscribeToIncomingAccessRequests, onSubscribeToOutgoingAccessRequests,
      onFetchListsICanView, onFetchAllUsers, onSettLasterData, onFetchAdminConfig, onFetchMineEkstraLister,
      onFetchAdminsForMyList, onFetchListsICanAdminister } = this.props;
    onSettLasterData(true);
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        onBrukerLoggetInn(user);
        onFetchAdminConfig();
        onFetchAllUsers();
        onAbonnerPaaMinOnskeliste();
        onSubscribeToMyAllowedViewers();
        onSubscribeToIncomingAccessRequests();
        onSubscribeToOutgoingAccessRequests();
        onFetchListsICanView();
        onFetchMineEkstraLister();
        onFetchAdminsForMyList();
        onFetchListsICanAdminister();
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
        <GlobalErrorHandler>
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
            {!isLoading && <AccessRequestNotification />}
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
        </GlobalErrorHandler>
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
  onSubscribeToIncomingAccessRequests: () => dispatch(subscribeToIncomingAccessRequests() as any),
  onSubscribeToOutgoingAccessRequests: () => dispatch(subscribeToOutgoingAccessRequests() as any),
  onBrukerLoggetInn: (user: any) => dispatch(brukerLoggetInn(user)),
  onFetchListsICanView: () => dispatch(fetchListsIAmAllowedToView() as any),
  onFetchAllUsers: () => dispatch(fetchUsers() as any),
  onSendTilLogin: () => dispatch(push('/')),
  onSettLasterData: (isLoading: boolean) => dispatch(lasterData(isLoading)),
  onFetchAdminConfig: () => dispatch(fetchAdminConfig() as any),
  onFetchMineEkstraLister: () => dispatch(fetchMineEkstraLister() as any),
  onFetchAdminsForMyList: () => dispatch(fetchAdminsForMyList() as any),
  onFetchListsICanAdminister: () => dispatch(fetchListsIAmAllowedToAdminister() as any),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
