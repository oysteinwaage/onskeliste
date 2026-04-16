import initialState from './initialState';
import { VennersListerState } from '../types';
import { AppAction } from '../actions/actions';
import { MOTTA_VALGT_VENNS_LISTE, RESET_ALL_DATA, RECEIVE_MY_FRIEND_LISTS } from '../actions/actions';

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
        case RESET_ALL_DATA:
            return initialState.vennersLister;
        default:
            return state;
    }
}
