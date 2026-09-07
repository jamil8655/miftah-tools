'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase/firebase-client';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  deleteUser,
} from 'firebase/auth';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { verifyUserAdminClaims } from '@/lib/firebase/admin-claims';

export type UserRole = 'admin' | 'user' | 'guest';

export interface AuthUser {
  uid: string;
  name: string;
  role: UserRole;
  email?: string;
  photoURL?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  firebaseUser: FirebaseUser | null;
  role: UserRole;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signupWithEmail: (email: string, pass: string, name: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
  refreshAdminStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [rawFirebaseUser, setRawFirebaseUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<UserRole>('guest');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const evaluateUser = async (firebaseUser: FirebaseUser | null, forceRefresh = false) => {
    setRawFirebaseUser(firebaseUser);
    if (!firebaseUser) {
      setUser(null);
      setRole('guest');
      setIsLoading(false);
      return;
    }

    const isAdminClaim = await verifyUserAdminClaims(firebaseUser, forceRefresh);
    const assignedRole: UserRole = isAdminClaim ? 'admin' : 'user';

    const authUser: AuthUser = {
      uid: firebaseUser.uid,
      name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
      email: firebaseUser.email || undefined,
      photoURL: firebaseUser.photoURL || undefined,
      role: assignedRole,
    };

    setUser(authUser);
    setRole(assignedRole);
    setIsLoading(false);

    // Sync Firestore profile in the background
    if (db) {
      try {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        setDoc(
          userDocRef,
          {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || '',
            role: assignedRole,
            lastLoginAt: Date.now(),
          },
          { merge: true }
        ).catch(() => {});
      } catch (e) {}
    }
  };

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }

    // Handle redirect results if mobile popup was redirected
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          evaluateUser(result.user, true);
        }
      })
      .catch((err) => {
        console.warn('Redirect auth warning:', err);
      });

    // 100% Real Firebase Authentication State Listener
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      evaluateUser(firebaseUser);
    });

    return () => unsubscribe();
  }, []);

  const refreshAdminStatus = async () => {
    if (auth?.currentUser) {
      setIsLoading(true);
      await evaluateUser(auth.currentUser, true);
    }
  };

  // 1. Real Firebase Email & Password Sign-In
  const loginWithEmail = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!auth) throw new Error('Firebase Auth is not initialized');
      const res = await signInWithEmailAndPassword(auth, email.trim(), pass);
      await evaluateUser(res.user, true);
      return { success: true };
    } catch (err: any) {
      let message = err.message || 'Login failed.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        message = 'Invalid email or password.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      } else if (err.code === 'auth/operation-not-allowed') {
        message = 'Email/Password sign-in is not enabled in Firebase Console -> Authentication -> Sign-in method.';
      }
      return { success: false, error: message };
    }
  };

  // 2. Real Firebase Email & Password Sign-Up
  const signupWithEmail = async (email: string, pass: string, name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!auth) throw new Error('Firebase Auth is not initialized');
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (cred.user && name) {
        await updateProfile(cred.user, { displayName: name.trim() });
      }
      await evaluateUser(cred.user, true);
      return { success: true };
    } catch (err: any) {
      let message = err.message || 'Registration failed.';
      if (err.code === 'auth/email-already-in-use') {
        message = 'This email address is already registered. Please sign in.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password is too weak. Please use at least 6 characters.';
      } else if (err.code === 'auth/operation-not-allowed') {
        message = 'Email/Password registration is not enabled in Firebase Console -> Authentication -> Sign-in method.';
      }
      return { success: false, error: message };
    }
  };

  // 3. Real Firebase Google OAuth Sign-In
  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!auth) throw new Error('Firebase Auth is not initialized');
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const res = await signInWithPopup(auth, provider);
      await evaluateUser(res.user, true);
      return { success: true };
    } catch (err: any) {
      console.warn('Firebase Google Auth error:', err);
      let message = err.message || 'Google sign-in failed.';

      if (err.code === 'auth/operation-not-allowed') {
        message =
          'Google Provider is not enabled in Firebase Console -> Authentication -> Sign-in method. Please toggle "Google" to Enabled and click Save.';
      } else if (err.code === 'auth/unauthorized-domain' || err.code === 'auth/internal-error') {
        message =
          'Authorized domain required: Please add "jamil8655.github.io" in Firebase Console -> Authentication -> Settings -> Authorized Domains.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        message = 'Google sign-in popup was closed before completing.';
      } else if (err.code === 'auth/popup-blocked') {
        try {
          if (auth) {
            const provider = new GoogleAuthProvider();
            await signInWithRedirect(auth, provider);
            return { success: true };
          }
        } catch (redirErr) {
          message = 'Popup was blocked by your browser. Please allow popups for this site.';
        }
      }
      return { success: false, error: message };
    }
  };

  // 4. Real Firebase Sign-Out
  const logout = async () => {
    if (auth) {
      try {
        await signOut(auth);
      } catch (e) {
        console.error('Sign out error:', e);
      }
    }
    setUser(null);
    setRole('guest');
  };

  // 5. Complete Account & Data Deletion (Google Play Compliance)
  const deleteAccount = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      if (auth && auth.currentUser) {
        const currentUser = auth.currentUser;
        const uid = currentUser.uid;

        // Delete Firestore user profile if present
        if (db) {
          try {
            await deleteDoc(doc(db, 'users', uid));
          } catch (docErr) {
            console.warn('Firestore doc deletion notice:', docErr);
          }
        }

        // Delete Firebase Authentication User
        await deleteUser(currentUser);
      }

      setUser(null);
      setRole('guest');
      return { success: true };
    } catch (err: any) {
      console.error('Account deletion error:', err);
      if (err.code === 'auth/requires-recent-login') {
        return {
          success: false,
          error:
            'For security reasons, please log out and log back in before deleting your account to re-authenticate.',
        };
      }
      return {
        success: false,
        error: err.message || 'Failed to delete account. Please try again.',
      };
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser: rawFirebaseUser,
        role,
        isAuthenticated,
        isAdmin,
        isLoading,
        loginWithEmail,
        signupWithEmail,
        loginWithGoogle,
        logout,
        deleteAccount,
        refreshAdminStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
