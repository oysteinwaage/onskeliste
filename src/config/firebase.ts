import firebase from "firebase/compat/app";
import 'firebase/compat/database';
import 'firebase/compat/auth';

import { FirebaseConfig } from './keys';

firebase.initializeApp(FirebaseConfig);
const databaseRef = firebase.database().ref();

export const db = firebase.database();

// Users
export const usersRef = db.ref('users');

// Wishlist
export const wishlistRef = (listId: string) => db.ref('wishlists/' + listId);
export const myWishlistRef = () => wishlistRef(myUid() as string);

// AllowedUsers
export const allowedViewersRef = (listId: string) => db.ref('allowedViewers/' + listId);
export const myAllowedViewersRef = () => db.ref('allowedViewers/' + myUid());
export const allowedViewsRef = databaseRef.child('allowedViewers');

// Ekstra kjøp (purchases outside the wishlist)
export const ekstraKjoepRef = (ownerUid: string, targetUid: string) => db.ref(`ekstraKjoep/${ownerUid}/${targetUid}`);
export const myEkstraKjoepRef = () => db.ref(`ekstraKjoep/${myUid()}`);

// Admin config
export const adminConfigRef = db.ref('config');

// Authentication/signed in user
export const auth = firebase.auth();
export const myUid = (): string | null => firebase.auth().currentUser ? firebase.auth().currentUser!.uid : null;
