import { useState, useEffect, useContext } from "react";
import { SupabaseContext } from "../../contexts/SupabaseContext";

export default function AdminProductForm({ onSaved }) {
    const supabase = useContext(SupabaseContext);

    // Datos productos
    const [formData, setFormData] = useState({
        id: null,
        name: "",
        description: "",
        price: "",
        image_url: "",
        category_id: null,
        modality_id: null,
        type_id: null,
        shape_id: null,
    });

    // Listas para selects
    const [categories, setCategories] = useState([]);
    const [modalities, setModalities] = useState([]);
    const [types, setTypes] = useState([]);
    const [shapes, setShapes] = useState([]);
    const [colors, setColors] = useState([]);
    const [selectedColors, setSelectedColors] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Modal lateral controles
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState(null); // "category" | "modality" | "type" | "shape" | "color"
    const [modalName, setModalName] = useState("");
    const [modalDescription, setModalDescription] = useState("");
    const [modalHexCode, setModalHexCode] = useState("");

    useEffect(() => {
        fetchAllSelects();
    }, []);

    async function fetchAllSelects() {
        const fetchTable = async (table) => {
            const { data } = await supabase.from(table).select("*").order("name");
            return data || [];
        };
        setCategories(await fetchTable("categories"));
        setModalities(await fetchTable("modalities"));
        setTypes(await fetchTable("types"));
        setShapes(await fetchTable("shapes"));
        setColors(await fetchTable("colors"));
    }

    // Manejo cambio de colores seleccionados (checkbox)
    function toggleColor(colorId) {
        setSelectedColors((prev) =>
            prev.includes(colorId)
                ? prev.filter((id) => id !== colorId)
                : [...prev, colorId]
        );
    }

    async function handleSave() {
        setLoading(true);
        setError(null);

        try {
            // Guardar o actualizar producto
            let productId = formData.id;

            if (productId) {
                // Actualizar
                const { error } = await supabase
                    .from("products")
                    .update({
                        name: formData.name,
                        description: formData.description,
                        price: parseFloat(formData.price),
                        image_url: formData.image_url,
                        category_id: formData.category_id,
                        modality_id: formData.modality_id,
                        type_id: formData.type_id,
                        shape_id: formData.shape_id,
                    })
                    .eq("id", productId);
                if (error) throw error;
            } else {
                // Insertar nuevo
                const { data, error } = await supabase
                    .from("products")
                    .insert([
                        {
                            name: formData.name,
                            description: formData.description,
                            price: parseFloat(formData.price),
                            image_url: formData.image_url,
                            category_id: formData.category_id,
                            modality_id: formData.modality_id,
                            type_id: formData.type_id,
                            shape_id: formData.shape_id,
                        },
                    ])
                    .select()
                    .single();
                if (error) throw error;
                productId = data.id;
            }

            // Guardar colores (many-to-many)
            if (productId) {
                // Elimina las relaciones previas
                await supabase.from("product_colors").delete().eq("product_id", productId);

                if (selectedColors.length > 0) {
                    const inserts = selectedColors.map((colorId) => ({
                        product_id: productId,
                        color_id: colorId,
                    }));
                    const { error } = await supabase.from("product_colors").insert(inserts);
                    if (error) throw error;
                }
            }

            setLoading(false);
            if (onSaved) onSaved();
            resetForm();
            alert("Producto guardado correctamente.");
        } catch (e) {
            setError(e.message);
            setLoading(false);
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
            modality_id: null,
            type_id: null,
            shape_id: null,
        });
        setSelectedColors([]);
        setError(null);
    }

    // Modal - Guardar nuevo ítem (category, type, etc)
    async function handleAddModalItem() {
        if (!modalName.trim()) {
            alert("El nombre no puede estar vacío");
            return;
        }

        const tableMap = {
            category: "categories",
            modality: "modalities",
            type: "types",
            shape: "shapes",
            color: "colors",
        };

        const insertData = {
            name: modalName.trim(),
        };

        // Para colores toma hex_code
        if (modalType === "color") insertData.hex_code = modalHexCode.trim();
        if (modalType !== "color") insertData.description = modalDescription.trim();

        const { data, error } = await supabase
            .from(tableMap[modalType])
            .insert([insertData])
            .select()
            .single();

        if (error) {
            alert(error.message);
        } else {
            // Actualiza listado correspondiente
            switch (modalType) {
                case "category":
                    setCategories((prev) => [...prev, data]);
                    setFormData((fd) => ({ ...fd, category_id: data.id }));
                    break;
                case "modality":
                    setModalities((prev) => [...prev, data]);
                    setFormData((fd) => ({ ...fd, modality_id: data.id }));
                    break;
                case "type":
                    setTypes((prev) => [...prev, data]);
                    setFormData((fd) => ({ ...fd, type_id: data.id }));
                    break;
                case "shape":
                    setShapes((prev) => [...prev, data]);
                    setFormData((fd) => ({ ...fd, shape_id: data.id }));
                    break;
                case "color":
                    setColors((prev) => [...prev, data]);
                    setSelectedColors((prev) => [...prev, data.id]);
                    break;
            }

            closeModal();
        }
    }

    function openModal(type) {
        setModalType(type);
        setModalName("");
        setModalDescription("");
        setModalHexCode("");
        setModalOpen(true);
    }

    function closeModal() {
        setModalOpen(false);
        setModalName("");
        setModalDescription("");
        setModalHexCode("");
        setModalType(null);
    }

    return (
        <>
            <div className="max-w-6xl mx-auto p-8 bg-white rounded shadow">
                <h2 className="text-2xl font-bold mb-6">Alta de Producto</h2>

                {error && <div className="mb-4 text-red-600">{error}</div>}

                <div className="space-y-4">
                    <div>
                        <label className="block font-semibold mb-1">Nombre</label>
                        <input
                            type="text"
                            className="w-full border rounded px-3 py-2"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block font-semibold mb-1">Descripción</label>
                        <textarea
                            className="w-full border rounded px-3 py-2"
                            rows={3}
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                        />
                    </div>

                    <div>
                        <label className="block font-semibold mb-1">Precio</label>
                        <input
                            type="number"
                            className="w-full border rounded px-3 py-2"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block font-semibold mb-1">Imagen (URL)</label>
                        <input
                            type="url"
                            className="w-full border rounded px-3 py-2"
                            value={formData.image_url}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        />
                    </div>

                    <div className="flex space-x-4">
                        <div className="flex-1">
                            <label className="block font-semibold mb-1">
                                Categoría{" "}
                                <button
                                    type="button"
                                    onClick={() => openModal("category")}
                                    className="text-blue-600 ml-2 underline text-sm"
                                >
                                    + Nueva
                                </button>
                            </label>
                            <select
                                className="w-full border rounded px-3 py-2"
                                value={formData.category_id ?? ""}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        category_id: e.target.value || null,
                                    })
                                }
                            >
                                <option value="">Selecciona una categoría</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex-1">
                            <label className="block font-semibold mb-1">
                                Modalidad{" "}
                                <button
                                    type="button"
                                    onClick={() => openModal("modality")}
                                    className="text-blue-600 ml-2 underline text-sm"
                                >
                                    + Nueva
                                </button>
                            </label>
                            <select
                                className="w-full border rounded px-3 py-2"
                                value={formData.modality_id ?? ""}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        modality_id: e.target.value || null,
                                    })
                                }
                            >
                                <option value="">Selecciona una modalidad</option>
                                {modalities.map((mod) => (
                                    <option key={mod.id} value={mod.id}>
                                        {mod.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex space-x-4">
                        <div className="flex-1">
                            <label className="block font-semibold mb-1">
                                Tipo{" "}
                                <button
                                    type="button"
                                    onClick={() => openModal("type")}
                                    className="text-blue-600 ml-2 underline text-sm"
                                >
                                    + Nuevo
                                </button>
                            </label>
                            <select
                                className="w-full border rounded px-3 py-2"
                                value={formData.type_id ?? ""}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        type_id: e.target.value || null,
                                    })
                                }
                            >
                                <option value="">Selecciona un tipo</option>
                                {types.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex-1">
                            <label className="block font-semibold mb-1">
                                Forma{" "}
                                <button
                                    type="button"
                                    onClick={() => openModal("shape")}
                                    className="text-blue-600 ml-2 underline text-sm"
                                >
                                    + Nueva
                                </button>
                            </label>
                            <select
                                className="w-full border rounded px-3 py-2"
                                value={formData.shape_id ?? ""}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        shape_id: e.target.value || null,
                                    })
                                }
                            >
                                <option value="">Selecciona una forma</option>
                                {shapes.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Colores - checkbox */}
                    <div>
                        <label className="block font-semibold mb-2">
                            Colores (elige uno o más)
                            <button
                                type="button"
                                onClick={() => openModal("color")}
                                className="text-blue-600 ml-2 underline text-sm"
                            >
                                + Nuevo
                            </button>
                        </label>
                        <div className="flex flex-wrap gap-3 max-h-32 overflow-auto border p-2 rounded">
                            {colors.map((color) => (
                                <label
                                    key={color.id}
                                    className="inline-flex items-center cursor-pointer space-x-2"
                                >
                                    <input
                                        type="checkbox"
                                        value={color.id}
                                        checked={selectedColors.includes(color.id)}
                                        onChange={() => toggleColor(color.id)}
                                        className="cursor-pointer"
                                    />
                                    <span
                                        className="inline-block w-5 h-5 rounded"
                                        style={{ backgroundColor: color.hex_code || "#ccc" }}
                                        title={color.name}
                                    />
                                    <span>{color.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleSave}
                        className="mt-6 bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700"
                        disabled={loading}
                    >
                        {loading ? "Guardando..." : "Guardar Producto"}
                    </button>
                </div>
            </div>

            {/* Modal lateral */}
            {modalOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-opacity-30 backdrop-filter backdrop-blur-sm z-40"
                        onClick={closeModal}
                    />
                    <div className="fixed top-0 right-0 h-full w-96 bg-white bg-opacity-80 backdrop-blur-lg p-6 shadow-lg z-50 overflow-auto">
                        <h3 className="text-xl font-semibold mb-4 capitalize">
                            Agregar nuevo {modalType}
                        </h3>
                        <input
                            type="text"
                            placeholder="Nombre"
                            className="w-full border p-2 mb-4 rounded"
                            value={modalName}
                            onChange={(e) => setModalName(e.target.value)}
                        />
                        {modalType !== "color" && (
                            <textarea
                                placeholder="Descripción (opcional)"
                                className="w-full border p-2 mb-4 rounded resize-none"
                                rows={3}
                                value={modalDescription}
                                onChange={(e) => setModalDescription(e.target.value)}
                            />
                        )}
                        {modalType === "color" && (
                            <input
                                type="color"
                                className="w-full h-10 mb-4 rounded border cursor-pointer"
                                value={modalHexCode}
                                onChange={(e) => setModalHexCode(e.target.value)}
                            />
                        )}

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-4 py-2 rounded border hover:bg-gray-100"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleAddModalItem}
                                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
