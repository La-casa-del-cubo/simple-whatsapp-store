import { useUser } from "../hooks/useUser";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
    const { user, isAdmin, loading } = useUser();

    if (loading) {
        return <div>Cargando...</div>; // o un spinner
    }

    if (!user || !isAdmin) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
