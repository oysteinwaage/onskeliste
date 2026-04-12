import {push} from 'connected-react-router';
import {
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
    setLastSeenVersion, oppdaterMineKjoep
} from "./actions/actions";
import {opprettUrlAv} from "./utils/util";

const mapTolist = res => res.val() ?
    Object.keys(res.val()).map(k => {
        return Object.assign({}, res.val()[k], {key: k,})
    }) : [];

/*
WISHLIST MANIPULATIONS
 */
export const addWishToMyList = newWish => {
    myWishlistRef().push().set(newWish);
};

export const removeWishFromMyList = wishId => {
    myWishlistRef().child(wishId).remove();
};

// brukes når du vil kunne slette ønsker fra andres lister
export const removeWishFromCurrentList = (listId, wishKey) => {
    wishlistRef(listId).child(wishKey).remove();
};

export const updateLinkOnWishOnMyList = (newLink, wishId) => {
    const wishRef = myWishlistRef().child(wishId);
    wishRef.update({url: opprettUrlAv(newLink)});
};

export const updateWishTextOnMyList = (newText, wishId) => {
    const wishRef = myWishlistRef().child(wishId);
    wishRef.update({onskeTekst: newText});
};

export const updateAntallOnMyList = (newAntall, wishId) => {
    const wishRef = myWishlistRef().child(wishId);
    wishRef.update({antall: newAntall});
};

export const updateSizeOnMyList = (newSize, wishId) => {
    const wishRef = myWishlistRef().child(wishId);
    wishRef.update({onskeSize: newSize});
};

export const updateFavorittOnMyWish = (wishId, erFavoritt) => {
    const wishRef = myWishlistRef().child(wishId);
    wishRef.update({favoritt: erFavoritt});
};

export const updateWishOnListWith = (newValues, wish, listId) => {
    const wishKey = wish.key;
    delete wish.key;
    wishlistRef(listId).child(wishKey).update(Object.assign({}, wish, newValues));
    /* wishlistRef(listId).child(wishKey).update(
        {
          ...wish,
          kjopt: newValues.kjopt,
          kjoptAv: newValues.kjoptAv,
          kjoptAvNavn: newValues.kjoptAvNavn
        }
        ); */
};

export const fetdhMinOnskeliste = () => async dispatch => {
    myWishlistRef().on('value', snapshot => {
        dispatch(mottaMinOnskeliste(mapTolist(snapshot)));
    });
};

export const fetdhOnskelisteForUid = (uid, venn) => async dispatch => {
    wishlistRef(uid).on("value", snapshot => {
        dispatch(mottaValgtVennsListe(mapTolist(snapshot), venn));
    });
};

/*
ALLOWED VIEWERS
 */
export const addViewersToMyList = (viewers) => {
    myAllowedViewersRef().set(viewers);
};

export const fetchViewersToMyList = () => async dispatch => {
    myAllowedViewersRef()
        .on('value', res => {
            dispatch(updateAllowedViewers(res.val() && res.val().sort((a, b) => a.label.localeCompare(b.label))));
        });
};

export const fetchListsIAmAllowedToView = () => async dispatch => {
    allowedViewsRef.once('value', res => {
        const allLists = res.val();
        const myLists = allLists ?
            Object.keys(allLists).filter(groupId => allLists[groupId].find(member => member && member.value === myUid())).map(k => {
                return k;
            }) : [];
        dispatch(receiveMyFriendLists(myLists));

        myLists.forEach(key => {
            wishlistRef(key).on("value", snapshot => {
                const onsker = snapshot.val();
                const onskerTatt = Object.keys(onsker || {})
                    .filter(key => onsker[key].kjoptAvListe && onsker[key].kjoptAvListe.find(i => i.kjoptAv === myUid()))
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
export const loggInn = (brukernavn, passord) => async dispatch => {
    auth.signInWithEmailAndPassword(brukernavn, passord)
        .then(user => {
            dispatch(brukerLoggetInn(user.user));
            dispatch(push('/minliste'));
        })
        .catch(function (error) {
            alert(error);
        });
};

export const resetPassord = (mail) => async dispatch => {
    auth.sendPasswordResetEmail(mail)
        .then(() => dispatch(resettPassordMailSendt(
            `Link til resetting av passord er sendt til din email: ${mail}. Sjekk i spam-mappen din også, den kan fort ende der`
        )))
        .catch(() => dispatch(resettPassordMailSendt('Noe gikk feil! Sjekk at du har skrevet inn riktig mail og prøv igjen')))
};

export const fetchUsers = () => async dispatch => {
    usersRef.once('value', snapshot => {
        dispatch(mottaBrukere(mapTolist(snapshot).sort((a, b) => a.navn.localeCompare(b.navn))));
    });
};

export const updateLastSeenVersion = (newVersion, userDbKey) => async dispatch => {
    if (userDbKey) {
        usersRef.child(userDbKey).update({lastSeenVersion: newVersion});
    }
    dispatch(setLastSeenVersion(newVersion));
};

export const updateMyMeasumentOnProfile = (userDbKey, newSize, sizeKey) => {
    if (userDbKey) {
        usersRef.child(userDbKey).child("measurements").update({[sizeKey]: newSize});
    }
};

export const logOut = () => async dispatch => {
    auth.signOut().then(function () {
        dispatch(push('/'));
        dispatch(resetAllData());
    }).catch(error => {
        alert(error);
    })
};

export const opprettNyBruker = (brukernavn, passord, firstName, lastName) => async dispatch => {
    const navn = firstName + " " + lastName;
    auth.createUserWithEmailAndPassword(brukernavn, passord)
        .then(() => {
            auth.currentUser.updateProfile({displayName: navn, photoURL: null})
                .then(() => {
                    usersRef.push().set({navn, firstName, lastName, email: brukernavn, uid: auth.currentUser.uid});
                    dispatch(brukerLoggetInn(auth.currentUser));
                    dispatch(push('/minliste'));
                })
        })
        .catch(function (error) {
            alert(error);
        });
};
