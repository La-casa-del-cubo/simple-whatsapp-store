// src/pages/Auth/Login.jsx
import { useState, useContext } from "react";
import { SupabaseContext } from "../../contexts/SupabaseContext";

export default function Login() {
    const supabase = useContext(SupabaseContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);

        const { data: { user }, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        const { data, error: roleError } = await supabase
            .from('users')
            .select('app_role')
            .eq('id', user.id)
            .single();

        if (roleError || data.app_role !== 'admin') {
            // No es admin o error
            await supabase.auth.signOut();
            throw new Error("No tienes permisos para acceder");
        }

        // Redireccionar o actualizar estado global para admin autorizado
        window.location.href = "/admin/catalog";
    };

    return (
        <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded shadow">
            <h2 className="text-2xl mb-6 font-bold text-center">Login Admin</h2>
            {error && (
                <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">{error}</div>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
                <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border p-2 w-full rounded"
                />
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border p-2 w-full rounded"
                />
                <button
                    type="submit"
                    className="bg-blue-600 w-full text-white py-2 rounded hover:bg-blue-700"
                >
                    Iniciar Sesión
                </button>
            </form>
        </div>
    );
}
