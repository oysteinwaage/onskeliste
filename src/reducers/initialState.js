const initialState = {
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
  },
  vennersLister: {
    allowedListsForMe: [],
    valgtVennsListe: [],
    valgtVenn: {},
  }
};

export default initialState;
