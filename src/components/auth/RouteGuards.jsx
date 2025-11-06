import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export function PrivateRoute() {
  const { user, ready } = useAuth();
  if (!ready) return <div style={{ padding: 16 }}>Loading…</div>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export function PublicOnlyRoute() {
  const { user, ready } = useAuth();
  if (!ready) return <div style={{ padding: 16 }}>Loading…</div>;
  return user ? <Navigate to="/main" replace /> : <Outlet />;
}
