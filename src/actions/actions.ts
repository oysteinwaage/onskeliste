import { Onske, Bruker, Viewer, ExtraListMetadata, Feedback, PassordReparasjonInfo } from '../types';

// Min ønskeliste
export const MOTTA_MIN_ONSKELISTE = 'MOTTA_MIN_ONSKELISTE';
export function mottaMinOnskeliste(nyListe: Onske[]) {
  return {
    type: MOTTA_MIN_ONSKELISTE as typeof MOTTA_MIN_ONSKELISTE,
    nyListe,
  };
}

export const TOGGLE_LENKE_DIALOG = 'TOGGLE_LENKE_DIALOG';
export function toggleLenkeDialog(index?: Partial<Onske>) {
  return {
    type: TOGGLE_LENKE_DIALOG as typeof TOGGLE_LENKE_DIALOG,
    index,
  };
}

export const UPDATE_ALLOWED_VIEWERS = 'UPDATE_ALLOWED_VIEWERS';
export function updateAllowedViewers(viewers: Viewer[] | null) {
  return {
    type: UPDATE_ALLOWED_VIEWERS as typeof UPDATE_ALLOWED_VIEWERS,
    viewers,
  };
}

// Brukere
export const TOGGLE_VIS_OPPRETT_BRUKER = 'TOGGLE_VIS_OPPRETT_BRUKER';
export function toggleVisOpprettBruker() {
  return {
    type: TOGGLE_VIS_OPPRETT_BRUKER as typeof TOGGLE_VIS_OPPRETT_BRUKER,
  };
}

export const MOTTA_BRUKERE = 'MOTTA_BRUKERE';
export function mottaBrukere(brukere: Bruker[]) {
  return {
    type: MOTTA_BRUKERE as typeof MOTTA_BRUKERE,
    brukere,
  };
}

export const BRUKER_LOGGET_INN = 'BRUKER_LOGGET_INN';
export function brukerLoggetInn(user: any) {
  return {
    type: BRUKER_LOGGET_INN as typeof BRUKER_LOGGET_INN,
    user,
  };
}

export const SET_LAST_SEEN_VERSION = 'SET_LAST_SEEN_VERSION';
export function setLastSeenVersion(newVersion: number) {
  return {
    type: SET_LAST_SEEN_VERSION as typeof SET_LAST_SEEN_VERSION,
    newVersion,
  };
}

// vennelister
export const MOTTA_VALGT_VENNS_LISTE = 'MOTTA_VALGT_VENNS_LISTE';
export function mottaValgtVennsListe(nyListe: Onske[], venn: Partial<Bruker>) {
  return {
    type: MOTTA_VALGT_VENNS_LISTE as typeof MOTTA_VALGT_VENNS_LISTE,
    nyListe,
    venn,
  };
}

export const RECEIVE_MY_FRIEND_LISTS = 'RECEIVE_MY_FRIEND_LISTS';
export function receiveMyFriendLists(lists: string[]) {
  return {
    type: RECEIVE_MY_FRIEND_LISTS as typeof RECEIVE_MY_FRIEND_LISTS,
    lists,
  };
}

// Generelt
export const RESET_ALL_DATA = 'RESET_ALL_DATA';
export function resetAllData() {
  return {
    type: RESET_ALL_DATA as typeof RESET_ALL_DATA,
  };
}

export const ENDRE_HEADER_TEKST = 'ENDRE_HEADER_TEKST';
export function endreHeaderTekst(nyTekst: string) {
  return {
    type: ENDRE_HEADER_TEKST as typeof ENDRE_HEADER_TEKST,
    nyTekst,
  };
}

export const RESETT_PASSORD_MAIL_SENDT = 'RESETT_PASSORD_MAIL_SENDT';
export function resettPassordMailSendt(infoText: string) {
  return {
    type: RESETT_PASSORD_MAIL_SENDT as typeof RESETT_PASSORD_MAIL_SENDT,
    infoText,
  };
}

export const SETT_IS_LOADING = 'SETT_IS_LOADING';
export function lasterData(isLoading: boolean) {
  return {
    type: SETT_IS_LOADING as typeof SETT_IS_LOADING,
    isLoading,
  };
}

// Admin
export const SET_SLETT_KJOPTE_ONSKER_ENABLED = 'SET_SLETT_KJOPTE_ONSKER_ENABLED';
export function setSlettKjopteOnskerEnabled(enabled: boolean) {
  return { type: SET_SLETT_KJOPTE_ONSKER_ENABLED as typeof SET_SLETT_KJOPTE_ONSKER_ENABLED, enabled };
}

export const SET_TILBAKEMELDING_ENABLED = 'SET_TILBAKEMELDING_ENABLED';
export function setTilbakemeldingEnabled(enabled: boolean) {
  return { type: SET_TILBAKEMELDING_ENABLED as typeof SET_TILBAKEMELDING_ENABLED, enabled };
}

export const SETT_PASSORD_REPARASJON = 'SETT_PASSORD_REPARASJON';
export function settPassordReparasjon(info: PassordReparasjonInfo | null) {
  return { type: SETT_PASSORD_REPARASJON as typeof SETT_PASSORD_REPARASJON, info };
}

//Profil
export const OPPDATER_MINE_KJOEP = 'OPPDATER_MINE_KJOEP';
export function oppdaterMineKjoep(brukerUid: string, onskerTatt: Onske[]) {
  return {
    type: OPPDATER_MINE_KJOEP as typeof OPPDATER_MINE_KJOEP,
    brukerUid,
    onskerTatt,
  };
}

export const SETT_MINE_EKSTRA_KJOEP = 'SETT_MINE_EKSTRA_KJOEP';
export function settMineEkstraKjoep(ekstraKjoep: Record<string, Onske[]>) {
  return {
    type: SETT_MINE_EKSTRA_KJOEP as typeof SETT_MINE_EKSTRA_KJOEP,
    ekstraKjoep,
  };
}

export const OPPDATER_MINE_EKSTRA_LISTE_KJOEP = 'OPPDATER_MINE_EKSTRA_LISTE_KJOEP';
export function oppdaterMineEkstraListeKjoep(ownerUid: string, listId: string, listName: string, onsker: Onske[], sharedWithUid?: string) {
  return {
    type: OPPDATER_MINE_EKSTRA_LISTE_KJOEP as typeof OPPDATER_MINE_EKSTRA_LISTE_KJOEP,
    ownerUid,
    listId,
    listName,
    sharedWithUid,
    onsker,
  };
}


export const SETT_OPPRETT_LISTE_DIALOG_OPEN = 'SETT_OPPRETT_LISTE_DIALOG_OPEN';
export function settOpprettListeDialogOpen(open: boolean) {
  return {
    type: SETT_OPPRETT_LISTE_DIALOG_OPEN as typeof SETT_OPPRETT_LISTE_DIALOG_OPEN,
    open,
  };
}

// Extra lister
export const OPPDATER_EKSTRA_LISTE_METADATA = 'OPPDATER_EKSTRA_LISTE_METADATA';
export function oppdaterEkstraListeMetadata(liste: ExtraListMetadata) {
  return {
    type: OPPDATER_EKSTRA_LISTE_METADATA as typeof OPPDATER_EKSTRA_LISTE_METADATA,
    liste,
  };
}

export const MOTTA_MINE_EKSTRA_LISTER = 'MOTTA_MINE_EKSTRA_LISTER';
export function mottaMineEkstraLister(lister: ExtraListMetadata[]) {
  return {
    type: MOTTA_MINE_EKSTRA_LISTER as typeof MOTTA_MINE_EKSTRA_LISTER,
    lister,
  };
}

export const SETT_AKTIV_LISTE_ID = 'SETT_AKTIV_LISTE_ID';
export function settAktivListeId(listId: string | null) {
  return {
    type: SETT_AKTIV_LISTE_ID as typeof SETT_AKTIV_LISTE_ID,
    listId,
  };
}

export const MOTTA_EKSTRA_LISTE_ONSKER = 'MOTTA_EKSTRA_LISTE_ONSKER';
export function mottaEkstraListeOnsker(listId: string, onsker: Onske[]) {
  return {
    type: MOTTA_EKSTRA_LISTE_ONSKER as typeof MOTTA_EKSTRA_LISTE_ONSKER,
    listId,
    onsker,
  };
}

export const FJERN_EKSTRA_LISTE_ONSKER = 'FJERN_EKSTRA_LISTE_ONSKER';
export function fjernEkstraListeOnsker(listId: string) {
  return {
    type: FJERN_EKSTRA_LISTE_ONSKER as typeof FJERN_EKSTRA_LISTE_ONSKER,
    listId,
  };
}

export const MOTTA_VALGT_VENNS_EKSTRA_LISTER = 'MOTTA_VALGT_VENNS_EKSTRA_LISTER';
export function mottaValgtVennsEkstraLister(lister: ExtraListMetadata[]) {
  return {
    type: MOTTA_VALGT_VENNS_EKSTRA_LISTER as typeof MOTTA_VALGT_VENNS_EKSTRA_LISTER,
    lister,
  };
}

export const MOTTA_VALGT_VENNS_EKSTRA_LISTE_ONSKER = 'MOTTA_VALGT_VENNS_EKSTRA_LISTE_ONSKER';
export function mottaValgtVennsEkstraListeOnsker(listId: string, onsker: Onske[]) {
  return {
    type: MOTTA_VALGT_VENNS_EKSTRA_LISTE_ONSKER as typeof MOTTA_VALGT_VENNS_EKSTRA_LISTE_ONSKER,
    listId,
    onsker,
  };
}

export const SETT_VALGT_VENNS_LISTE_ID = 'SETT_VALGT_VENNS_LISTE_ID';
export function settValgtVennsListeId(listId: string | null) {
  return {
    type: SETT_VALGT_VENNS_LISTE_ID as typeof SETT_VALGT_VENNS_LISTE_ID,
    listId,
  };
}

export const SETT_HOVED_LISTE_NAVN = 'SETT_HOVED_LISTE_NAVN';
export function settHovedListeNavn(navn: string) {
  return {
    type: SETT_HOVED_LISTE_NAVN as typeof SETT_HOVED_LISTE_NAVN,
    navn,
  };
}

// Feedback
export const MOTTA_FEEDBACK = 'MOTTA_FEEDBACK';
export function mottaFeedback(feedback: Feedback[]) {
  return {
    type: MOTTA_FEEDBACK as typeof MOTTA_FEEDBACK,
    feedback,
  };
}

export const SETT_ULESTE_FEEDBACK = 'SETT_ULESTE_FEEDBACK';
export function settUlesteFeedback(antall: number) {
  return {
    type: SETT_ULESTE_FEEDBACK as typeof SETT_ULESTE_FEEDBACK,
    antall,
  };
}

// Union type of all actions
export type AppAction =
  | ReturnType<typeof mottaMinOnskeliste>
  | ReturnType<typeof toggleLenkeDialog>
  | ReturnType<typeof updateAllowedViewers>
  | ReturnType<typeof toggleVisOpprettBruker>
  | ReturnType<typeof mottaBrukere>
  | ReturnType<typeof brukerLoggetInn>
  | ReturnType<typeof setLastSeenVersion>
  | ReturnType<typeof mottaValgtVennsListe>
  | ReturnType<typeof receiveMyFriendLists>
  | ReturnType<typeof resetAllData>
  | ReturnType<typeof endreHeaderTekst>
  | ReturnType<typeof resettPassordMailSendt>
  | ReturnType<typeof lasterData>
  | ReturnType<typeof setSlettKjopteOnskerEnabled>
  | ReturnType<typeof oppdaterMineKjoep>
  | ReturnType<typeof settMineEkstraKjoep>
  | ReturnType<typeof oppdaterMineEkstraListeKjoep>
  | ReturnType<typeof mottaMineEkstraLister>
  | ReturnType<typeof settAktivListeId>
  | ReturnType<typeof mottaEkstraListeOnsker>
  | ReturnType<typeof fjernEkstraListeOnsker>
  | ReturnType<typeof mottaValgtVennsEkstraLister>
  | ReturnType<typeof mottaValgtVennsEkstraListeOnsker>
  | ReturnType<typeof settValgtVennsListeId>
  | ReturnType<typeof settOpprettListeDialogOpen>
  | ReturnType<typeof oppdaterEkstraListeMetadata>
  | ReturnType<typeof settHovedListeNavn>
  | ReturnType<typeof mottaFeedback>
  | ReturnType<typeof settUlesteFeedback>
  | ReturnType<typeof setTilbakemeldingEnabled>
  | ReturnType<typeof settPassordReparasjon>;
