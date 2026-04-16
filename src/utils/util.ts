import { auth } from '../config/firebase';
import { Bruker, Onske, KjoptAv } from '../types';

export const myWishlistId = (): string => auth.currentUser!.uid;
export const myName = (): string | null => auth.currentUser!.displayName;
export const erInnloggetBrukersUid = (uid: string): boolean => auth.currentUser!.uid === uid;

export const finnPersonMedUid = (uid: string, personer: Bruker[]): Bruker | undefined => {
  return personer.find(x => x.uid === uid);
};

export const opprettUrlAv = (url: string | null | undefined): string | null | undefined =>
  url && !url.startsWith('http') ? 'http://' + url : url;

/* VenneListe */
export const kjoptListe = (onske: Onske): KjoptAv[] => (onske.kjoptAvListe || []);
export const inneholderInnloggetBrukersUid = (onskerKjopt: KjoptAv[] | undefined): KjoptAv | undefined =>
  (onskerKjopt || []).find(kjop => kjop.kjoptAv === auth.currentUser!.uid);
export const totalValgt = (onske: Onske): number =>
  kjoptListe(onske).reduce((total, kjopt) => total + kjopt.antallKjopt, 0);
// TODO ja, det ble jo issue som forventet om noen skrur ned antall etter det allerede er kjøpt alt...
export const alleOnskerTatt = (onske: Onske): boolean => totalValgt(onske) === onske.antall;
export const antallAlleredeKjoptAvMeg = (onske: Partial<Onske>): number =>
  (kjoptListe(onske as Onske).find(k => k.kjoptAv === myWishlistId()) || { antallKjopt: 0 }).antallKjopt || 0;

export const measurementKeys: Record<string, string> = {
  SKO: "sko",
  BUKSE: "bukse",
  GENSER_TSKJORTE: "genser_tskjorte",
  SKJORTE: "skjorte",
  BH: "bh",
  HANSKER: "hansker",
  BOKSER: "boksershorts",
  HATT: "hatt"
};

export const finnLabelForStrl = (strlKey: string): string => {
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
      return "Hodemål";
    default:
      return strlKey;
  }
};

export const finnNavnFraUid = (uid: string, brukere: Bruker[]): string | undefined =>
  (brukere.find(bruker => bruker.uid === uid) || {} as Bruker).navn;
