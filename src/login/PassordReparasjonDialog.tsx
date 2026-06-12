import React, { useState } from 'react';
import { connect } from 'react-redux';
import firebase from 'firebase/compat/app';
import { settPassordReparasjon } from '../actions/actions';
import { oppdaterHarPassord } from '../Api';
import { RootState, PassordReparasjonInfo } from '../types';
import { Dispatch } from 'redux';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

interface Props {
  info: PassordReparasjonInfo | null;
  onLukk: () => void;
}

// Vises etter innlogging med Google/Microsoft når Firebase har koblet passord-innloggingen
// fra kontoen (skjer når e-posten ikke var verifisert). Lar brukeren sette passordet på nytt
// slik at begge innloggingsmetoder fungerer.
const PassordReparasjonDialog = ({ info, onLukk }: Props) => {
  const [passord, setPassord] = useState('');
  const [feil, setFeil] = useState('');
  const [lagrer, setLagrer] = useState(false);

  if (!info) return null;

  const behold = async () => {
    const user = firebase.auth().currentUser;
    if (!user || !user.email) {
      onLukk();
      return;
    }
    setLagrer(true);
    try {
      const emailCredential = firebase.auth.EmailAuthProvider.credential(user.email, passord);
      await user.linkWithCredential(emailCredential);
      await oppdaterHarPassord(user.uid, true).catch(() => {});
      onLukk();
    } catch (error: any) {
      if (error.code === 'auth/provider-already-linked') {
        onLukk();
      } else if (error.code === 'auth/weak-password') {
        setFeil('Passordet må være på minst 6 tegn.');
        setLagrer(false);
      } else {
        setFeil('Noe gikk feil. Prøv igjen.');
        setLagrer(false);
      }
    }
  };

  const hoppOver = async () => {
    const uid = firebase.auth().currentUser?.uid;
    if (uid) {
      await oppdaterHarPassord(uid, false).catch(() => {});
    }
    onLukk();
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 flex flex-col gap-4 w-full max-w-sm">
        <div className="text-sm text-slate-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-3">
          <p className="font-medium text-amber-800 mb-1">Vil du også kunne logge inn med passord?</p>
          {info.kjentPassordBruker ? (
            <p>Da du logget inn med {info.providerNavn} ble passord-innloggingen koblet fra kontoen din. Skriv inn passordet ditt (gjerne det samme som før) for å fortsatt kunne logge inn med e-post og passord.</p>
          ) : (
            <p>Hvis du tidligere har logget inn med e-post og passord, kan du sette passordet på nytt her slik at begge innloggingsmetoder fungerer. Bruker du kun {info.providerNavn}, kan du trygt hoppe over dette.</p>
          )}
        </div>
        <Input
          id="reparasjonPassordFelt"
          type="password"
          label="Passord"
          placeholder="••••••••"
          onChange={(e) => { setPassord(e.target.value); setFeil(''); }}
          onKeyDown={(e) => { if (e.key === 'Enter') behold(); }}
        />
        {feil && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{feil}</p>
        )}
        <Button className="w-full mt-2" onClick={behold} disabled={lagrer}>
          {lagrer ? 'Lagrer...' : 'Behold passord-innlogging'}
        </Button>
        <Button variant="ghost" className="w-full text-slate-600" onClick={hoppOver} disabled={lagrer}>
          {`Hopp over, jeg vil kun bruke ${info.providerNavn}`}
        </Button>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  info: state.config.passordReparasjon,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onLukk: () => dispatch(settPassordReparasjon(null)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PassordReparasjonDialog);
