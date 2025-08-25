// src/components/Header.jsx
import { useContext } from "react";
import { SupabaseContext } from "../contexts/SupabaseContext";
import { useUser } from "../hooks/useUser";

export default function Header() {
    const supabase = useContext(SupabaseContext);
    const { user } = useUser();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        // Puedes agregar redirección aquí si quieres, por ejemplo a login
        window.location.href = "/login";
    };

    return (
        <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
            <h1 className="font-bold text-xl">Mi Tienda</h1>
            {user && (
                <button
                    onClick={handleLogout}
                    className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                >
                    Cerrar sesión
                </button>
            )}
        </header>
    );
}
