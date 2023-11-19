import { get, ref, set } from "firebase/database";
import { db } from "./firebase";


export async function writeTeams(teams) {
    const teamsRef = ref(db, 'teams/');
    set(teamsRef, teams);
}

export async function getTeams() {
    const teamsRef = ref(db, 'teams/');
    let data = {};
    await get(teamsRef).then((snapshot) => {
        if (snapshot.exists()){
            data = snapshot.val();
        } else {
            console.warn('No teams data available');
        }
    })
    return data;
}