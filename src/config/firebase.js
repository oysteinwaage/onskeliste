import firebase from "firebase/app";
import 'firebase/database';
import 'firebase/auth'

import { FirebaseConfig } from './keys';

firebase.initializeApp(FirebaseConfig);
const databaseRef = firebase.database().ref();

export const db = firebase.database();

// Users
export const usersRef = db.ref('users');

// Wishlist
export const wishlistRef = listId => db.ref('wishlists/' + listId);
export const myWishlistRef = () => wishlistRef(myUid());

// AllowedUsers
export const allowedViewersRef = listId => db.ref('allowedViewers/' + listId);
export const myAllowedViewersRef = () => db.ref('allowedViewers/' + myUid());
export const allowedViewsRef = databaseRef.child('allowedViewers');

// Authentication/signed in user
export const auth = firebase.auth();
export const myUid = () => firebase.auth().currentUser && firebase.auth().currentUser.uid;
