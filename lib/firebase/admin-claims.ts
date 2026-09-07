'use client';

// Miftah Tools Enterprise Admin Custom Claims & Cryptographic Role Validator
import { User, getIdTokenResult, IdTokenResult } from 'firebase/auth';
import { db } from './firebase-client';
import { doc, getDoc } from 'firebase/firestore';

export interface AdminClaims {
  admin?: boolean;
  super_admin?: boolean;
  role?: 'admin' | 'user' | 'moderator';
  permissions?: string[];
}

/**
 * Checks if a Firebase User possesses Admin Custom Claims on their JWT ID Token
 */
export async function verifyUserAdminClaims(user: User | null, forceRefresh = false): Promise<boolean> {
  if (!user) return false;

  try {
    // 1. Check Cryptographic Custom Claims on Firebase ID Token (Primary Source of Truth)
    const idTokenResult: IdTokenResult = await getIdTokenResult(user, forceRefresh);
    const claims = idTokenResult.claims as AdminClaims;

    if (claims.admin === true || claims.super_admin === true || claims.role === 'admin') {
      return true;
    }

    // 2. Check Firestore /admins/{uid} collection
    if (db) {
      const adminRef = doc(db, 'admins', user.uid);
      const adminSnap = await getDoc(adminRef);
      if (adminSnap.exists()) {
        const adminData = adminSnap.data();
        if (adminData?.role === 'admin' || adminData?.active === true) {
          return true;
        }
      }

      // Check /users/{uid} document for verified role
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        if (data.role === 'admin' || data.isAdmin === true || data.isSuperAdmin === true) {
          return true;
        }
      }
    }

    // 3. Fallback Admin Email Whitelist
    const email = user.email?.toLowerCase().trim() || '';
    if (
      email === 'jrahmanansari132@gmail.com' ||
      email === 'jamil8655@gmail.com' ||
      email === 'hafizjamilurrahman@gmail.com' ||
      email === 'jamilurrahman@gmail.com'
    ) {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error verifying admin claims:', error);
    return false;
  }
}
