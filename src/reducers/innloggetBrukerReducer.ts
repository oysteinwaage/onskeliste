import initialState from './initialState';
import { InnloggetBrukerState } from '../types';
import { AppAction } from '../actions/actions';
import {
    BRUKER_LOGGET_INN,
    MOTTA_BRUKERE,
    MOTTA_MIN_ONSKELISTE,
    RESET_ALL_DATA,
    TOGGLE_LENKE_DIALOG,
    UPDATE_ALLOWED_VIEWERS,
    SET_LAST_SEEN_VERSION,
    OPPDATER_MINE_KJOEP,
    SETT_MINE_EKSTRA_KJOEP,
    OPPDATER_MINE_EKSTRA_LISTE_KJOEP,
    MOTTA_MINE_EKSTRA_LISTER,
    OPPDATER_EKSTRA_LISTE_METADATA,
    SETT_AKTIV_LISTE_ID,
    MOTTA_EKSTRA_LISTE_ONSKER,
    FJERN_EKSTRA_LISTE_ONSKER,
    SETT_OPPRETT_LISTE_DIALOG_OPEN,
    SETT_HOVED_LISTE_NAVN,
    MOTTA_FEEDBACK,
    SETT_ULESTE_FEEDBACK,
} from '../actions/actions';

export default function innloggetBruker(
    state: InnloggetBrukerState = initialState.innloggetBruker,
    action: AppAction
): InnloggetBrukerState {
    switch (action.type) {
        case BRUKER_LOGGET_INN:
            return Object.assign({}, state, {
                email: action.user.email,
                navn: action.user.displayName,
                uid: action.user.uid,
                photoURL: action.user.photoURL || undefined,
            });
        case MOTTA_MIN_ONSKELISTE:
            return Object.assign({}, state, {
                mineOnsker: action.nyListe || [],
            });
        case TOGGLE_LENKE_DIALOG:
            return Object.assign({}, state, {
                openLenkeDialog: !state.openLenkeDialog,
                openLenkeDialogOnske: action.index || {},
            });
        case UPDATE_ALLOWED_VIEWERS:
            return Object.assign({}, state, {
                allowedViewers: action.viewers || [],
            });
        case MOTTA_BRUKERE:
            const me = action.brukere.find(b => b.uid === state.uid);
            return me ? {
                ...state,
                ...me,
                userDbKey: me.key
            } : {...state};
        case SET_LAST_SEEN_VERSION:
            return {
                ...state,
                lastSeenVersion: action.newVersion,
            };
        case RESET_ALL_DATA:
            return initialState.innloggetBruker;
        case OPPDATER_MINE_KJOEP:
            return {
                ...state,
                mineKjoep: {
                    ...state.mineKjoep,
                    [action.brukerUid]: action.onskerTatt
                }
            };
        case SETT_MINE_EKSTRA_KJOEP:
            return {
                ...state,
                mineEkstraKjoep: action.ekstraKjoep,
            };
        case OPPDATER_MINE_EKSTRA_LISTE_KJOEP: {
            const eksisterende = state.mineEkstraListeKjoep[action.ownerUid] || [];
            const uten = eksisterende.filter(e => e.listId !== action.listId);
            const oppdatert = action.onsker.length > 0
                ? [...uten, { listId: action.listId, listName: action.listName, sharedWithUid: action.sharedWithUid, onsker: action.onsker }]
                : uten;
            return {
                ...state,
                mineEkstraListeKjoep: {
                    ...state.mineEkstraListeKjoep,
                    [action.ownerUid]: oppdatert,
                },
            };
        }
        case MOTTA_MINE_EKSTRA_LISTER:
            return {
                ...state,
                mineEkstraLister: action.lister,
            };
        case OPPDATER_EKSTRA_LISTE_METADATA:
            return {
                ...state,
                mineEkstraLister: state.mineEkstraLister.map(l =>
                    l.key === action.liste.key ? action.liste : l
                ),
            };
        case SETT_AKTIV_LISTE_ID:
            return {
                ...state,
                aktiveListeId: action.listId,
            };
        case MOTTA_EKSTRA_LISTE_ONSKER: {
            return {
                ...state,
                alleEkstraListeOnsker: {
                    ...state.alleEkstraListeOnsker,
                    [action.listId]: action.onsker,
                },
            };
        }
        case FJERN_EKSTRA_LISTE_ONSKER: {
            const { [action.listId]: _removed, ...rest } = state.alleEkstraListeOnsker;
            return { ...state, alleEkstraListeOnsker: rest };
        }
        case SETT_OPPRETT_LISTE_DIALOG_OPEN:
            return {
                ...state,
                opprettListeDialogOpen: action.open,
            };
        case SETT_HOVED_LISTE_NAVN:
            return {
                ...state,
                mainListName: action.navn,
            };
        case MOTTA_FEEDBACK:
            return {
                ...state,
                alleFeedback: action.feedback,
            };
        case SETT_ULESTE_FEEDBACK:
            return {
                ...state,
                ulesteFeedback: action.antall,
            };
        default:
            return state;
    }
}
