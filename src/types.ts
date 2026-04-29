// Domain types

export interface KjoptAv {
  kjoptAv: string;
  kjoptAvNavn: string;
  antallKjopt: number;
}

export interface Onske {
  key: string;
  onskeTekst: string;
  url?: string;
  urls?: string[];
  antall?: number;
  onskeSize?: string;
  favoritt?: boolean;
  kjoptAvListe?: KjoptAv[];
  pris?: number;
}

export interface Bruker {
  key: string;
  uid: string;
  navn: string;
  firstName?: string;
  lastName?: string;
  email: string;
  measurements?: Record<string, string>;
  invisible?: boolean;
  erAdmin?: boolean;
  lastSeenVersion?: number;
}

export interface Viewer {
  value: string;
  label: string;
}

// Redux state types

export interface InnloggetBrukerState {
  email: string;
  navn: string;
  uid?: string;
  mineOnsker: Onske[];
  openLenkeDialog: boolean;
  openLenkeDialogOnske: Partial<Onske>;
  allowedViewers: Viewer[];
  lastSeenVersion: number;
  userDbKey: string;
  measurements: Record<string, string>;
  mineKjoep: Record<string, Onske[]>;
  mineEkstraKjoep: Record<string, Onske[]>;
  erAdmin?: boolean;
}

export interface ConfigState {
  headerTekst: string;
  visOpprettNyBruker: boolean;
  brukere: Bruker[];
  infoResettMailSendt: string;
  isLoading: boolean;
  slettKjopteOnskerEnabled: boolean;
}

export interface VennersListerState {
  allowedListsForMe: string[];
  valgtVennsListe: Onske[];
  valgtVenn: Partial<Bruker>;
}

export interface RootState {
  innloggetBruker: InnloggetBrukerState;
  config: ConfigState;
  vennersLister: VennersListerState;
  router: any;
}
