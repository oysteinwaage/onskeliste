import React, {Component} from 'react';
import {connect} from "react-redux";
import {push} from 'connected-react-router';
import PropTypes from 'prop-types';
import {Route, Switch} from 'react-router';
import firebase from "firebase/app";
import Login from './login/Login';
import MinListe from './minliste/MinListe';
import Vennelister from './vennelister/VenneLister';
import Profil from './profil/Profil';
import AppBar from './components/AppBarComponent';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';

import {brukerLoggetInn, lasterData} from "./actions/actions";
import {fetchListsIAmAllowedToView, fetchUsers, fetchViewersToMyList, fetdhMinOnskeliste} from "./Api";
import ChangesSinceLastLogin from "./utils/ChangesSinceLastLogin";

class App extends Component {

    componentDidMount() {
        const {onSendTilLogin, onBrukerLoggetInn, onAbonnerPaaMinOnskeliste, onSubscribeToMyAllowedViewers,
            onFetchListsICanView, onFetchAllUsers, onSettLasterData} = this.props;
        onSettLasterData(true);
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
        const {isLoading} = this.props;
        return (
            <div className="App">
                <Backdrop className="backDrop" open={isLoading}>
                    <CircularProgress color="secondary" />
                </Backdrop>
                {!isLoading && <ChangesSinceLastLogin />}
                <AppBar/>
                <div className="content">
                    <Switch>
                        <Route exact path="/" component={Login}/>
                        <Route path="/minliste" component={MinListe}/>
                        <Route path="/vennelister" component={Vennelister}/>
                        <Route path="/profil" component={Profil}/>
                    </Switch>
                </div>
            </div>
        );
    }
}

App.propTypes = {
    onSendTilLogin: PropTypes.func,
    onAbonnerPaaMinOnskeliste: PropTypes.func,
    onSubscribeToMyAllowedViewers: PropTypes.func,
    onBrukerLoggetInn: PropTypes.func,
    onFetchListsICanView: PropTypes.func,
    onFetchAllUsers: PropTypes.func,
    onSettLasterData: PropTypes.func,
    isLoading: PropTypes.bool
};

const mapStateToProps = state => ({
   isLoading: state.config.isLoading,
});

const mapDispatchToProps = dispatch => ({
    onAbonnerPaaMinOnskeliste: () => dispatch(fetdhMinOnskeliste()),
    onSubscribeToMyAllowedViewers: () => dispatch(fetchViewersToMyList()),
    onBrukerLoggetInn: (user) => dispatch(brukerLoggetInn(user)),
    onFetchListsICanView: () => dispatch(fetchListsIAmAllowedToView()),
    onFetchAllUsers: () => dispatch(fetchUsers()),
    onSendTilLogin: () => dispatch(push('/')),
    onSettLasterData: (isLoading) => dispatch(lasterData(isLoading))
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
