import React, { Component } from 'react';
import { push } from "connected-react-router";
import { connect } from 'react-redux';
import firebase from "firebase/compat/app";
import { loggInn, opprettNyBruker, resetPassord, oppdaterHarPassord } from '../Api';
import { usersRef } from '../config/firebase';
import { endreHeaderTekst, lasterData, settPassordReparasjon, toggleVisOpprettBruker } from '../actions/actions';
import { RootState, PassordReparasjonInfo } from '../types';
import { Dispatch } from 'redux';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const MicrosoftIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
    <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
    <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
    <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
  </svg>
);

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
  socialLoading: boolean;
  linkingModus: boolean;
  linkingEmail: string;
  linkingPassord: string;
  pendingCredential: any;
  pendingProviderNavn: string;
  socialFeil: string;
  reverseLinkingModus: boolean;
  reverseLinkingProviders: string[];
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
  socialLoading: false,
  linkingModus: false,
  linkingEmail: '',
  linkingPassord: '',
  pendingCredential: null,
  pendingProviderNavn: '',
  socialFeil: '',
  reverseLinkingModus: false,
  reverseLinkingProviders: [],
};

interface LoginProps {
  onLoggInn: (brukernavn: string, passord: string) => void;
  onRegistrerNyBruker: (email: string, passord: string, firstName: string, lastName: string) => void;
  onEndreHeaderTekst: (nyTekst: string) => void;
  onToggleVisOpprettBruker: () => void;
  onSendResettPassordMail: (mail: string) => void;
  onSendTilHovedside: () => void;
  onSettLasterData: (isLoading: boolean) => void;
  onVisPassordReparasjon: (info: PassordReparasjonInfo) => void;
  visOpprettNyBruker: boolean;
  infoResettMailSendt: string;
}

class Login extends Component<LoginProps, LoginState> {
  // Settes mens en sosial innloggingsflyt pågår, slik at onAuthStateChanged
  // ikke navigerer bort før vi har sjekket om kontoen trenger reparasjon.
  private socialFlytPaagaar = false;

  constructor(props: LoginProps) {
    super(props);
    this.state = initState;

    const { onSendTilHovedside } = this.props;
    firebase.auth().onAuthStateChanged((user) => {
      if (user && !this.socialFlytPaagaar) {
        onSendTilHovedside();
      }
    });
  }

  async innsendigKnappTrykket(): Promise<void> {
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
        const methods = await firebase.auth().fetchSignInMethodsForEmail(username);
        const oauthMethods = methods.filter(m => m !== 'password');
        if (oauthMethods.length > 0) {
          this.setState({ reverseLinkingModus: true, reverseLinkingProviders: oauthMethods });
          return;
        }
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

  async loggInnMedSosialLeverandor(provider: firebase.auth.AuthProvider, leverandorNavn: string): Promise<void> {
    this.setState({ socialLoading: true, socialFeil: '' });
    this.socialFlytPaagaar = true;
    try {
      const result = await firebase.auth().signInWithPopup(provider);

      // Håndter tilfellet der leverandøren ikke kaster auth/account-exists-with-different-credential
      // (f.eks. Microsoft), men oppretter en ny tom konto for en e-post som allerede finnes.
      if (result.additionalUserInfo?.isNewUser && result.user?.email) {
        const email = result.user.email;
        const snapshot = await usersRef.orderByChild('email').equalTo(email).once('value');
        if (snapshot.exists()) {
          const credential = result.credential;
          await firebase.auth().signOut();
          this.socialFlytPaagaar = false;
          this.setState({
            linkingModus: true,
            linkingEmail: email,
            pendingCredential: credential,
            pendingProviderNavn: leverandorNavn,
            socialLoading: false,
          });
          return;
        }
      }

      // Firebase kobler fra passord-innloggingen når man logger inn med Google på en
      // konto med uverifisert e-post. Oppdag det og la brukeren sette passordet på nytt,
      // slik at begge innloggingsmetoder fortsetter å fungere. Dialogen rendres på
      // app-nivå slik at den overlever navigasjonen som skjer etter innlogging.
      const user = result.user;
      if (user && !user.providerData.some(p => p?.providerId === 'password')) {
        const snapshot = await usersRef.orderByChild('uid').equalTo(user.uid).once('value');
        const val = snapshot.val();
        const dbBruker = val ? (Object.values(val)[0] as any) : null;
        const kjentPassordBruker = dbBruker?.harPassord === true;
        // Brukere fra før harPassord-feltet fantes spørres én gang ("Hopp over" setter feltet).
        const ukjentPassordStatus = dbBruker != null && dbBruker.harPassord === undefined && !result.additionalUserInfo?.isNewUser;
        if (kjentPassordBruker || ukjentPassordStatus) {
          this.props.onVisPassordReparasjon({ providerNavn: leverandorNavn, kjentPassordBruker });
        }
      }

      this.socialFlytPaagaar = false;
      this.props.onSendTilHovedside();
    } catch (error: any) {
      this.socialFlytPaagaar = false;
      if (error.code === 'auth/account-exists-with-different-credential') {
        this.setState({
          linkingModus: true,
          linkingEmail: error.email || '',
          pendingCredential: error.credential,
          pendingProviderNavn: leverandorNavn,
          socialLoading: false,
        });
      } else if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        this.setState({ socialFeil: `Pålogging med ${leverandorNavn} feilet. Prøv igjen.`, socialLoading: false });
      } else {
        this.setState({ socialLoading: false });
      }
    }
  }

  async linkOgLoggInn(): Promise<void> {
    const { linkingEmail, linkingPassord, pendingCredential } = this.state;
    try {
      const userCredential = await firebase.auth().signInWithEmailAndPassword(linkingEmail, linkingPassord);
      await userCredential.user!.linkWithCredential(pendingCredential);
      oppdaterHarPassord(userCredential.user!.uid, true).catch(() => {});
      this.setState({ linkingModus: false, pendingCredential: null, pendingProviderNavn: '', socialFeil: '' });
    } catch (error: any) {
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        this.setState({ socialFeil: 'Feil passord. Prøv igjen.' });
      } else {
        this.setState({ socialFeil: 'Noe gikk feil. Prøv igjen.' });
      }
    }
  }

  avbrytLinking(): void {
    this.setState({ linkingModus: false, linkingEmail: '', linkingPassord: '', pendingCredential: null, pendingProviderNavn: '', socialFeil: '' });
  }

  async kobleTilMedOAuth(providerNavn: string): Promise<void> {
    const { username, password } = this.state;
    const provider = providerNavn === 'google.com'
      ? new firebase.auth.GoogleAuthProvider()
      : new firebase.auth.OAuthProvider('microsoft.com');
    this.setState({ socialLoading: true, socialFeil: '' });
    try {
      await firebase.auth().signInWithPopup(provider);
      const emailCredential = firebase.auth.EmailAuthProvider.credential(username, password);
      await firebase.auth().currentUser!.linkWithCredential(emailCredential);
      oppdaterHarPassord(firebase.auth().currentUser!.uid, true).catch(() => {});
      // onAuthStateChanged håndterer navigasjon
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        this.setState({ socialFeil: 'Noe gikk feil. Prøv igjen.', socialLoading: false });
      } else {
        this.setState({ socialLoading: false });
      }
    }
  }

  avbrytReverseLinking(): void {
    this.setState({ reverseLinkingModus: false, reverseLinkingProviders: [], socialFeil: '' });
  }

  render() {
    const { visOpprettNyBruker, infoResettMailSendt } = this.props;
    const { resettPassordVisning, linkingModus, linkingEmail, socialLoading, socialFeil, pendingProviderNavn, reverseLinkingModus, reverseLinkingProviders, username } = this.state;
    const providerVisningsnavn = (id: string) => id === 'google.com' ? 'Google' : 'Microsoft';
    const innsendingKnappTekst = resettPassordVisning ? 'Resett passord' : visOpprettNyBruker ? 'Registrer bruker' : 'Logg inn';
    const endreVisningKnappTekst = resettPassordVisning || visOpprettNyBruker ? 'Tilbake til login' : 'Opprett ny bruker';

    return (
      <div className="min-h-full flex flex-col items-center justify-center py-12 px-4">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="bg-slate-900 rounded-2xl py-6 flex justify-center mb-8 shadow-lg">
            <img src={logo} className="App-logo h-16" alt="logo" />
          </div>

          {reverseLinkingModus ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">
              <div className="text-sm text-slate-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-3">
                <p className="font-medium text-amber-800 mb-1">E-posten er allerede i bruk</p>
                <p><strong>{username}</strong> er allerede registrert med {reverseLinkingProviders.map(providerVisningsnavn).join(' og ')}. Logg inn med {reverseLinkingProviders.length > 1 ? 'en av leverandørene' : providerVisningsnavn(reverseLinkingProviders[0])} for å legge til passord-innlogging på kontoen.</p>
              </div>
              {socialFeil && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{socialFeil}</p>
              )}
              {reverseLinkingProviders.map(providerId => (
                <Button
                  key={providerId}
                  variant="outline"
                  className="w-full flex items-center gap-2 justify-center"
                  onClick={() => this.kobleTilMedOAuth(providerId)}
                  disabled={socialLoading}
                >
                  {providerId === 'google.com' ? <GoogleIcon /> : <MicrosoftIcon />}
                  {socialLoading ? 'Venter...' : `Logg inn med ${providerVisningsnavn(providerId)} og koble kontoer`}
                </Button>
              ))}
              <Button variant="ghost" className="w-full text-slate-600" onClick={() => this.avbrytReverseLinking()}>
                Avbryt
              </Button>
            </div>
          ) : linkingModus ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">
              <div className="text-sm text-slate-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-3">
                <p className="font-medium text-amber-800 mb-1">Konto finnes allerede</p>
                <p>En konto med <strong>{linkingEmail}</strong> er registrert med epost og passord. Skriv inn passordet ditt for å koble {pendingProviderNavn}-innlogging til kontoen.</p>
              </div>
              <Input
                id="linkingEmailFelt"
                type="email"
                label="E-postadresse"
                value={linkingEmail}
                disabled
              />
              <Input
                id="linkingPassordFelt"
                type="password"
                label="Passord"
                placeholder="••••••••"
                onChange={(e) => this.setState({ linkingPassord: e.target.value, socialFeil: '' })}
                onKeyDown={(e) => { if (e.key === 'Enter') this.linkOgLoggInn(); }}
              />
              {socialFeil && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{socialFeil}</p>
              )}
              <Button className="w-full mt-2" onClick={() => this.linkOgLoggInn()}>
                Koble kontoer og logg inn
              </Button>
              <Button variant="ghost" className="w-full text-slate-600" onClick={() => this.avbrytLinking()}>
                Avbryt
              </Button>
            </div>
          ) : (
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

              {!resettPassordVisning && !visOpprettNyBruker && (
                <>
                  <div className="relative flex items-center gap-3 my-1">
                    <div className="flex-1 border-t border-slate-200" />
                    <span className="text-xs text-slate-400 shrink-0">eller</span>
                    <div className="flex-1 border-t border-slate-200" />
                  </div>

                  {socialFeil && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{socialFeil}</p>
                  )}

                  <Button
                    variant="outline"
                    className="w-full flex items-center gap-2 justify-center"
                    onClick={() => this.loggInnMedSosialLeverandor(new firebase.auth.GoogleAuthProvider(), 'Google')}
                    disabled={socialLoading}
                  >
                    <GoogleIcon />
                    {socialLoading ? 'Venter...' : 'Fortsett med Google'}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full flex items-center gap-2 justify-center"
                    onClick={() => this.loggInnMedSosialLeverandor(new firebase.auth.OAuthProvider('microsoft.com'), 'Microsoft')}
                    disabled={socialLoading}
                  >
                    <MicrosoftIcon />
                    {socialLoading ? 'Venter...' : 'Fortsett med Microsoft'}
                  </Button>

                  <p className="text-xs text-slate-400 text-center leading-relaxed">
                    Hvis du tidligere har logget inn med brukernavn/passord med en epost fra Microsoft eller Google kan du bruke hurtiginnlogging og fortsette på eksisterende konto.
                  </p>
                </>
              )}
            </div>
          )}

          {!linkingModus && !reverseLinkingModus && (
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
          )}
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
  onVisPassordReparasjon: (info: PassordReparasjonInfo) => dispatch(settPassordReparasjon(info)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
