// Min ønskeliste
export const MOTTA_MIN_ONSKELISTE = 'MOTTA_MIN_ONSKELISTE';
export function mottaMinOnskeliste(nyListe) {
  return {
    type: MOTTA_MIN_ONSKELISTE,
    nyListe,
  };
}

export const TOGGLE_LENKE_DIALOG = 'TOGGLE_LENKE_DIALOG';
export function toggleLenkeDialog(index) {
  return {
    type: TOGGLE_LENKE_DIALOG,
    index,
  };
}

export const UPDATE_ALLOWED_VIEWERS = 'UPDATE_ALLOWED_VIEWERS';
export function updateAllowedViewers(viewers) {
  return {
    type: UPDATE_ALLOWED_VIEWERS,
    viewers,
  };
}

// Brukere
export const TOGGLE_VIS_OPPRETT_BRUKER = 'TOGGLE_VIS_OPPRETT_BRUKER';
export function toggleVisOpprettBruker() {
  return {
    type: TOGGLE_VIS_OPPRETT_BRUKER,
  };
}

export const MOTTA_BRUKERE = 'MOTTA_BRUKERE';
export function mottaBrukere(brukere) {
  return {
    type: MOTTA_BRUKERE,
    brukere
  };
}

export const BRUKER_LOGGET_INN = 'BRUKER_LOGGET_INN';
export function brukerLoggetInn(user) {
  return {
    type: BRUKER_LOGGET_INN,
    user,
  };
}

export const SET_LAST_SEEN_VERSION = 'SET_LAST_SEEN_VERSION';
export function setLastSeenVersion(newVersion) {
  return {
    type: SET_LAST_SEEN_VERSION,
    newVersion,
  };
}

// vennelister
export const MOTTA_VALGT_VENNS_LISTE = 'MOTTA_VALGT_VENNS_LISTE';
export function mottaValgtVennsListe(nyListe, venn) {
  return {
    type: MOTTA_VALGT_VENNS_LISTE,
    nyListe,
    venn
  };
}

export const RECEIVE_MY_FRIEND_LISTS = 'RECEIVE_MY_FRIEND_LISTS';
export function receiveMyFriendLists(lists) {
  return {
    type: RECEIVE_MY_FRIEND_LISTS,
    lists,
  };
}

// Generelt
export const RESET_ALL_DATA = 'RESET_ALL_DATA';
export function resetAllData() {
  return {
    type: RESET_ALL_DATA,
  };
}

export const ENDRE_HEADER_TEKST = 'ENDRE_HEADER_TEKST';
export function endreHeaderTekst(nyTekst) {
  return {
    type: ENDRE_HEADER_TEKST,
    nyTekst,
  };
}

export const RESETT_PASSORD_MAIL_SENDT = 'RESETT_PASSORD_MAIL_SENDT';
export function resettPassordMailSendt(infoText) {
  return {
    type: RESETT_PASSORD_MAIL_SENDT,
      infoText,
  };
}

export const SETT_IS_LOADING = 'SETT_IS_LOADING';
export function lasterData(isLoading) {
  return {
    type: SETT_IS_LOADING,
      isLoading,
  };
}

//Profil
export const OPPDATER_MINE_KJOEP = 'OPPDATER_MINE_KJOEP';
export function oppdaterMineKjoep(brukerUid, onskerTatt) {
  return {
    type: OPPDATER_MINE_KJOEP,
      brukerUid,
      onskerTatt
  };
}
