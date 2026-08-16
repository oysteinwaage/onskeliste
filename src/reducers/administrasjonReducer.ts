import initialState from './initialState';
import { AdministrasjonState } from '../types';
import { AppAction } from '../actions/actions';
import {
    RESET_ALL_DATA,
    RECEIVE_ADMIN_LISTS_FOR_ME,
    START_ADMINISTRER_BRUKER,
    AVSLUTT_ADMINISTRER_BRUKER,
    MOTTA_ADMINISTRERT_ONSKER,
    MOTTA_ADMINISTRERT_EKSTRA_LISTER,
    MOTTA_ADMINISTRERT_EKSTRA_LISTE_ONSKER,
    FJERN_ADMINISTRERT_EKSTRA_LISTE_ONSKER,
    OPPDATER_ADMINISTRERT_EKSTRA_LISTE_METADATA,
    SETT_ADMINISTRERT_AKTIV_LISTE_ID,
} from '../actions/actions';

export default function administrasjon(
    state: AdministrasjonState = initialState.administrasjon,
    action: AppAction
): AdministrasjonState {
    switch (action.type) {
        case RECEIVE_ADMIN_LISTS_FOR_ME:
            return { ...state, adminListsForMe: action.uids };
        case START_ADMINISTRER_BRUKER:
            return {
                ...initialState.administrasjon,
                adminListsForMe: state.adminListsForMe,
                aktivUid: action.uid,
                navn: action.navn,
                mainListName: action.mainListName,
            };
        case AVSLUTT_ADMINISTRER_BRUKER:
            return {
                ...initialState.administrasjon,
                adminListsForMe: state.adminListsForMe,
            };
        case MOTTA_ADMINISTRERT_ONSKER:
            return { ...state, onsker: action.onsker };
        case MOTTA_ADMINISTRERT_EKSTRA_LISTER:
            return { ...state, ekstraLister: action.lister };
        case MOTTA_ADMINISTRERT_EKSTRA_LISTE_ONSKER:
            return {
                ...state,
                alleEkstraListeOnsker: {
                    ...state.alleEkstraListeOnsker,
                    [action.listId]: action.onsker,
                },
            };
        case FJERN_ADMINISTRERT_EKSTRA_LISTE_ONSKER: {
            const { [action.listId]: _removed, ...rest } = state.alleEkstraListeOnsker;
            return { ...state, alleEkstraListeOnsker: rest };
        }
        case OPPDATER_ADMINISTRERT_EKSTRA_LISTE_METADATA:
            return {
                ...state,
                ekstraLister: state.ekstraLister.map(l =>
                    l.key === action.liste.key ? action.liste : l
                ),
            };
        case SETT_ADMINISTRERT_AKTIV_LISTE_ID:
            return { ...state, aktivListeId: action.listId };
        case RESET_ALL_DATA:
            return initialState.administrasjon;
        default:
            return state;
    }
}
