import React, {Component} from 'react';
import PropTypes from "prop-types";
import {push} from "connected-react-router";
import connect from 'react-redux/es/connect/connect';
import firebase from "firebase";
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button';
import logo from '../img/logo.svg';
import {loggInn, opprettNyBruker, resetPassord} from '../Api';
import {endreHeaderTekst, lasterData, toggleVisOpprettBruker} from '../actions/actions';

const initState = {
    username: '',
    password: '',
    name: '',
    firstName: '',
    lastName: '',
    nameMissing: false,
    firstNameMissing: false,
    lastNameMissing: false,
    resettPassordVisning: false,
};

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = initState;

        const {onSendTilHovedside} = this.props;
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                onSendTilHovedside();
            }
        });
    }

    innsendigKnappTrykket() {
        const {onSettLasterData, onSendResettPassordMail, visOpprettNyBruker, onRegistrerNyBruker, onLoggInn} = this.props;
        const {resettPassordVisning, username, firstName, lastName, password} = this.state;
        if (resettPassordVisning) {
            onSendResettPassordMail(username);
        } else if (visOpprettNyBruker) {
            let firstNameMissing = firstName === '';
            let lastNameMissing = lastName === '';
            if (firstNameMissing || lastNameMissing) {
                this.setState({firstNameMissing: firstNameMissing, lastNameMissing: lastNameMissing})
            } else {
                const suksess = onRegistrerNyBruker(username, password, firstName, lastName);
                if (suksess) this.setState(initState);
            }
        } else {
            onSettLasterData(true);
            onLoggInn(username, password);
        }
    }

    endreVisningTrykket() {
        if (this.state.resettPassordVisning) {
            this.setState({resettPassordVisning: false});
        } else {
            const {visOpprettNyBruker, onToggleVisOpprettBruker, onEndreHeaderTekst} = this.props;
            const nyHeaderTekst = visOpprettNyBruker ? 'Innlogging' : 'Opprett ny bruker';
            onEndreHeaderTekst(nyHeaderTekst);
            onToggleVisOpprettBruker();
        }
    }

    glemtPassorTrykket() {
        const {onEndreHeaderTekst} = this.props;
        onEndreHeaderTekst("Resett passord");
        this.setState({resettPassordVisning: true});
    }

    render() {
        const {visOpprettNyBruker, infoResettMailSendt} = this.props;
        const resettPassordVisning = this.state.resettPassordVisning;
        const innsendingKnappTekst = resettPassordVisning ? 'Resett passord' : visOpprettNyBruker ? 'Registrer bruker' : 'Logg inn';
        const endreVisningKnappTekst = resettPassordVisning || visOpprettNyBruker ? 'Tilbake til login' : 'Opprett ny bruker';
        return (
            <div className="login-page">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo"/>
                </header>
                <div>
                    {visOpprettNyBruker && !resettPassordVisning &&
                    (<div>
                        <TextField
                            id="firstNameField"
                            className="inputTextField"
                            margin="normal"
                            label="Fyll inn fornavn"
                            required
                            error={this.state.firstNameMissing}
                            onChange={(event) => this.setState({
                                firstName: event.target.value,
                                firstNameMissing: false
                            })}
                        />
                        <br/>
                        <TextField
                            id="lastNameField"
                            className="inputTextField"
                            margin="normal"
                            label="Fyll inn etternavn"
                            required
                            error={this.state.lastNameMissing}
                            onChange={(event) => this.setState({lastName: event.target.value, lastNameMissing: false})}
                        />
                    </div>)
                    }

                    <TextField
                        id="emailFelt"
                        className="inputTextField"
                        margin="normal"
                        label="Fyll inn email-adresse"
                        onChange={(event) => this.setState({username: event.target.value})}
                    />
                    <br/>
                    {resettPassordVisning && infoResettMailSendt &&
                    <p>{infoResettMailSendt}</p>
                    }
                    {!resettPassordVisning &&
                    <TextField
                        id="passordFelt"
                        className="inputTextField"
                        type="password"
                        label="Fyll inn passord"
                        onChange={(event) => this.setState({password: event.target.value})}
                    />
                    }
                    <br/>
                    <Button variant="contained" color="primary" onClick={() => this.innsendigKnappTrykket()}
                            style={style}>
                        {innsendingKnappTekst}
                    </Button>
                </div>
                <Button variant="outlined" onClick={() => this.endreVisningTrykket()}>
                    {endreVisningKnappTekst}
                </Button>
                <br/>
                <br/>
                {!resettPassordVisning && !visOpprettNyBruker &&
                <a className="glemt-passord-lenke" onClick={() => this.glemtPassorTrykket()}>
                    Glemt passord?
                </a>
                }
            </div>
        );
    }
}

const style = {
    margin: 15,
};


Login.propTypes = {
    onLoggInn: PropTypes.func,
    onRegistrerNyBruker: PropTypes.func,
    onEndreHeaderTekst: PropTypes.func,
    onToggleVisOpprettBruker: PropTypes.func,
    onSendResettPassordMail: PropTypes.func,
    onSendTilHovedside: PropTypes.func,
    onSettLasterData: PropTypes.func,
    visOpprettNyBruker: PropTypes.bool,
    infoResettMailSendt: PropTypes.string
};

const mapStateToProps = state => ({
    visOpprettNyBruker: state.config.visOpprettNyBruker,
    infoResettMailSendt: state.config.infoResettMailSendt,
});

const mapDispatchToProps = dispatch => ({
    onLoggInn: (brukernavn, passord) => dispatch(loggInn(brukernavn, passord)),
    onRegistrerNyBruker: (email, passord, firstName, lastName) => dispatch(opprettNyBruker(email, passord, firstName, lastName)),
    onEndreHeaderTekst: (nyTekst) => dispatch(endreHeaderTekst(nyTekst)),
    onToggleVisOpprettBruker: () => dispatch(toggleVisOpprettBruker()),
    onSendResettPassordMail: (mail) => dispatch(resetPassord(mail)),
    onSendTilHovedside: () => dispatch(push('/minliste')),
    onSettLasterData: (isLoading) => dispatch(lasterData(isLoading))
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
