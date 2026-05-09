import initialState from './initialState';
import { VennersListerState } from '../types';
import { AppAction } from '../actions/actions';
import { MOTTA_VALGT_VENNS_LISTE, RESET_ALL_DATA, RECEIVE_MY_FRIEND_LISTS, MOTTA_VALGT_VENNS_EKSTRA_LISTER, SETT_VALGT_VENNS_LISTE_ID, MOTTA_VALGT_VENNS_EKSTRA_LISTE_ONSKER } from '../actions/actions';

export default function vennersLister(
    state: VennersListerState = initialState.vennersLister,
    action: AppAction
): VennersListerState {
    switch (action.type) {
        case RECEIVE_MY_FRIEND_LISTS:
            return Object.assign({}, state, {
                allowedListsForMe: action.lists,
            });
        case MOTTA_VALGT_VENNS_LISTE:
            return Object.assign({}, state, {
                valgtVennsListe: action.nyListe,
                valgtVenn: action.venn,
            });
        case MOTTA_VALGT_VENNS_EKSTRA_LISTER:
            return {
                ...state,
                valgtVennsEkstraLister: action.lister,
                valgtVennsAktivListeId: null,
                valgtVennsAlleEkstraListeOnsker: {},
            };
        case MOTTA_VALGT_VENNS_EKSTRA_LISTE_ONSKER:
            return {
                ...state,
                valgtVennsAlleEkstraListeOnsker: {
                    ...state.valgtVennsAlleEkstraListeOnsker,
                    [action.listId]: action.onsker,
                },
            };
        case SETT_VALGT_VENNS_LISTE_ID:
            return {
                ...state,
                valgtVennsAktivListeId: action.listId,
            };
        case RESET_ALL_DATA:
            return initialState.vennersLister;
        default:
            return state;
    }
}
