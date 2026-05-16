import { push } from 'connected-react-router';
import {
    adminConfigRef,
    allowedViewsRef,
    auth,
    db,
    ekstraKjoepRef,
    extraListRef,
    extraListWishesRef,
    feedbackRef,
    myAllowedViewersRef,
    myEkstraKjoepRef,
    myUid,
    myUserExtraListsRef,
    myWishlistRef,
    userExtraListsRef,
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
    settMineEkstraKjoep,
    setSlettKjopteOnskerEnabled,
    setTilbakemeldingEnabled,
    mottaMineEkstraLister,
    oppdaterEkstraListeMetadata,
    mottaEkstraListeOnsker,
    fjernEkstraListeOnsker,
    mottaValgtVennsEkstraLister,
    mottaValgtVennsEkstraListeOnsker,
    settValgtVennsListeId,
    oppdaterMineEkstraListeKjoep,
    settHovedListeNavn,
    mottaFeedback,
    settUlesteFeedback,
} from "./actions/actions";
import { opprettUrlAv } from "./utils/util";
import { Onske, Viewer, ExtraListMetadata, Bruker, Feedback } from './types';
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

export const updateFavorittWithSortOrder = (
    wishId: string,
    erFavoritt: boolean,
    sortOrder: number,
    listId: string | null
): void => {
    if (listId) {
        extraListWishesRef(listId).child(wishId).update({ favoritt: erFavoritt, sortOrder });
    } else {
        myWishlistRef().child(wishId).update({ favoritt: erFavoritt, sortOrder });
    }
};

export const updateSortOrderBatch = (
    wishes: Array<{ key: string; sortOrder: number }>,
    listId: string | null
): void => {
    wishes.forEach(({ key, sortOrder }) => {
        if (listId) {
            extraListWishesRef(listId).child(key).update({ sortOrder });
        } else {
            myWishlistRef().child(key).update({ sortOrder });
        }
    });
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

export const addEkstraKjoepForBruker = (targetUid: string, kjoep: { onskeTekst: string; antall: number; url?: string; pris?: number }): void => {
    const uid = myUid();
    if (!uid) return;
    ekstraKjoepRef(uid, targetUid).push().set(kjoep);
};

export const removeEkstraKjoepForBruker = (targetUid: string, kjoepKey: string): void => {
    const uid = myUid();
    if (!uid) return;
    ekstraKjoepRef(uid, targetUid).child(kjoepKey).remove();
};

export const updateEkstraKjoepPris = (targetUid: string, itemKey: string, pris: number | null): void => {
    const uid = myUid();
    if (!uid) return;
    ekstraKjoepRef(uid, targetUid).child(itemKey).update({ pris: pris ?? null });
};

export const updateVanligKjoepPris = (targetUid: string, wish: Onske, pris: number | null): void => {
    const uid = myUid();
    if (!uid) return;
    const updatedKjoptAvListe = (wish.kjoptAvListe || []).map(entry =>
        entry.kjoptAv === uid ? { ...entry, pris: pris !== null ? pris : undefined } : entry
    );
    wishlistRef(targetUid).child(wish.key).update({ kjoptAvListe: updatedKjoptAvListe });
};

export const fetchListsIAmAllowedToView = () => async (dispatch: Dispatch) => {
    allowedViewsRef.once('value', res => {
        const allLists = res.val();
        const myLists: string[] = allLists ?
            Object.keys(allLists).filter(groupId => allLists[groupId].find((member: any) => member && member.value === myUid())).map(k => {
                return k;
            }) : [];
        dispatch(receiveMyFriendLists(myLists));

        myLists.forEach(brukerUid => {
            wishlistRef(brukerUid).on("value", snapshot => {
                const onsker = snapshot.val();
                const onskerTatt = Object.keys(onsker || {})
                    .filter(k => onsker[k].kjoptAvListe && onsker[k].kjoptAvListe.find((i: any) => i.kjoptAv === myUid()))
                    .map(k => ({ ...onsker[k], key: k }));
                dispatch(oppdaterMineKjoep(brukerUid, onskerTatt));
            });
        });

        myEkstraKjoepRef().on('value', snapshot => {
            const data = snapshot.val() || {};
            const ekstraKjoep: Record<string, Onske[]> = {};
            Object.keys(data).forEach(targetUid => {
                const items = data[targetUid];
                ekstraKjoep[targetUid] = items
                    ? Object.keys(items).map(k => ({ ...items[k], key: k }))
                    : [];
            });
            dispatch(settMineEkstraKjoep(ekstraKjoep));
        });

        dispatch(fetchEkstraListeKjoepForFriends(myLists) as any);

        return myLists;
    });
};

export const fetchEkstraListeKjoepForFriends = (friendUids: string[]) => async (dispatch: Dispatch) => {
    const myUidValue = myUid();
    if (!myUidValue) return;

    for (const friendUid of friendUids) {
        const snap = await userExtraListsRef(friendUid).once('value');
        const listIds: string[] = snap.val() ? Object.keys(snap.val()) : [];

        for (const listId of listIds) {
            if (ekstraListeKjoepSubscriptions[listId]) continue;
            ekstraListeKjoepSubscriptions[listId] = true;

            const metaSnap = await extraListRef(listId).once('value');
            const meta = metaSnap.val();
            if (!meta) continue;

            const ownerUid: string = meta.ownerUid;
            const listName: string = meta.name;
            const sharedWithUid: string | undefined = meta.sharedWithUid;

            extraListWishesRef(listId).on('value', (wishSnap: any) => {
                const alle = mapTolist(wishSnap);
                const mine = alle.filter(w =>
                    (w.kjoptAvListe || []).some((e: any) => e.kjoptAv === myUidValue)
                );
                dispatch(oppdaterMineEkstraListeKjoep(ownerUid, listId, listName, mine, sharedWithUid));
            });
        }
    }
};

export const updateEkstraListeWishPris = (listId: string, wish: Onske, pris: number | null): void => {
    const uid = myUid();
    if (!uid) return;
    const updatedKjoptAvListe = (wish.kjoptAvListe || []).map((entry: any) =>
        entry.kjoptAv === uid ? { ...entry, pris: pris !== null ? pris : undefined } : entry
    );
    extraListWishesRef(listId).child(wish.key).update({ kjoptAvListe: updatedKjoptAvListe });
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
        const brukere: Bruker[] = mapTolist(snapshot).sort((a: Bruker, b: Bruker) => a.navn.localeCompare(b.navn));
        dispatch(mottaBrukere(brukere));
        const uid = myUid();
        const meg = brukere.find((b: Bruker) => b.uid === uid);
        if (meg?.erAdmin) {
            dispatch(subscribeTilFeedback() as any);
        }
    });
};

export const updateLastSeenVersion = (newVersion: number, userDbKey: string) => async (dispatch: Dispatch) => {
    if (userDbKey) {
        usersRef.child(userDbKey).update({ lastSeenVersion: newVersion });
    }
    dispatch(setLastSeenVersion(newVersion));
};

export const updateMainListName = (userDbKey: string, navn: string) => async (dispatch: Dispatch) => {
    if (userDbKey) {
        await usersRef.child(userDbKey).update({ mainListName: navn || null });
    }
    dispatch(settHovedListeNavn(navn));
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
        dispatch(setTilbakemeldingEnabled(!!config.tilbakemeldingEnabled));
    });
};

export const setSlettKjopteOnskerEnabledApi = (enabled: boolean): void => {
    adminConfigRef.update({ slettKjopteOnskerEnabled: enabled });
};

export const setTilbakemeldingEnabledApi = (enabled: boolean) => (dispatch: Dispatch) => {
    adminConfigRef.update({ tilbakemeldingEnabled: enabled });
    dispatch(setTilbakemeldingEnabled(enabled));
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

/*
EXTRA LISTS
 */
let currentVennsExtraListRef: any = null;
const extraListSubscriptions: Record<string, boolean> = {};
const extraListMetaSubscriptions: Record<string, boolean> = {};
const vennsExtraListSubscriptions: Record<string, any> = {};
const ekstraListeKjoepSubscriptions: Record<string, boolean> = {};

export const fetchMineEkstraLister = () => async (dispatch: Dispatch) => {
    const uid = myUid();
    if (!uid) return;
    userExtraListsRef(uid).on('value', async snapshot => {
        const listIds = snapshot.val() ? Object.keys(snapshot.val()) : [];
        if (listIds.length === 0) {
            Object.keys(extraListSubscriptions).forEach(id => {
                extraListWishesRef(id).off('value');
                delete extraListSubscriptions[id];
                dispatch(fjernEkstraListeOnsker(id));
            });
            dispatch(mottaMineEkstraLister([]));
            return;
        }
        const lists = await Promise.all(listIds.map(id =>
            extraListRef(id).once('value').then(snap =>
                snap.val() ? { ...snap.val(), key: id } as ExtraListMetadata : null
            )
        ));
        const validLists = lists.filter(Boolean) as ExtraListMetadata[];
        dispatch(mottaMineEkstraLister(validLists));

        // Subscribe to wishes and metadata for any new list
        validLists.forEach(liste => {
            if (!extraListSubscriptions[liste.key]) {
                extraListSubscriptions[liste.key] = true;
                extraListWishesRef(liste.key).on('value', (snap: any) => {
                    dispatch(mottaEkstraListeOnsker(liste.key, mapTolist(snap)));
                });
            }
            if (!extraListMetaSubscriptions[liste.key]) {
                extraListMetaSubscriptions[liste.key] = true;
                extraListRef(liste.key).on('value', (snap: any) => {
                    if (snap.val()) {
                        dispatch(oppdaterEkstraListeMetadata({ ...snap.val(), key: liste.key }));
                    }
                });
            }
        });

        // Unsubscribe from lists no longer present
        const validIds = validLists.map(l => l.key);
        Object.keys(extraListSubscriptions).forEach(id => {
            if (!validIds.includes(id)) {
                extraListWishesRef(id).off('value');
                delete extraListSubscriptions[id];
                dispatch(fjernEkstraListeOnsker(id));
            }
        });
        Object.keys(extraListMetaSubscriptions).forEach(id => {
            if (!validIds.includes(id)) {
                extraListRef(id).off('value');
                delete extraListMetaSubscriptions[id];
            }
        });
    });
};

export const opprettEkstraListe = (name: string, sharedWithUid?: string) => async (_dispatch: Dispatch) => {
    const uid = myUid();
    if (!uid) return;
    const newListRef = db.ref('extraLists').push();
    const listId = newListRef.key as string;
    const metadata: Omit<ExtraListMetadata, 'key'> = { name, ownerUid: uid };
    if (sharedWithUid) (metadata as any).sharedWithUid = sharedWithUid;
    await extraListRef(listId).set(metadata);
    await myUserExtraListsRef().update({ [listId]: true });
    if (sharedWithUid) {
        await userExtraListsRef(sharedWithUid).update({ [listId]: true });
    }
};

export const slettEkstraListe = (listId: string, sharedWithUid?: string) => async (_dispatch: Dispatch) => {
    const uid = myUid();
    if (!uid) return;
    if (extraListSubscriptions[listId]) {
        extraListWishesRef(listId).off('value');
        delete extraListSubscriptions[listId];
    }
    if (extraListMetaSubscriptions[listId]) {
        extraListRef(listId).off('value');
        delete extraListMetaSubscriptions[listId];
    }
    await extraListRef(listId).remove();
    await myUserExtraListsRef().child(listId).remove();
    if (sharedWithUid) {
        await userExtraListsRef(sharedWithUid).child(listId).remove();
    }
};

export const leggTilDelingspartner = async (listId: string, shareWithUid: string): Promise<void> => {
    await extraListRef(listId).update({ sharedWithUid: shareWithUid });
    await userExtraListsRef(shareWithUid).update({ [listId]: true });
};

export const fjernDelingspartner = async (listId: string, shareWithUid: string): Promise<void> => {
    const snapshot = await extraListRef(listId).once('value');
    const data = snapshot.val();
    if (data) {
        const { sharedWithUid: _removed, ...rest } = data;
        await extraListRef(listId).set(rest);
    }
    await userExtraListsRef(shareWithUid).child(listId).remove();
};

export const oppdaterEkstraListeNavn = async (listId: string, name: string): Promise<void> => {
    await extraListRef(listId).update({ name });
};

export const addWishToExtraList = (listId: string, newWish: Omit<Onske, 'key'>): void => {
    extraListWishesRef(listId).push().set(newWish);
};

export const removeWishFromExtraList = (listId: string, wishId: string): void => {
    extraListWishesRef(listId).child(wishId).remove();
};

export const updateWishFieldsOnExtraList = (listId: string, wishId: string, updates: Partial<Omit<Onske, 'key'>>): void => {
    extraListWishesRef(listId).child(wishId).update(updates);
};

export const updateWishOnExtraListWith = (newValues: Partial<Onske>, wish: Onske, listId: string): void => {
    const wishKey = wish.key;
    const wishWithoutKey = { ...wish };
    delete (wishWithoutKey as any).key;
    extraListWishesRef(listId).child(wishKey).update(Object.assign({}, wishWithoutKey, newValues));
};


export const fetchExtraListsForFriend = (friendUid: string) => async (dispatch: Dispatch) => {
    Object.keys(vennsExtraListSubscriptions).forEach(id => {
        vennsExtraListSubscriptions[id].off('value');
        delete vennsExtraListSubscriptions[id];
    });

    const myUidValue = myUid();
    const snapshot = await userExtraListsRef(friendUid).once('value');
    const listIds = snapshot.val() ? Object.keys(snapshot.val()) : [];
    if (listIds.length === 0) {
        dispatch(mottaValgtVennsEkstraLister([]));
        return;
    }
    const lists = await Promise.all(listIds.map(id =>
        extraListRef(id).once('value').then(snap =>
            snap.val() ? { ...snap.val(), key: id } as ExtraListMetadata : null
        )
    ));
    const visible = lists.filter(
        l => l && l.ownerUid !== myUidValue && l.sharedWithUid !== myUidValue
    ) as ExtraListMetadata[];
    dispatch(mottaValgtVennsEkstraLister(visible));

    visible.forEach(liste => {
        const ref = extraListWishesRef(liste.key);
        vennsExtraListSubscriptions[liste.key] = ref;
        ref.on('value', (snap: any) => {
            dispatch(mottaValgtVennsEkstraListeOnsker(liste.key, mapTolist(snap)));
        });
    });
};

export const fetchVennsEkstraListeOnsker = (listId: string, venn: Partial<Bruker>) => async (dispatch: Dispatch) => {
    if (currentVennsExtraListRef) {
        currentVennsExtraListRef.off('value');
        currentVennsExtraListRef = null;
    }
    currentVennsExtraListRef = extraListWishesRef(listId);
    currentVennsExtraListRef.on('value', (snapshot: any) => {
        dispatch(mottaValgtVennsListe(mapTolist(snapshot), venn));
    });
    dispatch(settValgtVennsListeId(listId));
};

export const forlateEkstraListe = async (listId: string): Promise<void> => {
    const uid = myUid();
    if (!uid) return;
    await fjernDelingspartner(listId, uid);
};

export const slettKjopteOnskerPaaEkstraListe = (listId: string, onsker: Onske[]): void => {
    onsker.forEach(onske => {
        const kjoptAvListe = onske.kjoptAvListe || [];
        if (kjoptAvListe.length === 0) return;
        const totalKjopt = kjoptAvListe.reduce((sum, k) => sum + (k.antallKjopt || 1), 0);
        const antall = onske.antall || 1;
        if (totalKjopt >= antall) {
            extraListWishesRef(listId).child(onske.key).remove();
        } else {
            extraListWishesRef(listId).child(onske.key).update({ antall: antall - totalKjopt, kjoptAvListe: null });
        }
    });
};

export const deleteMyAccount = (userDbKey: string) => async (dispatch: Dispatch) => {
    const uid = myUid();
    if (!uid) return;

    // Delete extra lists owned by this user
    const extraListsSnap = await userExtraListsRef(uid).once('value');
    const extraListVal = extraListsSnap.val();
    if (extraListVal) {
        await Promise.all(Object.keys(extraListVal).map(listId => extraListRef(listId).remove()));
    }

    // Delete all user data nodes
    await Promise.all([
        userExtraListsRef(uid).remove(),
        myWishlistRef().remove(),
        myAllowedViewersRef().remove(),
        userDbKey ? usersRef.child(userDbKey).remove() : Promise.resolve(),
    ]);

    // Delete Firebase Auth account (requires recent login)
    try {
        await auth.currentUser!.delete();
    } catch (error: any) {
        if (error.code === 'auth/requires-recent-login') {
            alert('Av sikkerhetsgrunner må du logge ut og inn igjen før du kan slette kontoen din.');
            return;
        }
        throw error;
    }

    dispatch(push('/'));
    dispatch(resetAllData());
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
                    dispatch(push('/onboarding'));
                })
        })
        .catch(function (error: any) {
            alert(error);
        });
};

export const setOnboardingCompleted = (measurements: Record<string, string>, lastSeenVersion: number) => async (dispatch: Dispatch) => {
    const uid = myUid();
    const snapshot = await usersRef.orderByChild('uid').equalTo(uid).once('value');
    const val = snapshot.val();
    if (val) {
        const key = Object.keys(val)[0];
        const updates: Record<string, any> = { onboardingCompleted: true, lastSeenVersion };
        Object.entries(measurements).forEach(([sizeKey, value]) => {
            if (value.trim()) updates[`measurements/${sizeKey}`] = value;
        });
        await usersRef.child(key).update(updates);
    }
    dispatch(push('/minliste'));
};

// Feedback
export const sendFeedback = async (tekst: string, brukerUid: string, brukerNavn: string): Promise<void> => {
    await feedbackRef.push({
        tekst,
        timestamp: Date.now(),
        brukerUid,
        brukerNavn,
        lest: false,
    });
};

export const subscribeTilFeedback = () => (dispatch: Dispatch) => {
    feedbackRef.on('value', (snap: any) => {
        const data = snap.val();
        if (!data) {
            dispatch(mottaFeedback([]));
            dispatch(settUlesteFeedback(0));
            return;
        }
        const feedback: Feedback[] = Object.entries(data).map(([key, val]: [string, any]) => ({
            key,
            ...val,
        }));
        dispatch(mottaFeedback(feedback));
        dispatch(settUlesteFeedback(feedback.filter(f => !f.lest).length));
    });
};

export const slettFeedback = async (feedbackKey: string): Promise<void> => {
    await feedbackRef.child(feedbackKey).remove();
};

export const markerAlleFeedbackSomLest = async (): Promise<void> => {
    const snap = await feedbackRef.once('value');
    const data = snap.val();
    if (!data) return;
    const updates: Record<string, boolean> = {};
    Object.keys(data).forEach(key => {
        if (!data[key].lest) {
            updates[`${key}/lest`] = true;
        }
    });
    if (Object.keys(updates).length > 0) {
        await feedbackRef.update(updates);
    }
};
