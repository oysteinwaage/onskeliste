// Domain types

export interface KjoptAv {
  kjoptAv: string;
  kjoptAvNavn: string;
  antallKjopt: number;
  pris?: number;
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
  sortOrder?: number;
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
  mainListName?: string;
  onboardingCompleted?: boolean;
  iosInstallBannerCount?: number;
}

export interface Viewer {
  value: string;
  label: string;
}

export interface ExtraListMetadata {
  key: string;
  name: string;
  ownerUid: string;
  sharedWithUid?: string;
}

export interface Feedback {
  key: string;
  tekst: string;
  timestamp: number;
  brukerUid: string;
  brukerNavn: string;
  lest: boolean;
}

// Redux state types

export interface InnloggetBrukerState {
  email: string;
  navn: string;
  uid?: string;
  mainListName?: string;
  onboardingCompleted?: boolean;
  mineOnsker: Onske[];
  openLenkeDialog: boolean;
  openLenkeDialogOnske: Partial<Onske>;
  allowedViewers: Viewer[];
  lastSeenVersion: number;
  userDbKey: string;
  measurements: Record<string, string>;
  mineKjoep: Record<string, Onske[]>;
  mineEkstraKjoep: Record<string, Onske[]>;
  mineEkstraListeKjoep: Record<string, { listId: string; listName: string; sharedWithUid?: string; onsker: Onske[] }[]>;
  erAdmin?: boolean;
  iosInstallBannerCount?: number;
  mineEkstraLister: ExtraListMetadata[];
  aktiveListeId: string | null;
  alleEkstraListeOnsker: Record<string, Onske[]>;
  opprettListeDialogOpen: boolean;
  alleFeedback: Feedback[];
  ulesteFeedback: number;
}

export interface ConfigState {
  headerTekst: string;
  visOpprettNyBruker: boolean;
  brukere: Bruker[];
  infoResettMailSendt: string;
  isLoading: boolean;
  slettKjopteOnskerEnabled: boolean;
  tilbakemeldingEnabled: boolean;
}

export interface VennersListerState {
  allowedListsForMe: string[];
  valgtVennsListe: Onske[];
  valgtVenn: Partial<Bruker>;
  valgtVennsEkstraLister: ExtraListMetadata[];
  valgtVennsAktivListeId: string | null;
  valgtVennsAlleEkstraListeOnsker: Record<string, Onske[]>;
}

export interface RootState {
  innloggetBruker: InnloggetBrukerState;
  config: ConfigState;
  vennersLister: VennersListerState;
  router: any;
}
