import { useContext, useEffect, useState } from "react";
import { SupabaseContext } from "../../contexts/SupabaseContext";

export default function CatalogManagement() {
    const supabase = useContext(SupabaseContext);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryError, setNewCategoryError] = useState(null);
    const [newCategoryDescription, setNewCategoryDescription] = useState("");

    const [formData, setFormData] = useState({
        id: null,
        name: "",
        description: "",
        price: "",
        image_url: "",
        category_id: null,
    });

    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
        fetchCategories();
    }, []);

    async function handleAddCategory() {
        setNewCategoryError(null);
        if (!newCategoryName.trim()) {
            setNewCategoryError("El nombre de la categoría no puede estar vacío.");
            return;
        }

        const { data, error } = await supabase
            .from("categories")
            .insert([{ name: newCategoryName.trim(), description: newCategoryDescription.trim() }])
            .select()
            .single();

        if (error) {
            setNewCategoryError(error.message);
        } else {
            setCategories((prev) => [...prev, data]);
            setNewCategoryName("");
            setNewCategoryDescription("");
            setShowCategoryModal(false);
        }
    }

    async function fetchData() {
        setLoading(true);
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .order("name", { ascending: true });
        if (error) {
            setError(error.message);
        } else {
            setProducts(data);
        }
        setLoading(false);
    }

    async function fetchCategories() {
        const { data, error } = await supabase.from("categories").select("*");
        if (!error) {
            setCategories(data);
        }
    }

    function resetForm() {
        setFormData({
            id: null,
            name: "",
            description: "",
            price: "",
            image_url: "",
            category_id: null,
        });
        setError(null);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);

        if (!formData.name || !formData.price) {
            setError("El nombre y precio son obligatorios.");
            return;
        }

        if (formData.id) {
            // Actualizar producto
            const { error } = await supabase
                .from("products")
                .update({
                    name: formData.name,
                    description: formData.description,
                    price: parseFloat(formData.price),
                    image_url: formData.image_url,
                    category_id: formData.category_id,
                })
                .eq("id", formData.id);
            if (error) {
                setError(error.message);
            } else {
                resetForm();
                fetchData();
            }
        } else {
            // Crear producto nuevo
            const { error } = await supabase.from("products").insert([
                {
                    name: formData.name,
                    description: formData.description,
                    price: parseFloat(formData.price),
                    image_url: formData.image_url,
                    category_id: formData.category_id,
                },
            ]);
            if (error) {
                setError(error.message);
            } else {
                resetForm();
                fetchData();
            }
        }
    }

    async function handleEdit(product) {
        setFormData({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            image_url: product.image_url,
            category_id: product.category_id,
        });
        setError(null);
    }

    async function handleDelete(id) {
        if (!window.confirm("¿Estás seguro de eliminar este producto?")) return;
        const { error } = await supabase.from("products").delete().eq("id", id);
        if (error) {
            setError(error.message);
        } else {
            fetchData();
        }
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Gestión de Catálogo</h1>

            <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded shadow">
                {error && <div className="mb-4 text-red-600">{error}</div>}

                <div className="mb-4">
                    <label className="block mb-1 font-semibold">Nombre</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border p-2 rounded"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-1 font-semibold">Descripción</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) =>
                            setFormData({ ...formData, description: e.target.value })
                        }
                        className="w-full border p-2 rounded"
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-1 font-semibold">Precio</label>
                    <input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full border p-2 rounded"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-1 font-semibold">URL de la imagen</label>
                    <input
                        type="url"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        className="w-full border p-2 rounded"
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-1 font-semibold flex justify-between items-center">
                        Categoría
                        <button
                            type="button"
                            onClick={() => setShowCategoryModal(true)}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            + Nueva categoría
                        </button>
                    </label>
                    <select
                        value={formData.category_id ?? ""}
                        onChange={(e) =>
                            setFormData({ ...formData, category_id: e.target.value || null })
                        }
                        className="w-full border p-2 rounded"
                    >
                        <option value="">Selecciona una categoría</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                    {formData.id ? "Actualizar Producto" : "Agregar Producto"}
                </button>

                {formData.id && (
                    <button
                        type="button"
                        onClick={resetForm}
                        className="ml-4 py-2 px-4 border rounded hover:bg-gray-100"
                    >
                        Cancelar
                    </button>
                )}
            </form>
            {showCategoryModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow max-w-sm w-full">
                        <h2 className="text-xl font-bold mb-4">Agregar Nueva Categoría</h2>

                        {newCategoryError && (
                            <div className="mb-2 text-red-600">{newCategoryError}</div>
                        )}

                        <input
                            type="text"
                            placeholder="Nombre de la categoría"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            className="w-full border p-2 rounded mb-4"
                        />

                        <textarea
                            placeholder="Descripción (opcional)"
                            value={newCategoryDescription}
                            onChange={(e) => setNewCategoryDescription(e.target.value)}
                            className="w-full border p-2 rounded mb-4 resize-none"
                            rows={3}
                        />

                        <div className="flex justify-end space-x-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCategoryModal(false);
                                    setNewCategoryName("");
                                    setNewCategoryDescription("");
                                    setNewCategoryError(null);
                                }}
                                className="px-4 py-2 rounded border hover:bg-gray-100"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleAddCategory}
                                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {loading ? (
                <div>Cargando productos...</div>
            ) : products.length === 0 ? (
                <p>No hay productos registrados.</p>
            ) : (
                <table className="w-full table-auto border-collapse">
                    <thead>
                    <tr>
                        <th className="border px-4 py-2">Nombre</th>
                        <th className="border px-4 py-2">Precio</th>
                        <th className="border px-4 py-2">Categoría</th>
                        <th className="border px-4 py-2">Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {products.map((product) => (
                        <tr key={product.id}>
                            <td className="border px-4 py-2">{product.name}</td>
                            <td className="border px-4 py-2">${product.price}</td>
                            <td className="border px-4 py-2">
                                {categories.find((c) => c.id === product.category_id)?.name ||
                                    "Sin categoría"}
                            </td>
                            <td className="border px-4 py-2 space-x-2">
                                <button
                                    onClick={() => handleEdit(product)}
                                    className="bg-yellow-400 px-3 py-1 rounded hover:bg-yellow-500"
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    className="bg-red-500 px-3 py-1 rounded text-white hover:bg-red-600"
                                >
                                    Eliminar
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
