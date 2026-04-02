import { useEffect, useState, createContext } from "react";
import { auth } from "../../utils/firebase";
import { readParticipantSession } from "../../utils/db-utils-tokens";

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(auth.currentUser);
    const [participantSession, setParticipantSession] = useState(null);
    const [sessionLoading, setSessionLoading] = useState(true);

    useEffect(() => {
        return auth.onAuthStateChanged(async (u) => {
            setUser(u);
            if (u?.isAnonymous) {
                const session = await readParticipantSession(u.uid);
                setParticipantSession(session);
            } else {
                setParticipantSession(null);
            }
            setSessionLoading(false);
        });
    }, []);

    const isParticipant = !!user?.isAnonymous && !!participantSession;

    return (
        <AuthContext.Provider value={{ user, isParticipant, participantSession, sessionLoading }}>
            {children}
        </AuthContext.Provider>
    );
}
