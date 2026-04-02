import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { resolveToken, writeParticipantSession, readParticipantSession } from '../utils/db-utils-tokens';

export default function JoinPage() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        async function join() {
            await auth.authStateReady();
            const currentUser = auth.currentUser;

            // Team lead (non-anonymous) accidentally clicked the link
            if (currentUser && !currentUser.isAnonymous) {
                navigate('/', { replace: true });
                return;
            }

            // Resolve the token (public read — no auth required)
            const tokenData = await resolveToken(token);
            if (!tokenData) {
                if (!cancelled) setError('This invite link is invalid or has been revoked.');
                return;
            }

            const { ownerUID, participantId } = tokenData;

            // Anonymous user returning — if they already have a valid session, skip re-auth
            if (currentUser?.isAnonymous) {
                const existingSession = await readParticipantSession(currentUser.uid);
                if (existingSession && existingSession.ownerUID === ownerUID) {
                    navigate('/retro', { replace: true });
                    return;
                }
            }

            // Sign in anonymously and write the session
            const { user } = await signInAnonymously(auth);
            await writeParticipantSession(user.uid, { ownerUID, participantId, token });

            if (!cancelled) navigate('/retro', { replace: true });
        }

        join().catch((err) => {
            console.error('Join error:', err);
            if (!cancelled) setError('Something went wrong. Please try again.');
        });

        return () => { cancelled = true; };
    }, [token, navigate]);

    if (error) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '1.25rem', color: '#d32f2f' }}>{error}</p>
                <p style={{ color: '#666' }}>Ask your team lead to generate a new invite link.</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <p style={{ fontSize: '1.25rem', color: '#666' }}>Joining session…</p>
        </div>
    );
}
