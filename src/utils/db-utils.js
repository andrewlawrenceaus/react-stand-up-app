import { get, ref, set } from 'firebase/database';
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
    if (!teams || Object.keys(teams).length === 0) return;

    const uid = await getUserUid();
    if (!uid) return;

    const participantsRef = ref(db, `users/${uid}/participants`);
    const snapshot = await get(participantsRef);
    if (snapshot.exists()) return;

    const newParticipants = {};
    const nameToId = {};

    const updatedTeams = {};
    for (const [teamKey, teamArray] of Object.entries(teams)) {
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

    await writeParticipants(newParticipants);
    await writeTeams(updatedTeams);
}
