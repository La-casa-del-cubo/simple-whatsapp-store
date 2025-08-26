import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SupabaseContext } from "../../contexts/SupabaseContext";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {MenuBar} from "../../components/MenuBar.jsx";

export default function PageConfigurationAdmin() {
    const { page_name } = useParams();
    const navigate = useNavigate();
    const supabase = useContext(SupabaseContext);

    const [title, setTitle] = useState("");
    const [pageName, setPageName] = useState(page_name || "");
    const [whatsappLink, setWhatsappLink] = useState("");
    const [showInMenu, setShowInMenu] = useState(false);

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const [initialContent, setInitialContent] = useState("<p></p>");
    const editor = useEditor({
        extensions: [StarterKit],
        content: initialContent,
        onUpdate: ({ editor }) => setInitialContent(editor.getHTML()),
    });

    useEffect(() => {
        async function fetchPage() {
            if (!page_name) return; // New page mode

            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from("page_configuration")
                .select("*")
                .eq("page_name", page_name)
                .single();

            if (error) {
                if (error.code === "PGRST116") {
                    // No encontrado, nuevo registro
                    setTitle("");
                    setWhatsappLink("");
                    setShowInMenu(false);
                    setInitialContent("<p></p>");
                    editor?.commands.setContent("<p></p>");
                } else {
                    setError(error.message);
                }
            } else if (data) {
                setTitle(data.title || "");
                setWhatsappLink(data.whatsapp_link || "");
                setShowInMenu(data.show_in_menu || false);
                setPageName(data.page_name || "");
                setInitialContent(data.content || "<p></p>");
                editor?.commands.setContent(data.content || "<p></p>");
            }
            setLoading(false);
        }

        if (editor) fetchPage();
    }, [page_name, supabase, editor]);

    async function savePage() {
        if (!title.trim()) {
            setError("El título es obligatorio");
            return;
        }
        if (!pageName.trim()) {
            setError("El identificador (slug) es obligatorio");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const payload = {
                page_name: pageName.trim(),
                title: title.trim(),
                content: editor.getHTML(),
                whatsapp_link: whatsappLink.trim(),
                show_in_menu: showInMenu,
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase
                .from("page_configuration")
                .upsert(payload, { onConflict: "page_name" });

            if (error) throw error;

            alert("Página guardada con éxito");
            navigate("/admin/pages");
        } catch (e) {
            setError(e.message);
        }
        setLoading(false);
    }

    if (!editor)
        return (
            <div className="text-center py-10 text-gray-600">Cargando editor...</div>
        );

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
            <h1 className="text-2xl font-bold mb-6">
                {page_name ? "Editar Página" : "Nueva Página"}
            </h1>

            {error && <div className="mb-4 text-red-600 font-semibold">{error}</div>}

            <label className="block mb-2 font-semibold">Identificador (slug)</label>
            <input
                type="text"
                value={pageName}
                onChange={(e) =>
                    setPageName(e.target.value.toLowerCase().replace(/\s+/g, "_"))
                }
                className="w-full mb-4 p-2 border rounded"
                disabled={!!page_name}
            />

            <label className="block mb-2 font-semibold">Título</label>
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full mb-4 p-2 border rounded"
            />

            <label className="block mb-2 font-semibold">Contenido enriquecido</label>
            <MenuBar editor={editor} />
            <EditorContent
                editor={editor}
                className="border p-4 rounded min-h-[300px] mb-6"
            />

            {pageName === "contacto" && (
                <label className="block mb-4 font-semibold">
                    Link WhatsApp personalizado
                    <input
                        type="text"
                        value={whatsappLink}
                        onChange={(e) => setWhatsappLink(e.target.value)}
                        placeholder="https://wa.me/521XXXXXXXXXX?text=Hola"
                        className="w-full mt-1 p-2 border rounded"
                    />
                </label>
            )}

            <label className="block mb-6 font-semibold flex items-center space-x-2">
                <input
                    type="checkbox"
                    checked={showInMenu}
                    onChange={(e) => setShowInMenu(e.target.checked)}
                />
                <span>Mostrar en menú público</span>
            </label>

            <button
                onClick={savePage}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? "Guardando..." : page_name ? "Actualizar Página" : "Crear Página"}
            </button>
        </div>
    );
}