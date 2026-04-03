# PR Review: feat/participant-access

## Critical

### Token revocation is silently broken

**File:** `database.rules.json:30-33`

The `$token` write rule is:

```json
".write": "auth != null && !auth.token... && auth.uid == newData.child('ownerUID').val()"
```

When `revokeInviteToken` calls `set(tokenRef, null)`, `newData` is null, so `newData.child('ownerUID').val()` returns null, and `auth.uid == null` is always false. The Firebase delete is silently rejected.

The participant's `inviteToken` field gets cleared in the DB (that write targets `users/${uid}/participants/${id}/inviteToken` and succeeds), but the `participantTokens/{token}` entry survives — meaning revoked tokens remain fully valid. A participant can continue joining after revocation.

**Fix:** use `data` (the existing value) when evaluating a delete:

```json
".write": "auth != null && !auth.token.firebase.sign_in_provider.matches('anonymous') && (newData == null ? data.child('ownerUID').val() == auth.uid : auth.uid == newData.child('ownerUID').val())"
```

---

## High

### `participantTokens` is world-readable

**File:** `database.rules.json:28`

```json
"participantTokens": { ".read": true, ... }
```

Anyone — unauthenticated — can read the entire `participantTokens` subtree and enumerate every token alongside its `ownerUID` and `participantId`. Since join links are intended to be shared directly (not publicly indexed), exposing the full mapping to unauthenticated readers is broader than needed.

**Fix:** Scope the read to authenticated users at minimum:

```json
"participantTokens": { ".read": "auth != null", ... }
```

Note: the `JoinPage` flow calls `resolveToken` before signing in anonymously, so the read currently needs to be unauthenticated. If that constraint is real, the alternative is to restructure the join flow to sign in anonymously first, then resolve the token. Otherwise, accepting unauthenticated read should be an explicit documented decision.

---

## Medium

### `signInAnonymously` reuses the existing anonymous user on owner switch

**File:** `src/pages/JoinPage.jsx:46`

When a participant clicks a *different* person's invite link (different `ownerUID`), the `existingSession.ownerUID !== ownerUID` check falls through to:

```js
const { user } = await signInAnonymously(auth);
await writeParticipantSession(user.uid, { ownerUID, participantId, token });
```

Firebase's `signInAnonymously()` returns the *same* anonymous user if one is already signed in — it does not create a new one. So `writeParticipantSession` overwrites the existing session under the same UID with the new owner's data.

This may be intentional (switching sessions by clicking a new link), but it is undocumented and could be surprising. At minimum, add a comment explaining the intent. If truly distinct anonymous identities are needed per owner, `signOut` first before calling `signInAnonymously`.

### `/run-stand-up` is not blocked for participants

**File:** `src/pages/Root.jsx:13`

```js
const PARTICIPANT_BLOCKED_PATHS = ['/', '/manage-teams', '/participants'];
```

Only these three paths are blocked. A participant can navigate to `/run-stand-up` freely. If that is intentional (read-only view is acceptable), add a comment. If not, add the path to `PARTICIPANT_BLOCKED_PATHS`.

### `generateAllInviteTokens` makes sequential DB writes

**File:** `src/utils/db-utils-tokens.js:13-20`

```js
for (const participant of updated) {
    const token = await generateInviteToken(user.uid, participant.id); // sequential
}
```

Each `generateInviteToken` call requires two Firebase writes. For a team of 10 that is 20 serial round-trips. Use `Promise.all` with a `map`:

```js
await Promise.all(
    updated
        .filter(p => !p.inviteToken)
        .map(async p => {
            p.inviteToken = await generateInviteToken(ownerUID, p.id);
        })
);
```

---

## Low / Polish

### Participant sessions are never deletable

**File:** `database.rules.json:36-39`

The `newData.hasChildren([...])` requirement in the session write rule means the anonymous user can never delete their own session — setting to null fails the rule. Sessions accumulate in Firebase indefinitely. The current "Leave" flow (`signOut`) works without needing a delete, but this is worth noting if cleanup is ever desired. Fix by adding an `|| newData == null` condition to allow self-deletion.

### Clipboard errors are swallowed

**File:** `src/components/standup/ShareLinksModal.jsx:18-24`

```js
await navigator.clipboard.writeText(text);
```

`navigator.clipboard.writeText()` can throw (permission denied, non-HTTPS, Firefox private mode, old Safari). There is no try/catch, so failures silently do nothing with no user feedback. Wrap in try/catch and show an error message.

### `generateAllInviteTokens` mutates input objects

**File:** `src/utils/db-utils-tokens.js:16`

```js
participant.inviteToken = token; // mutates the caller's objects
```

The function spreads the array (`[...participants]`) but not the individual objects inside it. The mutation reaches back into the caller's array. The `RunStandUp.jsx` call site spreads the array again at the call site, which does not help since the objects themselves are still shared references. Prefer returning new objects:

```js
updated[i] = { ...participant, inviteToken: token };
```

### No timeout on JoinPage async flow

**File:** `src/pages/JoinPage.jsx`

If `auth.authStateReady()` or the Firebase `resolveToken` read hangs, the user sees "Joining session…" indefinitely with no way out. Consider an `AbortController` or a simple `setTimeout` that sets an error state after a reasonable deadline (e.g. 10 seconds).
