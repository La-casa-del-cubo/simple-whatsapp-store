import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SupabaseContext } from "../contexts/SupabaseContext";

export default function PagesList() {
    const supabase = useContext(SupabaseContext);
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPages();
    }, []);

    async function fetchPages() {
        setLoading(true);
        const { data, error } = await supabase
            .from("page_configuration")
            .select("*")
            .order("created_at", { ascending: false });
        if (error) {
            setError(error.message);
            setPages([]);
        } else {
            setError(null);
            setPages(data);
        }
        setLoading(false);
    }

    function goToEdit(page) {
        navigate(`/admin/pages/${page.page_name}`);
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Gestión de Páginas</h1>
                <Link
                    to="/admin/pages/new"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    + Nueva Página
                </Link>
            </div>

            {loading && <p>Cargando páginas...</p>}
            {error && <p className="text-red-600">{error}</p>}

            {!loading && !error && (
                <table className="w-full border-collapse shadow rounded overflow-hidden">
                    <thead>
                    <tr className="bg-gray-800 text-white">
                        <th className="p-3 text-left">Título</th>
                        <th className="p-3 text-left">Identificador (Slug)</th>
                        <th className="p-3 text-left">Mostrar en Menú</th>
                        <th className="p-3 text-left">Última actualización</th>
                        <th className="p-3">Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {pages.length === 0 && (
                        <tr>
                            <td colSpan="5" className="p-3 text-center text-gray-600">
                                No hay páginas registradas.
                            </td>
                        </tr>
                    )}
                    {pages.map((page) => (
                        <tr
                            key={page.id}
                            className="border-b hover:bg-gray-100 cursor-pointer"
                            onClick={() => goToEdit(page)}
                        >
                            <td className="p-3">{page.title}</td>
                            <td className="p-3">{page.page_name}</td>
                            <td className="p-3">{page.show_in_menu ? "Sí" : "No"}</td>
                            <td className="p-3">
                                {new Date(page.updated_at || page.created_at).toLocaleString()}
                            </td>
                            <td className="p-3 text-center">
                                <button
                                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        goToEdit(page);
                                    }}
                                >
                                    Editar
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
