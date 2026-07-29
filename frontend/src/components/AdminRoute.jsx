import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { FullPageSpinner } from "./ProtectedRoute.jsx";

// Admin status itself lives only in the backend's `admins` table (not
// readable by the client), so this route just requires a logged-in user —
// the real gate is every admin API call, which the backend rejects with
// 403 for non-admins. AdminLayout catches that 403 and bounces them out.
export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
