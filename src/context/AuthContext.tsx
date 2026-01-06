import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    verifyBeforeUpdateEmail,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUserEmail: (email: string) => Promise<void>;
    updateUserPassword: (password: string) => Promise<void>;
    reauthenticate: (password: string) => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Auto-logout after 30 minutes of inactivity
    useEffect(() => {
        if (!user) return;

        const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
        let timeoutId: number;

        const resetTimeout = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                console.log('🔒 Sesión cerrada por inactividad');
                logout();
            }, INACTIVITY_TIMEOUT);
        };

        // Events that indicate user activity
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

        // Reset timeout on any activity
        events.forEach(event => {
            window.addEventListener(event, resetTimeout);
        });

        // Start the initial timeout
        resetTimeout();

        // Cleanup
        return () => {
            clearTimeout(timeoutId);
            events.forEach(event => {
                window.removeEventListener(event, resetTimeout);
            });
        };
    }, [user]);

    const login = async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error: any) {
            throw new Error(error.message);
        }
    };

    const logout = async () => {
        await signOut(auth);
    };

    const updateUserEmail = async (email: string) => {
        if (!auth.currentUser) throw new Error('No authenticated user');
        await verifyBeforeUpdateEmail(auth.currentUser, email);
    };

    const updateUserPassword = async (password: string) => {
        if (!auth.currentUser) throw new Error('No authenticated user');
        await updatePassword(auth.currentUser, password);
    };

    const reauthenticate = async (password: string) => {
        if (!auth.currentUser || !auth.currentUser.email) throw new Error('No authenticated user');
        const credential = EmailAuthProvider.credential(auth.currentUser.email, password);
        await reauthenticateWithCredential(auth.currentUser, credential);
    };

    const refreshUser = async () => {
        if (auth.currentUser) {
            await auth.currentUser.reload();
            // Force state update by creating a new object reference if needed of just triggering setUser
            // checking 'currentUser' again ensures we get fresh data
            setUser({ ...auth.currentUser } as User);
        }
    };

    const value = {
        user,
        loading,
        login,
        logout,
        updateUserEmail,
        updateUserPassword,
        reauthenticate,
        refreshUser
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
