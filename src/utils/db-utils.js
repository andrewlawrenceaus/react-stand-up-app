const firebaseUrl = 'https://stand-up-duck-default-rtdb.firebaseio.com/teams.json';

export async function putTeams(teams) {
    await fetch(firebaseUrl, {
        method: 'PUT',
        body: JSON.stringify(teams),
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

export async function getTeams() {
    return await fetch(firebaseUrl, {
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
    });
}

