'use client'

import React, {
    createContext,
    useContext,
    useState,
    useMemo,
    useCallback,
    ReactNode,
} from 'react';
import { FirebaseError } from 'firebase/app';
import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signInWithPopup,
    User,
} from "firebase/auth";
import { auth } from '../firebase';
// import axios from 'axios';

interface AuthContextType {
    authError: string;
    isAuthLoading: boolean;
    user: User | null;
    createUserAccount: (email: string, password: string) => Promise<void>;
    logIn: (email: string, password: string) => Promise<void>;
    logInWithGoogle: () => Promise<void>;
    // logInServer: () => Promise<boolean>;
    // logInWithGoogleServer: () => Promise<boolean>;
    sendPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [authError, setAuthError] = useState<string>('');
    const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);
    const [user, setUser] = useState<null | User>(null);

    const handleError = useCallback((error: unknown) => {
        if (error instanceof FirebaseError) {
            switch (error.code) {
                case 'auth/invalid-credential':
                    setAuthError('Invalid credentials provided');
                    break;
                case 'auth/email-already-in-use':
                    setAuthError('Email already in use');
                    break;
                case 'auth/invalid-email':
                    setAuthError('Invalid email address');
                    break;
                case 'auth/operation-not-allowed':
                    setAuthError('Operation not allowed');
                    break;
                case 'auth/weak-password':
                    setAuthError('The password is too weak');
                    break;
                case 'auth/too-many-requests':
                    setAuthError('Access temporarily disabled due to many failed attempts');
                    break;
                default:
                    setAuthError('Unknown FirebaseError, error.code: ' + error.code);
            }
        } else {
            setAuthError('' + error);
        }
    }, []);

    const createUserAccount = useCallback(async (email: string, password: string): Promise<void> => {
        setIsAuthLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await sendEmailVerification(userCredential.user);
        } catch (error) {
            handleError(error);
        } finally {
            setIsAuthLoading(false);
        }
    }, [handleError]);

    const logIn = useCallback(async (email: string, password: string): Promise<void> => {
        setIsAuthLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            setUser(userCredential.user);
        } catch (error) {
            handleError(error);
        } finally {
            setIsAuthLoading(false);
        }
    }, [handleError]);

    const logInWithGoogle = useCallback(async (): Promise<void> => {
        try {
            const userCredential = await signInWithPopup(auth, new GoogleAuthProvider());
            setUser(userCredential.user);
        } catch (error) {
            handleError(error);
        } finally {
            setIsAuthLoading(false);
        }
    }, [handleError]);

    // const logInWithGoogleServer = useCallback(async (): Promise<boolean> => {
    //     try {
    //         const userCredential = await signInWithPopup(auth, new GoogleAuthProvider());
    //         await sendIdTokenToServer(userCredential);
    //         return true;
    //     } catch (error) {
    //         handleError(error);
    //         return false;
    //     } finally {
    //         setIsAuthLoading(false);
    //     }
    // }, [handleError]);

    // const sendIdTokenToServer = async (userCredential: any) => {
    //     const idToken = await userCredential.user.getIdToken();
    //     if (!idToken) {
    //         throw new Error('No ID token received');
    //     }
    //     const response = await axios.post(
    //         'http://localhost:8080/login',
    //         { idToken },
    //         { withCredentials: true }
    //     );
    //     if (response.status === 200) {
    //         return true;
    //     } else {
    //         throw new Error('Failed to create session');
    //     }
    // };

    const sendPasswordReset = useCallback(async (email: string): Promise<void> => {
        if (auth === null) {
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            handleError(error);
            throw error;
        }
    }, [handleError]);

    const contextValue = useMemo(() => ({
        authError,
        isAuthLoading,
        user,
        createUserAccount,
        logIn,
        logInWithGoogle,
        // logInServer,
        // logInWithGoogleServer,
        sendPasswordReset,
    }), [
        authError,
        isAuthLoading,
        user,
        createUserAccount,
        logIn,
        logInWithGoogle,
        // logInServer,
        // logInWithGoogleServer,
        sendPasswordReset,
    ]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within AuthProvider');
    }
    return context;
};

// Code For Sub Domains When Using A Server
// useEffect(() => {
//     if (!auth) {
//         setAuthError('Firebase Auth not initialized');
//         return;
//     }
//     const fetchUser = async () => {
//         setIsAuthLoading(true);
//         try {
//             const token = Cookies.get('SNMNCT');
//             if (token && !user) {
//                 const userCredential = await signInWithCustomToken(auth, token);
//                 setUser(userCredential.user);
//             } else if (!token && user) {
//                 await auth.signOut();
//                 setUser(null);
//             }
//         } catch (err) {
//             setAuthError('Session expired or invalid.');
//         } finally {
//             setIsAuthLoading(false);
//         }
//     };
//     fetchUser();
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//         setIsAuthLoading(true);
//         setUser(currentUser || null);
//         setIsAuthLoading(false);
//     });
//     return () => unsubscribe();
// }, [user]);