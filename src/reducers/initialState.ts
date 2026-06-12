import { InnloggetBrukerState, ConfigState, VennersListerState } from '../types';

interface InitialState {
  innloggetBruker: InnloggetBrukerState;
  brukere: Record<string, never>;
  config: ConfigState;
  vennersLister: VennersListerState;
}

const initialState: InitialState = {
  innloggetBruker: {
    email: '',
    navn: '',
    mineOnsker: [],
    openLenkeDialog: false,
    openLenkeDialogOnske: {},
    allowedViewers: [],
    lastSeenVersion: 0,
    userDbKey: '',
    measurements: {},
    mineKjoep: {},
    mineEkstraKjoep: {},
    mineEkstraListeKjoep: {},
    mineEkstraLister: [],
    aktiveListeId: null,
    alleEkstraListeOnsker: {},
    opprettListeDialogOpen: false,
    alleFeedback: [],
    ulesteFeedback: 0,
  },
  brukere: {},
  config: {
    headerTekst: 'Innlogging',
    visOpprettNyBruker: false,
    brukere: [],
    infoResettMailSendt: '',
    isLoading: false,
    slettKjopteOnskerEnabled: false,
    tilbakemeldingEnabled: false,
    passordReparasjon: null,
  },
  vennersLister: {
    allowedListsForMe: [],
    valgtVennsListe: [],
    valgtVenn: {},
    valgtVennsEkstraLister: [],
    valgtVennsAktivListeId: null,
    valgtVennsAlleEkstraListeOnsker: {},
  }
};

export default initialState;
