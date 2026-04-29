import { Onske, Bruker, Viewer } from '../types';

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
  | ReturnType<typeof settMineEkstraKjoep>;
