import { get, ref, set, onValue, update } from 'firebase/database';
import { uploadBytes, getDownloadURL, ref as storageRef } from 'firebase/storage';
import { auth, db, storage } from './firebase';

export async function writeTeams(teams) {
    const uid = await getUserUid();
    if (uid) {
        const teamsRef = ref(db, `users/${uid}/teams`);
        set(teamsRef, teams);
    } else {
        console.warn('Attempting to write team while not logged in!');
    }
}

export async function getTeams() {
    let data = {};
    const uid = await getUserUid();
    if (uid) {
        const teamsRef = ref(db, `users/${uid}/teams`);
        await get(teamsRef).then((snapshot) => {
            if (snapshot.exists()) {
                data = snapshot.val();
            } else {
                console.warn('No teams data available');
            }
        });

    } else {
        console.warn('Attempting to get teams while not logged in!');
    }
    return data;
}

async function getUserUid() {
    await auth.authStateReady();
    const user = auth.currentUser;
    return user ? user.uid : null;
}

export async function getParticipants() {
    let data = {};
    const uid = await getUserUid();
    if (uid) {
        const participantsRef = ref(db, `users/${uid}/participants`);
        await get(participantsRef).then((snapshot) => {
            if (snapshot.exists()) {
                data = snapshot.val();
            } else {
                console.warn('No participants data available');
            }
        });
    } else {
        console.warn('Attempting to get participants while not logged in!');
    }
    return data;
}

export async function writeParticipants(participants) {
    const uid = await getUserUid();
    if (uid) {
        const participantsRef = ref(db, `users/${uid}/participants`);
        set(participantsRef, participants);
    } else {
        console.warn('Attempting to write participants while not logged in!');
    }
}

export async function getTeamsAndParticipants() {
    const [teams, participants] = await Promise.all([getTeams(), getParticipants()]);
    return { teams, participants };
}

export async function uploadParticipantPhoto(participantId, file) {
    const uid = await getUserUid();
    const photoRef = storageRef(storage, `participants/${uid}/${participantId}/photo`);
    await uploadBytes(photoRef, file);
    return getDownloadURL(photoRef);
}

export async function migrateParticipantsIfNeeded(teams) {
    if (!teams || Object.keys(teams).length === 0) return false;

    const uid = await getUserUid();
    if (!uid) return false;

    const participantsRef = ref(db, `users/${uid}/participants`);
    const snapshot = await get(participantsRef);
    if (snapshot.exists()) return false;

    const newParticipants = {};
    const nameToId = {};

    const updatedTeams = {};
    for (const [teamKey, teamArray] of Object.entries(teams)) {
        if (!Array.isArray(teamArray)) {
            updatedTeams[teamKey] = teamArray;
            continue;
        }
        updatedTeams[teamKey] = teamArray.map((value) => {
            if (typeof value !== 'string') return value;
            if (!nameToId[value]) {
                const id = crypto.randomUUID();
                nameToId[value] = id;
                newParticipants[id] = { id, name: value, photoUrl: '' };
            }
            return nameToId[value];
        });
    }

    if (Object.keys(newParticipants).length === 0) return false;

    await writeParticipants(newParticipants);
    await writeTeams(updatedTeams);
    return true;
}

// --- Retro Functions ---

export function subscribeToActiveRetro(teamName, callback) {
    const uid = auth.currentUser?.uid;
    if (!uid) {
        console.warn('Attempting to subscribe to retro while not logged in!');
        return () => {};
    }
    const activeRef = ref(db, `users/${uid}/retros/${teamName}/active`);
    return onValue(activeRef, (snapshot) => {
        callback(snapshot.exists() ? snapshot.val() : null);
    });
}

export async function createRetro(teamName, { categories, timerDuration }) {
    const uid = await getUserUid();
    if (!uid) return;
    const activeRef = ref(db, `users/${uid}/retros/${teamName}/active`);
    await set(activeRef, {
        startedAt: Date.now(),
        timerDuration: timerDuration || null,
        timerStartedAt: null,
        categories,
        items: false,
    });
}

export async function completeRetro(teamName) {
    const uid = await getUserUid();
    if (!uid) return;
    const activeRef = ref(db, `users/${uid}/retros/${teamName}/active`);
    const snapshot = await get(activeRef);
    if (!snapshot.exists()) return;
    const retroData = snapshot.val();
    const dateString = new Date().toISOString().split('T')[0];
    const userRef = ref(db, `users/${uid}`);
    await update(userRef, {
        [`retros/${teamName}/active`]: null,
        [`retros/${teamName}/history/${dateString}`]: {
            ...retroData,
            completedAt: Date.now(),
        },
    });
}

export async function addRetroCategory(teamName, category) {
    const uid = await getUserUid();
    if (!uid) return;
    const catRef = ref(db, `users/${uid}/retros/${teamName}/active/categories/${category.id}`);
    await set(catRef, category);
}

export async function updateRetroCategory(teamName, categoryId, updates) {
    const uid = await getUserUid();
    if (!uid) return;
    const catRef = ref(db, `users/${uid}/retros/${teamName}/active/categories/${categoryId}`);
    const snapshot = await get(catRef);
    if (!snapshot.exists()) return;
    await set(catRef, { ...snapshot.val(), ...updates });
}

export async function removeRetroCategory(teamName, categoryId) {
    const uid = await getUserUid();
    if (!uid) return;
    const userRef = ref(db, `users/${uid}`);
    const itemsRef = ref(db, `users/${uid}/retros/${teamName}/active/items`);
    const snapshot = await get(itemsRef);
    const updates = {
        [`retros/${teamName}/active/categories/${categoryId}`]: null,
    };
    if (snapshot.exists()) {
        const items = snapshot.val();
        for (const [itemId, item] of Object.entries(items)) {
            if (item.categoryId === categoryId) {
                updates[`retros/${teamName}/active/items/${itemId}`] = null;
            }
        }
    }
    await update(userRef, updates);
}

export async function addRetroItem(teamName, item) {
    const uid = await getUserUid();
    if (!uid) return;
    const itemRef = ref(db, `users/${uid}/retros/${teamName}/active/items/${item.id}`);
    await set(itemRef, item);
}

export async function updateRetroItem(teamName, itemId, text) {
    const uid = await getUserUid();
    if (!uid) return;
    const itemRef = ref(db, `users/${uid}/retros/${teamName}/active/items/${itemId}`);
    const snapshot = await get(itemRef);
    if (!snapshot.exists()) return;
    await set(itemRef, { ...snapshot.val(), text });
}

export async function removeRetroItem(teamName, itemId) {
    const uid = await getUserUid();
    if (!uid) return;
    const itemRef = ref(db, `users/${uid}/retros/${teamName}/active/items/${itemId}`);
    await set(itemRef, null);
}

export async function clearItemsByCategory(teamName, categoryId) {
    const uid = await getUserUid();
    if (!uid) return;
    const itemsRef = ref(db, `users/${uid}/retros/${teamName}/active/items`);
    const snapshot = await get(itemsRef);
    if (!snapshot.exists()) return;
    const items = snapshot.val();
    const userRef = ref(db, `users/${uid}`);
    const updates = {};
    for (const [itemId, item] of Object.entries(items)) {
        if (item.categoryId === categoryId) {
            updates[`retros/${teamName}/active/items/${itemId}`] = null;
        }
    }
    if (Object.keys(updates).length > 0) {
        await update(userRef, updates);
    }
}

export async function clearAllItemsExceptCategory(teamName, protectedCategoryId) {
    const uid = await getUserUid();
    if (!uid) return;
    const itemsRef = ref(db, `users/${uid}/retros/${teamName}/active/items`);
    const snapshot = await get(itemsRef);
    if (!snapshot.exists()) return;
    const items = snapshot.val();
    const userRef = ref(db, `users/${uid}`);
    const updates = {};
    for (const [itemId, item] of Object.entries(items)) {
        if (item.categoryId !== protectedCategoryId) {
            updates[`retros/${teamName}/active/items/${itemId}`] = null;
        }
    }
    if (Object.keys(updates).length > 0) {
        await update(userRef, updates);
    }
}

export async function toggleAgree(teamName, itemId, participantId) {
    const uid = await getUserUid();
    if (!uid) return;
    const agreeRef = ref(db, `users/${uid}/retros/${teamName}/active/items/${itemId}/agreedBy/${participantId}`);
    const snapshot = await get(agreeRef);
    await set(agreeRef, snapshot.exists() ? null : true);
}

export async function updateRetroTimer(teamName, timerUpdates) {
    const uid = await getUserUid();
    if (!uid) return;
    const activeRef = ref(db, `users/${uid}/retros/${teamName}/active`);
    const snapshot = await get(activeRef);
    if (!snapshot.exists()) return;
    const userRef = ref(db, `users/${uid}`);
    const updates = {};
    for (const [key, value] of Object.entries(timerUpdates)) {
        updates[`retros/${teamName}/active/${key}`] = value;
    }
    await update(userRef, updates);
}

export async function getPreviousRetro(teamName) {
    const uid = await getUserUid();
    if (!uid) return null;
    const historyRef = ref(db, `users/${uid}/retros/${teamName}/history`);
    const snapshot = await get(historyRef);
    if (!snapshot.exists()) return null;
    const history = snapshot.val();
    const dates = Object.keys(history).sort();
    const latestDate = dates[dates.length - 1];
    return { date: latestDate, ...history[latestDate] };
}
