import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../Firebase";

export const login = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const logout = async () => {
  await signOut(auth);
};
