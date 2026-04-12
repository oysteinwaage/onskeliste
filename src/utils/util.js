import { auth } from '../config/firebase';

export const myWishlistId = () => auth.currentUser.uid;
export const myName = () => auth.currentUser.displayName;
export const erInnloggetBrukersUid = uid => auth.currentUser.uid === uid;

export const finnPersonMedUid = (uid, personer) => {
  return personer.find(x => x.uid === uid);
};

export const opprettUrlAv = url =>  url && !url.startsWith('http') ? 'http://' + url : url;

/* VenneListe */
export const kjoptListe = onske => (onske.kjoptAvListe || []);
export const inneholderInnloggetBrukersUid = onskerKjopt => (onskerKjopt || []).find(kjop => kjop.kjoptAv === auth.currentUser.uid);
export const totalValgt = onske => kjoptListe(onske).reduce((total, kjopt) => total + kjopt.antallKjopt, 0);
// TODO ja, det ble jo issue som forventet om noen skrur ned antall etter det allerede er kjøpt alt...
export const alleOnskerTatt = onske => totalValgt(onske) === onske.antall;
export const antallAlleredeKjoptAvMeg = onske => (kjoptListe(onske).find(k => k.kjoptAv === myWishlistId()) || {}).antallKjopt || 0;

export const measurementKeys = {
  SKO: "sko",
  BUKSE: "bukse",
  GENSER_TSKJORTE: "genser_tskjorte",
  SKJORTE: "skjorte",
  BH: "bh",
  HANSKER: "hansker",
  BOKSER: "boksershorts",
  HATT: "hatt"
};

export const finnLabelForStrl = strlKey => {
  switch (strlKey) {
    case measurementKeys.SKO:
      return "Sko";
    case measurementKeys.BUKSE:
      return "Bukse";
    case measurementKeys.GENSER_TSKJORTE:
      return "Genser/T-skjorte";
    case measurementKeys.SKJORTE:
      return "Skjorte";
    case measurementKeys.BH:
      return "BH";
    case measurementKeys.HANSKER:
      return "Hansker";
    case measurementKeys.BOKSER:
      return "Boksershorts";
    case measurementKeys.HATT:
      return "Hodemål"
  }
};

export const finnNavnFraUid = (uid, brukere) => (brukere.find(bruker => bruker.uid === uid) || {}).navn;
