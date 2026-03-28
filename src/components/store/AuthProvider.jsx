import { useEffect, useState, createContext } from "react";
import { auth } from "../../utils/firebase";

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(auth.currentUser);

    useEffect(() => {
        auth.onAuthStateChanged(setUser);
    }, []);

    return (
        <AuthContext.Provider value={{user}}>{children}</AuthContext.Provider>
    )
}