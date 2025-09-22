/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useContext } from "react";
import { SupabaseContext } from "../../contexts/SupabaseContext";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import DynamicCubeTitle from "../../components/DynamicCubeTitle.jsx";

export default function Catalog() {
    const supabase = useContext(SupabaseContext);

    // Datos filtro
    const [categories, setCategories] = useState([]);
    const [modalities, setModalities] = useState([]);
    const [types, setTypes] = useState([]);
    const [, setColors] = useState([]);

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [filters, setFilters] = useState({
        category: searchParams.get("category") || null,
        modality: searchParams.get("modality") || null,
        type: searchParams.get("type") || null,
        colors: searchParams.get("colors")
            ? searchParams.get("colors").split(",").map(Number)
            : [],
    });

    // Productos filtrados
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    // Cargar datos iniciales para filtros
    useEffect(() => {
        const fetchFilters = async () => {
            const fetchTable = async (table) => {
                const { data } = await supabase.from(table).select("*").order("name");
                return data || [];
            };
            setCategories(await fetchTable("categories"));
            setModalities(await fetchTable("modalities"));
            setTypes(await fetchTable("types"));
            setColors(await fetchTable("colors"));
        };
        fetchFilters();
    }, [supabase]);

    // Cargar productos cuando cambien los filtros
    useEffect(() => {
        fetchProducts();
    }, [filters]);

    async function fetchProducts() {
        setLoading(true);

        let query = supabase.from("products").select(`
      *,
      categories(name),
      modalities(name),
      types(name),
      product_colors(color_id, colors(name, hex_code))
    `);

        // Aplicar filtros
        if (filters.category) query = query.eq("category_id", filters.category);
        if (filters.modality) query = query.eq("modality_id", filters.modality);
        if (filters.type) query = query.eq("type_id", filters.type);

        if (filters.colors.length > 0) {
            // Filtrar productos que tengan al menos uno de los colores seleccionados
            query = query.in("product_colors.color_id", filters.colors);
        }

        const { data, error } = await query.order("name", { ascending: true });
        if (error) {
            console.error("Error cargando productos:", error.message);
            setProducts([]);
        } else {
            setProducts(data || []);
        }

        setLoading(false);
    }

    function updateFilter(key, value) {
        const newFilters = { ...filters, [key]: value };

        // Construir params para URL
        const params = new URLSearchParams();

        if (newFilters.category) params.set("category", newFilters.category);
        if (newFilters.modality) params.set("modality", newFilters.modality);
        if (newFilters.type) params.set("type", newFilters.type);
        if (newFilters.colors.length) params.set("colors", newFilters.colors.join(","));

        setFilters(newFilters);

        // Actualizar URL sin recargar página
        navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    }


    return (
        <div className="max-w-7xl mx-auto p-4 lg:flex gap-6">
            {/* Panel Filtros */}
            <aside className="lg:w-80 mb-6 lg:mb-0 bg-white p-4 rounded shadow h-fit sticky top-4 self-start">
                <h3 className="font-bold text-xl mb-4">Filtros</h3>

                {/* Categorías */}
                <div className="mb-6">
                    <label className="block font-semibold mb-2">Categoría</label>
                    <select
                        value={filters.category || ""}
                        onChange={(e) => {
                                updateFilter("category", e.target.value || null)
                                setFilters({...filters, category: e.target.value || null})
                            }
                        }
                        className="w-full border rounded p-2"
                    >
                        <option value="">Todas</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Modalidad */}
                <div className="mb-6">
                    <label className="block font-semibold mb-2">Modalidad</label>
                    <select
                        value={filters.modality || ""}
                        onChange={(e) => {
                            updateFilter("modality", e.target.value || null)
                            setFilters({...filters, modality: e.target.value || null})
                            }
                        }
                        className="w-full border rounded p-2"
                    >
                        <option value="">Todas</option>
                        {modalities.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Tipo */}
                <div className="mb-6">
                    <label className="block font-semibold mb-2">Marca</label>
                    <select
                        value={filters.type || ""}
                        onChange={(e) => {
                                updateFilter("type", e.target.value || null)
                                setFilters({...filters, type: e.target.value || null})
                            }
                        }
                        className="w-full border rounded p-2"
                    >
                        <option value="">Todos</option>
                        {types.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.name}
                            </option>
                        ))}
                    </select>
                </div>
            </aside>

            {/* Productos */}
            <section className="flex-1">
                <DynamicCubeTitle title="Cátalogo" />
                {loading ? (
                    <div className="text-center py-20">Cargando productos...</div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">No hay productos.</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {products.map((p) => (
                            <div key={p.id} className="bg-white rounded shadow p-4 flex flex-col">
                                {/*Aquí va el carrusel*/}
                                <Link
                                    to={`/product/${p.id}${location.search}`}
                                    className="text-blue-600 hover:underline"
                                >
                                    {p.name}
                                </Link>
                                <p className="text-gray-600 text-sm mb-2">{p.description}</p>
                                <div className="flex flex-wrap gap-1 mb-3 text-xs text-gray-500">
                                    {p.categories && <span className="px-2 py-1 bg-gray-100 rounded">{p.categories.name}</span>}
                                    {p.modalities && <span className="px-2 py-1 bg-gray-100 rounded">{p.modalities.name}</span>}
                                    {p.types && <span className="px-2 py-1 bg-gray-100 rounded">{p.types.name}</span>}
                                    {p.product_colors?.map((pc) => (
                                        <span
                                            key={pc.color_id}
                                            className="inline-block w-4 h-4 rounded"
                                            title={pc.colors.name}
                                            style={{ backgroundColor: pc.colors.hex_code || "#ccc" }}
                                        />
                                    ))}
                                </div>
                                <div className="font-bold text-green-700 text-lg">${p.price}</div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
