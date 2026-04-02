import { get, ref, set, update } from 'firebase/database';
import { db } from './firebase';

export async function generateInviteToken(ownerUID, participantId) {
    const token = crypto.randomUUID();
    const tokenRef = ref(db, `participantTokens/${token}`);
    await set(tokenRef, { ownerUID, participantId });
    const participantRef = ref(db, `users/${ownerUID}/participants/${participantId}/inviteToken`);
    await set(participantRef, token);
    return token;
}

export async function generateAllInviteTokens(ownerUID, participants) {
    const updated = [...participants];
    for (const participant of updated) {
        if (!participant.inviteToken) {
            const token = await generateInviteToken(ownerUID, participant.id);
            participant.inviteToken = token;
        }
    }
    return updated;
}

export async function revokeInviteToken(ownerUID, participantId, token) {
    const tokenRef = ref(db, `participantTokens/${token}`);
    await set(tokenRef, null);
    const participantRef = ref(db, `users/${ownerUID}/participants/${participantId}/inviteToken`);
    await set(participantRef, null);
}

export async function resolveToken(token) {
    const tokenRef = ref(db, `participantTokens/${token}`);
    const snapshot = await get(tokenRef);
    if (!snapshot.exists()) return null;
    return snapshot.val();
}

export async function writeParticipantSession(anonymousUID, { ownerUID, participantId, token }) {
    const sessionRef = ref(db, `participantSessions/${anonymousUID}`);
    await set(sessionRef, { ownerUID, participantId, token });
}

export async function readParticipantSession(anonymousUID) {
    const sessionRef = ref(db, `participantSessions/${anonymousUID}`);
    const snapshot = await get(sessionRef);
    if (!snapshot.exists()) return null;
    return snapshot.val();
}
