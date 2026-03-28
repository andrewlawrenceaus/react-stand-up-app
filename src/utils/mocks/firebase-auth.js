/**
 * Mock replacement for the 'firebase/auth' package used in E2E tests.
 * Delegates all auth operations to the mock auth object in ./firebase.js
 */
import { auth } from './firebase.js'

export function getAuth() {
  return auth
}

export function signOut() {
  return auth._signOut()
}

export function signInWithEmailAndPassword(_auth, email) {
  return auth._signIn(email)
}

export function createUserWithEmailAndPassword(_auth, email) {
  return auth._signIn(email)
}

export function onAuthStateChanged(_auth, callback) {
  return auth.onAuthStateChanged(callback)
}
