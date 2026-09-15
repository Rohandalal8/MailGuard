"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth, googleProvider, signInWithPopup } from "../firebase/auth";
import { api } from "../lib/api";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => onAuthStateChanged(auth, (current) => {
    async function synchronize() {
      setUser(current);
      if (current) {
        try {
          const firebaseToken = await current.getIdToken();
          await api.post("/auth/sync-user", { firebaseToken });
        } catch {
        }
      }
      setLoading(false);
    }
    void synchronize();
  }), []);
  async function signInWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseToken = await result.user.getIdToken();
    await api.post("/auth/sync-user", { firebaseToken });
    return result.user;
  }
  async function logout() { await signOut(auth); }
  return { user, loading, signInWithGoogle, logout };
}