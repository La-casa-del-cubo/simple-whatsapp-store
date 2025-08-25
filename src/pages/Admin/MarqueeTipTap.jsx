import { useState, useEffect, useContext } from "react";
import { SupabaseContext } from "../../contexts/SupabaseContext";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export default function MarqueeTipTap() {
    const supabase = useContext(SupabaseContext);

    const [color, setColor] = useState("#ffffff");
    const [backgroundColor, setBackgroundColor] = useState("#000000");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Editor TipTap
    const [initialContent, setInitialContent] = useState("<p></p>");
    const editor = useEditor({
        extensions: [StarterKit],
        content: initialContent,
        onUpdate: ({ editor }) => {
            setInitialContent(editor.getHTML());
        },
    });

    // Cargar configuración de Supabase
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
            setInitialContent(data.message || "<p></p>");
            setColor(data.color || "#ffffff");
            setBackgroundColor(data.background_color || "#000000");

            if (editor) editor.commands.setContent(data.message || "<p></p>");
        }
    }

    async function handleSave() {
        if (!editor) return;

        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase
                .from("marquee_config")
                .upsert(
                    {
                        id: 1, // registro único
                        message: editor.getHTML(),
                        color,
                        background_color: backgroundColor,
                    },
                    { onConflict: "id" }
                );

            if (error) throw error;

            alert("Mensaje guardado correctamente");
        } catch (e) {
            setError(e.message);
        }
        setLoading(false);
    }

    return (
        <div className="max-w-lg mx-auto p-6 bg-white rounded shadow">
            <h2 className="text-xl font-bold mb-4">Editar Marquee</h2>
            {error && <div className="mb-4 text-red-600">{error}</div>}

            <label className="block font-semibold mb-2">Mensaje</label>
            <div className="border rounded mb-4">
                <EditorContent editor={editor} />
            </div>

            <label className="block font-semibold mb-1">Color de texto</label>
            <input
                type="color"
                className="w-16 h-10 mb-4 border rounded cursor-pointer"
                value={color}
                onChange={(e) => setColor(e.target.value)}
            />

            <label className="block font-semibold mb-1">Color de fondo</label>
            <input
                type="color"
                className="w-16 h-10 mb-6 border rounded cursor-pointer"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
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
