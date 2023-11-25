import { get, ref, set } from 'firebase/database';
import { auth, db } from './firebase';

export async function writeTeams(teams) {
    const uid = getUserUid();
    if (uid) {
        const teamsRef = ref(db, `${uid}/teams`);
        set(teamsRef, teams);
    } else {
        console.warn('Attempting to write team while not logged in!');
    }
}

export async function getTeams() {
    let data = {};
    const uid = await getUserUid();
    if (uid) {
        const teamsRef = ref(db, `${uid}/teams`);
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
