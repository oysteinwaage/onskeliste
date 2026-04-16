import React, { Component } from 'react';
import { push } from "connected-react-router";
import { connect } from 'react-redux';
import firebase from "firebase/compat/app";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { loggInn, opprettNyBruker, resetPassord } from '../Api';
import { endreHeaderTekst, lasterData, toggleVisOpprettBruker } from '../actions/actions';
import { RootState } from '../types';
import { Dispatch } from 'redux';

const logo = process.env.PUBLIC_URL + '/logo.svg';

interface LoginState {
  username: string;
  password: string;
  name: string;
  firstName: string;
  lastName: string;
  nameMissing: boolean;
  firstNameMissing: boolean;
  lastNameMissing: boolean;
  resettPassordVisning: boolean;
}

const initState: LoginState = {
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

interface LoginProps {
  onLoggInn: (brukernavn: string, passord: string) => void;
  onRegistrerNyBruker: (email: string, passord: string, firstName: string, lastName: string) => void;
  onEndreHeaderTekst: (nyTekst: string) => void;
  onToggleVisOpprettBruker: () => void;
  onSendResettPassordMail: (mail: string) => void;
  onSendTilHovedside: () => void;
  onSettLasterData: (isLoading: boolean) => void;
  visOpprettNyBruker: boolean;
  infoResettMailSendt: string;
}

class Login extends Component<LoginProps, LoginState> {
  constructor(props: LoginProps) {
    super(props);
    this.state = initState;

    const { onSendTilHovedside } = this.props;
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        onSendTilHovedside();
      }
    });
  }

  innsendigKnappTrykket(): void {
    const { onSettLasterData, onSendResettPassordMail, visOpprettNyBruker, onRegistrerNyBruker, onLoggInn } = this.props;
    const { resettPassordVisning, username, firstName, lastName, password } = this.state;
    if (resettPassordVisning) {
      onSendResettPassordMail(username);
    } else if (visOpprettNyBruker) {
      let firstNameMissing = firstName === '';
      let lastNameMissing = lastName === '';
      if (firstNameMissing || lastNameMissing) {
        this.setState({ firstNameMissing: firstNameMissing, lastNameMissing: lastNameMissing });
      } else {
        onRegistrerNyBruker(username, password, firstName, lastName);
        this.setState(initState);
      }
    } else {
      onSettLasterData(true);
      onLoggInn(username, password);
    }
  }

  endreVisningTrykket(): void {
    if (this.state.resettPassordVisning) {
      this.setState({ resettPassordVisning: false });
    } else {
      const { visOpprettNyBruker, onToggleVisOpprettBruker, onEndreHeaderTekst } = this.props;
      const nyHeaderTekst = visOpprettNyBruker ? 'Innlogging' : 'Opprett ny bruker';
      onEndreHeaderTekst(nyHeaderTekst);
      onToggleVisOpprettBruker();
    }
  }

  glemtPassorTrykket(): void {
    const { onEndreHeaderTekst } = this.props;
    onEndreHeaderTekst("Resett passord");
    this.setState({ resettPassordVisning: true });
  }

  render() {
    const { visOpprettNyBruker, infoResettMailSendt } = this.props;
    const resettPassordVisning = this.state.resettPassordVisning;
    const innsendingKnappTekst = resettPassordVisning ? 'Resett passord' : visOpprettNyBruker ? 'Registrer bruker' : 'Logg inn';
    const endreVisningKnappTekst = resettPassordVisning || visOpprettNyBruker ? 'Tilbake til login' : 'Opprett ny bruker';
    return (
      <div className="login-page">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
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
              <br />
              <TextField
                id="lastNameField"
                className="inputTextField"
                margin="normal"
                label="Fyll inn etternavn"
                required
                error={this.state.lastNameMissing}
                onChange={(event) => this.setState({ lastName: event.target.value, lastNameMissing: false })}
              />
            </div>)
          }

          <TextField
            id="emailFelt"
            className="inputTextField"
            margin="normal"
            label="Fyll inn email-adresse"
            onChange={(event) => this.setState({ username: event.target.value })}
          />
          <br />
          {resettPassordVisning && infoResettMailSendt &&
            <p>{infoResettMailSendt}</p>
          }
          {!resettPassordVisning &&
            <TextField
              id="passordFelt"
              className="inputTextField"
              type="password"
              label="Fyll inn passord"
              onChange={(event) => this.setState({ password: event.target.value })}
            />
          }
          <br />
          <Button variant="contained" color="primary" onClick={() => this.innsendigKnappTrykket()}
            style={style}>
            {innsendingKnappTekst}
          </Button>
        </div>
        <Button variant="outlined" onClick={() => this.endreVisningTrykket()}>
          {endreVisningKnappTekst}
        </Button>
        <br />
        <br />
        {!resettPassordVisning && !visOpprettNyBruker &&
          <button className="glemt-passord-lenke" onClick={() => this.glemtPassorTrykket()}>
            Glemt passord?
          </button>
        }
      </div>
    );
  }
}

const style = {
  margin: 15,
};

const mapStateToProps = (state: RootState) => ({
  visOpprettNyBruker: state.config.visOpprettNyBruker,
  infoResettMailSendt: state.config.infoResettMailSendt,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onLoggInn: (brukernavn: string, passord: string) => dispatch(loggInn(brukernavn, passord) as any),
  onRegistrerNyBruker: (email: string, passord: string, firstName: string, lastName: string) => dispatch(opprettNyBruker(email, passord, firstName, lastName) as any),
  onEndreHeaderTekst: (nyTekst: string) => dispatch(endreHeaderTekst(nyTekst)),
  onToggleVisOpprettBruker: () => dispatch(toggleVisOpprettBruker()),
  onSendResettPassordMail: (mail: string) => dispatch(resetPassord(mail) as any),
  onSendTilHovedside: () => dispatch(push('/minliste')),
  onSettLasterData: (isLoading: boolean) => dispatch(lasterData(isLoading)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
