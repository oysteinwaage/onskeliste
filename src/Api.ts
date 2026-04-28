import { push } from 'connected-react-router';
import {
    adminConfigRef,
    allowedViewsRef,
    auth,
    myAllowedViewersRef,
    myUid,
    myWishlistRef,
    usersRef,
    wishlistRef
} from "./config/firebase";
import {
    brukerLoggetInn,
    mottaBrukere,
    mottaMinOnskeliste,
    mottaValgtVennsListe,
    receiveMyFriendLists,
    resetAllData,
    updateAllowedViewers,
    resettPassordMailSendt,
    setLastSeenVersion,
    oppdaterMineKjoep,
    setSlettKjopteOnskerEnabled,
} from "./actions/actions";
import { opprettUrlAv } from "./utils/util";
import { Onske, Viewer } from './types';
import { Dispatch } from 'redux';

const mapTolist = (res: firebase.default.database.DataSnapshot): any[] =>
    res.val() ?
        Object.keys(res.val()).map(k => {
            return Object.assign({}, res.val()[k], { key: k })
        }) : [];

/*
WISHLIST MANIPULATIONS
 */
export const addWishToMyList = (newWish: Omit<Onske, 'key'>): void => {
    myWishlistRef().push().set(newWish);
};

export const removeWishFromMyList = (wishId: string): void => {
    myWishlistRef().child(wishId).remove();
};

// brukes når du vil kunne slette ønsker fra andres lister
export const removeWishFromCurrentList = (listId: string, wishKey: string): void => {
    wishlistRef(listId).child(wishKey).remove();
};

export const updateLinkOnWishOnMyList = (newLink: string | null, wishId: string): void => {
    const wishRef = myWishlistRef().child(wishId);
    wishRef.update({ url: opprettUrlAv(newLink) });
};

export const updateUrlsOnWishOnMyList = (urls: string[], wishId: string): void => {
    const wishRef = myWishlistRef().child(wishId);
    const cleaned = urls.map(u => opprettUrlAv(u) as string).filter(Boolean);
    wishRef.update({ urls: cleaned.length > 0 ? cleaned : null, url: null });
};

export const updateWishTextOnMyList = (newText: string, wishId: string): void => {
    const wishRef = myWishlistRef().child(wishId);
    wishRef.update({ onskeTekst: newText });
};

export const updateAntallOnMyList = (newAntall: number | string, wishId: string): void => {
    const wishRef = myWishlistRef().child(wishId);
    wishRef.update({ antall: newAntall });
};

export const updateSizeOnMyList = (newSize: string | null, wishId: string): void => {
    const wishRef = myWishlistRef().child(wishId);
    wishRef.update({ onskeSize: newSize });
};

export const updateFavorittOnMyWish = (wishId: string, erFavoritt: boolean): void => {
    const wishRef = myWishlistRef().child(wishId);
    wishRef.update({ favoritt: erFavoritt });
};

export const updateWishOnListWith = (newValues: Partial<Onske>, wish: Onske, listId: string): void => {
    const wishKey = wish.key;
    const wishWithoutKey = { ...wish };
    delete (wishWithoutKey as any).key;
    wishlistRef(listId).child(wishKey).update(Object.assign({}, wishWithoutKey, newValues));
};

export const fetdhMinOnskeliste = () => async (dispatch: Dispatch) => {
    myWishlistRef().on('value', snapshot => {
        dispatch(mottaMinOnskeliste(mapTolist(snapshot)));
    });
};

export const fetdhOnskelisteForUid = (uid: string, venn: any) => async (dispatch: Dispatch) => {
    wishlistRef(uid).on("value", snapshot => {
        dispatch(mottaValgtVennsListe(mapTolist(snapshot), venn));
    });
};

/*
ALLOWED VIEWERS
 */
export const addViewersToMyList = (viewers: Viewer[]): void => {
    myAllowedViewersRef().set(viewers);
};

export const fetchViewersToMyList = () => async (dispatch: Dispatch) => {
    myAllowedViewersRef()
        .on('value', res => {
            dispatch(updateAllowedViewers(res.val() && res.val().sort((a: Viewer, b: Viewer) => a.label.localeCompare(b.label))));
        });
};

export const fetchListsIAmAllowedToView = () => async (dispatch: Dispatch) => {
    allowedViewsRef.once('value', res => {
        const allLists = res.val();
        const myLists: string[] = allLists ?
            Object.keys(allLists).filter(groupId => allLists[groupId].find((member: any) => member && member.value === myUid())).map(k => {
                return k;
            }) : [];
        dispatch(receiveMyFriendLists(myLists));

        myLists.forEach(key => {
            wishlistRef(key).on("value", snapshot => {
                const onsker = snapshot.val();
                const onskerTatt = Object.keys(onsker || {})
                    .filter(key => onsker[key].kjoptAvListe && onsker[key].kjoptAvListe.find((i: any) => i.kjoptAv === myUid()))
                    .map(key => onsker[key]);
                dispatch(oppdaterMineKjoep(key, onskerTatt));
            });
        });

        return myLists;
    });
};

/*
USERS
 */
export const loggInn = (brukernavn: string, passord: string) => async (dispatch: Dispatch) => {
    auth.signInWithEmailAndPassword(brukernavn, passord)
        .then(user => {
            dispatch(brukerLoggetInn(user.user));
            dispatch(push('/minliste'));
        })
        .catch(function (error: any) {
            alert(error);
        });
};

export const resetPassord = (mail: string) => async (dispatch: Dispatch) => {
    auth.sendPasswordResetEmail(mail)
        .then(() => dispatch(resettPassordMailSendt(
            `Link til resetting av passord er sendt til din email: ${mail}. Sjekk i spam-mappen din også, den kan fort ende der`
        )))
        .catch(() => dispatch(resettPassordMailSendt('Noe gikk feil! Sjekk at du har skrevet inn riktig mail og prøv igjen')))
};

export const fetchUsers = () => async (dispatch: Dispatch) => {
    usersRef.once('value', snapshot => {
        dispatch(mottaBrukere(mapTolist(snapshot).sort((a, b) => a.navn.localeCompare(b.navn))));
    });
};

export const updateLastSeenVersion = (newVersion: number, userDbKey: string) => async (dispatch: Dispatch) => {
    if (userDbKey) {
        usersRef.child(userDbKey).update({ lastSeenVersion: newVersion });
    }
    dispatch(setLastSeenVersion(newVersion));
};

export const updateMyMeasumentOnProfile = (userDbKey: string, newSize: string, sizeKey: string): void => {
    if (userDbKey) {
        usersRef.child(userDbKey).child("measurements").update({ [sizeKey]: newSize });
    } else {
        const uid = myUid();
        if (!uid) return;
        usersRef.orderByChild('uid').equalTo(uid).once('value', snapshot => {
            if (snapshot.exists()) {
                const key = Object.keys(snapshot.val())[0];
                usersRef.child(key).child("measurements").update({ [sizeKey]: newSize });
            }
        });
    }
};

/*
ADMIN
 */
export const fetchAdminConfig = () => async (dispatch: Dispatch) => {
    adminConfigRef.on('value', snapshot => {
        const config = snapshot.val() || {};
        dispatch(setSlettKjopteOnskerEnabled(!!config.slettKjopteOnskerEnabled));
    });
};

export const setSlettKjopteOnskerEnabledApi = (enabled: boolean): void => {
    adminConfigRef.update({ slettKjopteOnskerEnabled: enabled });
};

export const slettKjopteOnsker = (mineOnsker: Onske[]): void => {
    mineOnsker.forEach(onske => {
        const kjoptAvListe = onske.kjoptAvListe || [];
        if (kjoptAvListe.length === 0) return;

        const totalKjopt = kjoptAvListe.reduce((sum, k) => sum + (k.antallKjopt || 1), 0);
        const antall = onske.antall || 1;

        if (totalKjopt >= antall) {
            myWishlistRef().child(onske.key).remove();
        } else {
            myWishlistRef().child(onske.key).update({
                antall: antall - totalKjopt,
                kjoptAvListe: null,
            });
        }
    });
};

export const logOut = () => async (dispatch: Dispatch) => {
    auth.signOut().then(function () {
        dispatch(push('/'));
        dispatch(resetAllData());
    }).catch((error: any) => {
        alert(error);
    })
};

export const opprettNyBruker = (brukernavn: string, passord: string, firstName: string, lastName: string) => async (dispatch: Dispatch) => {
    const navn = firstName + " " + lastName;
    auth.createUserWithEmailAndPassword(brukernavn, passord)
        .then(() => {
            auth.currentUser!.updateProfile({ displayName: navn, photoURL: null })
                .then(() => {
                    usersRef.push().set({ navn, firstName, lastName, email: brukernavn, uid: auth.currentUser!.uid });
                    dispatch(brukerLoggetInn(auth.currentUser));
                    dispatch(push('/minliste'));
                })
        })
        .catch(function (error: any) {
            alert(error);
        });
};
