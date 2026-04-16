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
    mineKjoep: {}
  },
  brukere: {},
  config: {
    headerTekst: 'Innlogging',
    visOpprettNyBruker: false,
    brukere: [],
    infoResettMailSendt: '',
    isLoading: false,
    slettKjopteOnskerEnabled: false,
  },
  vennersLister: {
    allowedListsForMe: [],
    valgtVennsListe: [],
    valgtVenn: {},
  }
};

export default initialState;
