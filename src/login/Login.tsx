import React, { Component } from 'react';
import { push } from "connected-react-router";
import { connect } from 'react-redux';
import firebase from "firebase/compat/app";
import { loggInn, opprettNyBruker, resetPassord } from '../Api';
import { endreHeaderTekst, lasterData, toggleVisOpprettBruker } from '../actions/actions';
import { RootState } from '../types';
import { Dispatch } from 'redux';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

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
      <div className="min-h-full flex flex-col items-center justify-center py-12 px-4">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="bg-slate-900 rounded-2xl py-6 flex justify-center mb-8 shadow-lg">
            <img src={logo} className="App-logo h-16" alt="logo" />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">
            {visOpprettNyBruker && !resettPassordVisning && (
              <>
                <Input
                  id="firstNameField"
                  label="Fornavn *"
                  placeholder="Ola"
                  error={this.state.firstNameMissing}
                  helperText={this.state.firstNameMissing ? 'Fornavn er påkrevd' : undefined}
                  onChange={(event) => this.setState({ firstName: event.target.value, firstNameMissing: false })}
                />
                <Input
                  id="lastNameField"
                  label="Etternavn *"
                  placeholder="Nordmann"
                  error={this.state.lastNameMissing}
                  helperText={this.state.lastNameMissing ? 'Etternavn er påkrevd' : undefined}
                  onChange={(event) => this.setState({ lastName: event.target.value, lastNameMissing: false })}
                />
              </>
            )}

            <Input
              id="emailFelt"
              type="email"
              label="E-postadresse"
              placeholder="navn@eksempel.no"
              onChange={(event) => this.setState({ username: event.target.value })}
            />

            {resettPassordVisning && infoResettMailSendt && (
              <p className="text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                {infoResettMailSendt}
              </p>
            )}

            {!resettPassordVisning && (
              <Input
                id="passordFelt"
                type="password"
                label="Passord"
                placeholder="••••••••"
                onChange={(event) => this.setState({ password: event.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') this.innsendigKnappTrykket(); }}
              />
            )}

            <Button
              className="w-full mt-2"
              onClick={() => this.innsendigKnappTrykket()}
            >
              {innsendingKnappTekst}
            </Button>
          </div>

          <div className="mt-4 flex flex-col items-center gap-2">
            <Button
              variant="ghost"
              className="text-slate-600"
              onClick={() => this.endreVisningTrykket()}
            >
              {endreVisningKnappTekst}
            </Button>

            {!resettPassordVisning && !visOpprettNyBruker && (
              <button
                className="text-sm text-primary-600 hover:text-primary-700 underline underline-offset-2 transition-colors"
                onClick={() => this.glemtPassorTrykket()}
              >
                Glemt passord?
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
}

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
