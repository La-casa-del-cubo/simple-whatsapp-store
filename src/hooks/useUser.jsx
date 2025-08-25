import { useContext, useEffect, useState } from "react";
import { SupabaseContext } from "../contexts/SupabaseContext";

export function useUser() {
    const supabase = useContext(SupabaseContext);
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Obtener sesión actual al montar el hook
        supabase.auth.getSession().then(({ data: sessionData }) => {
            if (sessionData.session?.user) {
                setUser(sessionData.session.user);
                fetchUserRole(sessionData.session.user.id);
            } else {
                setUser(null);
                setIsAdmin(false);
                setLoading(false);
            }
        });

        // Escuchar cambios de sesión (login/logout)
        const { data: listener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (session?.user) {
                    setUser(session.user);
                    fetchUserRole(session.user.id);
                } else {
                    setUser(null);
                    setIsAdmin(false);
                    setLoading(false);
                }
            }
        );

        // Limpieza al desmontar
        return () => {
            listener.subscription.unsubscribe();
        };
    }, [supabase]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    async function fetchUserRole(uid) {
        const { data, error } = await supabase
            .from("users")
            .select("app_role")
            .eq("id", uid)
            .single();

        if (!error && data?.app_role === "admin") {
            setIsAdmin(true);
        } else {
            setIsAdmin(false);
        }
        setLoading(false);
    }

    return { user, isAdmin, loading };
}
