import React, { Component } from 'react';
import { connect } from 'react-redux';
import { updateLastSeenVersion } from '../Api';
import { RootState } from '../types';
import { Dispatch } from 'redux';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogBody,
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';

interface ChangeEntry {
  version: number;
  releaseDate: string;
  changes: string[];
}

const changes: ChangeEntry[] = [
  {
    version: 2.0,
    releaseDate: "19.11.2020",
    changes: [
      "Single-sign-on: Forblir nå pålogget til man eksplisitt logger ut slik at man ikke trenger å logge inn på nytt hver gang",
      "Antall: Kan nå legge til antall på et ønske",
      "Vennevelger: Oppdatert velgeren av hvem som kan se din liste til å bli enklere og finere"
    ]
  },
  {
    version: 2.1,
    releaseDate: "21.11.2020",
    changes: ["Spinner: Viser nå spinner mens data laster eller man venter på sjekken om man er logget inn fra før"]
  },
  {
    version: 2.2,
    releaseDate: "22.11.2020",
    changes: [
      "Endringer-liste: Denne listen du ser nå med endringer siden sist innlogging",
      "Favoritter: Mulig å stjerne-markere de ønskene du har mest lyst på. Disse vil også legges øverst i listen din for å videre fremheve dem"
    ]
  },
  {
    version: 2.3,
    releaseDate: "01.12.2020",
    changes: [
      "Wenche-bug: Hver gang Wenche tok et ønske ble det registrert som 'tatt av undefined', dette skal nå være fikset",
    ]
  },
  {
    version: 2.4,
    releaseDate: "19.11.2021",
    changes: [
      "Kan nå legge inn størrelse (på klær, sko osv) i eget felt på hvert enkelt ønske",
    ]
  },
  {
    version: 2.5,
    releaseDate: "19.11.2021",
    changes: [
      "Kan nå legge inn dine generelle størrelser (på klær, sko osv) inne på din egen Profil-side",
      "Har flyttet listen hvor man legger til de som kan se på ønskelisten din inn til Profil-siden"
    ]
  },
  {
    version: 2.6,
    releaseDate: "27.11.2021",
    changes: [
      "Mine kjøp: Her blir det listet opp alle ønsker du har krysset ut fra noen andres ønskelister"
    ]
  },
  {
    version: 3.0,
    releaseDate: "02.05.2025",
    changes: [
      "Mine kjøp: Har fått eget menyvalg og egen side. Kan nå registrere egne kjøp og se oversikt over utgifter",
      "Prisjakt-søk: Når du legger til et nytt ønske kan du nå søke direkte etter produkter fra prisjakt.no",
    ]
  },
  {
    version: 3.1,
    releaseDate: "09.05.2025",
    changes: [
      "Flere lister: Kan nå legge til flere ønskelister med angitt navn, disse kan også deles med andre brukere",
    ]
  },
  {
    version: 3.2,
    releaseDate: "14.05.2025",
    changes: [
      "Kan nå også legge til eget navn på sin default ønskeliste om man vil, gjøres inne på Profil siden",
    ]
  },
  {
    version: 4.0,
    releaseDate: "15.05.2025",
    changes: [
      "Nytt design: Appen har fått et friskt, moderne utseende! Alt fungerer som før, det bare ser bedre ut ✨🙌🏼",
    ]
  },
  {
    version: 4.1,
    releaseDate: "15.05.2025",
    changes: [
      "Manuell sortering: Man kan nå selv velge rekkefølgen på ønskene sine, drag-and-drop stil. Trykk og dra et ønske opp eller ned for å plassere det på riktig prioritering i din ønskeliste innenfor grupperingen sin (Stjernet eller ikke stjernet) 😎",
    ]
  },
  {
    version: 4.2,
    releaseDate: "15.05.2025",
    changes: [
      "Tilbakemelding: Det kan nå sendes inn endringsønsker, ønsker om ny funksjonalitet eller rapportere feil direkte i app'en. Se Tilbakemelding i sidemenyen 📬",
    ]
  }
];

export const currentVersion = Math.max(...changes.map(c => c.version));

interface ChangesSinceLastLoginProps {
  onUpdateLastSeenVersion: (currentVersion: number, dbKey: string) => void;
  lastSeenVersion: number;
  myUserDbKey: string;
}

class ChangesSinceLastLogin extends Component<ChangesSinceLastLoginProps> {

  handleClose = (): void => this.props.onUpdateLastSeenVersion(currentVersion, this.props.myUserDbKey);

  render() {
    const { lastSeenVersion } = this.props;
    const nyeEndringer = changes.filter(c => c.version > lastSeenVersion);
    const erApen = nyeEndringer.length > 0 && window.location.pathname !== '/' && window.location.pathname !== '/onboarding';

    return (
      <Dialog open={erApen} onOpenChange={(o) => { if (!o) this.handleClose(); }}>
        <DialogContent showClose={false} className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary-700">🎉 Endringer siden sist du logget inn!</DialogTitle>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-4">
            {nyeEndringer.map(change => (
              <div key={change.version}>
                <p className="text-xs font-bold text-primary-600 mb-1.5">
                  v.{change.version} – {change.releaseDate}
                </p>
                <ul className="flex flex-col gap-1">
                  {change.changes.map(text => {
                    const [tittel, ...rest] = text.split(':');
                    return (
                      <li key={tittel} className="text-sm text-slate-700 flex gap-1.5">
                        <span className="text-primary-400 shrink-0">•</span>
                        <span>
                          <span className="font-semibold italic text-slate-800">{tittel}:</span>
                          {rest.length > 0 && <span className="text-slate-600">{rest.join(':')}</span>}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </DialogBody>
          <DialogFooter>
            <Button onClick={this.handleClose}>Lukk</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  lastSeenVersion: state.innloggetBruker.lastSeenVersion,
  myUserDbKey: state.innloggetBruker.userDbKey
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onUpdateLastSeenVersion: (currentVersion: number, dbKey: string) => dispatch(updateLastSeenVersion(currentVersion, dbKey) as any),
});

export default connect(mapStateToProps, mapDispatchToProps)(ChangesSinceLastLogin);
