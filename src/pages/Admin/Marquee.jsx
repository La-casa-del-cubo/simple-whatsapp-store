import { useState, useEffect, useContext } from "react";
import { SupabaseContext } from "../../contexts/SupabaseContext";

export default function Marquee() {
    const supabase = useContext(SupabaseContext);
    const [message, setMessage] = useState("");
    const [color, setColor] = useState("#ffffff");
    const [backgroundColor, setBackgroundColor] = useState("#000000");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchConfig();
    }, []);

    async function fetchConfig() {
        const { data, error } = await supabase
            .from("marquee_config")
            .select("*")
            .limit(1)
            .single();

        if (!error && data) {
            setMessage(data.message);
            setColor(data.color);
            setBackgroundColor(data.background_color);
        }
    }

    async function handleSave() {
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase
                .from("marquee_config")
                .upsert(
                    {
                        id: 1, // solo un registro
                        message,
                        color,
                        background_color: backgroundColor,
                    },
                    { onConflict: "id" }
                );

            if (error) throw error;

            alert("Configuración guardada");
        } catch (e) {
            setError(e.message);
        }
        setLoading(false);
    }

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
            <h2 className="text-xl font-bold mb-4">Configurar Marquee</h2>
            {error && <div className="mb-4 text-red-600">{error}</div>}

            <label className="block mb-1 font-semibold">Mensaje</label>
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border p-2 rounded mb-4"
            />

            <label className="block mb-1 font-semibold">Color de Texto</label>
            <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-16 h-10 mb-4 p-0 border rounded cursor-pointer"
            />

            <label className="block mb-1 font-semibold">Color de Fondo</label>
            <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-16 h-10 mb-4 p-0 border rounded cursor-pointer"
            />

            <button
                onClick={handleSave}
                disabled={loading}
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
                {loading ? "Guardando..." : "Guardar"}
            </button>
        </div>
    );
}
