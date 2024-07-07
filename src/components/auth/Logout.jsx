// src/components/Logout.js
import React from "react";
import { logout } from "./authService";
const handleLogout = async () => {
  try {
    await logout();
  } catch (error) {
    console.error("Error logging out:", error);
  }
};
const Logout = () => {
  return <button onClick={handleLogout}>Logout</button>;
};

export default Logout;
export { handleLogout };
