import { useState, useEffect, useContext } from "react";
import { SupabaseContext } from "../../contexts/SupabaseContext";

export default function AdminWhatsApp() {
    const supabase = useContext(SupabaseContext);

    const [phone, setPhone] = useState("");
    const [defaultMessage, setDefaultMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchConfig();
    }, []);

    async function fetchConfig() {
        const { data, error } = await supabase
            .from("whatsapp_config")
            .select("*")
            .limit(1)
            .single();

        if (!error && data) {
            setPhone(data.phone_number);
            setDefaultMessage(data.default_message);
        }
    }

    async function handleSave() {
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase
                .from("whatsapp_config")
                .upsert(
                    {
                        id: 1,
                        phone_number: phone.trim(),
                        default_message: defaultMessage.trim(),
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
            <h2 className="text-xl font-bold mb-4">Configuración WhatsApp</h2>

            {error && <div className="mb-4 text-red-600">{error}</div>}

            <label className="block font-semibold mb-1">Número de WhatsApp</label>
            <input
                type="tel"
                placeholder="+5215551234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border p-2 rounded mb-4"
            />

            <label className="block font-semibold mb-1">Mensaje predeterminado</label>
            <textarea
                placeholder="Mensaje estándar para pedidos"
                value={defaultMessage}
                onChange={(e) => setDefaultMessage(e.target.value)}
                rows={4}
                className="w-full border p-2 rounded mb-4 resize-none"
            />

            <button
                onClick={handleSave}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
                {loading ? "Guardando..." : "Guardar"}
            </button>
        </div>
    );
}
