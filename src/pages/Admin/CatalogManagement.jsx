import { useContext, useEffect, useState } from "react";
import { SupabaseContext } from "../../contexts/SupabaseContext";
import {useImageUrls} from "../../hooks/useImagesUrls.jsx";

export default function CatalogManagement() {
    const supabase = useContext(SupabaseContext);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modals states and inputs for categories
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryError, setNewCategoryError] = useState(null);
    const [newCategoryDescription, setNewCategoryDescription] = useState("");

    // Modalities
    const [modalities, setModalities] = useState([]);
    const [showModalModalities, setShowModalModalities] = useState(false);
    const [newModalityName, setNewModalityName] = useState("");
    const [newModalityDescription, setNewModalityDescription] = useState("");
    const [newModalityError, setNewModalityError] = useState(null);

    // Types
    const [types, setTypes] = useState([]);
    const [showModalTypes, setShowModalTypes] = useState(false);
    const [newTypeName, setNewTypeName] = useState("");
    const [newTypeDescription, setNewTypeDescription] = useState("");
    const [newTypeError, setNewTypeError] = useState(null);

    // Shapes
    const [shapes, setShapes] = useState([]);
    const [showModalShapes, setShowModalShapes] = useState(false);
    const [newShapeName, setNewShapeName] = useState("");
    const [newShapeDescription, setNewShapeDescription] = useState("");
    const [newShapeError, setNewShapeError] = useState(null);

    // For image upload & preview
    const [existingImages, setExistingImages] = useState([]); // URLs ya guardadas
    const [imagesToDelete, setImagesToDelete] = useState([]); // URLs marcadas para borrar
    const [selectedFiles, setSelectedFiles] = useState([]); // nuevas imágenes locales para subir
    const [previewUrls, setPreviewUrls] = useState([]);
    const [uploading, setUploading] = useState(false);

    // Product form data building out with modalities, types, shapes
    const [formData, setFormData] = useState({
        id: null,
        name: "",
        description: "",
        price: "",
        category_id: null,
        modality_id: null,
        type_id: null,
        shape_id: null,
    });

    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
        fetchCategories();
        fetchModalities();
        fetchTypes();
        fetchShapes();
    }, []);

    // Fetch functions
    async function fetchData() {
        setLoading(true);
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .order("name", { ascending: true });
        if (error) setError(error.message);
        else setProducts(data);
        setLoading(false);
    }

    async function fetchCategories() {
        const { data, error } = await supabase.from("categories").select("*").order("name");
        if (!error) setCategories(data);
    }

    async function fetchModalities() {
        const { data, error } = await supabase.from("modalities").select("*").order("name");
        if (!error) setModalities(data);
    }

    async function fetchTypes() {
        const { data, error } = await supabase.from("types").select("*").order("name");
        if (!error) setTypes(data);
    }

    async function fetchShapes() {
        const { data, error } = await supabase.from("shapes").select("*").order("name");
        if (!error) setShapes(data);
    }

    // Handlers for adding new related entities (category, modality, type, shape)
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
        if (error) setNewCategoryError(error.message);
        else {
            setCategories((prev) => [...prev, data]);
            setNewCategoryName("");
            setNewCategoryDescription("");
            setShowCategoryModal(false);
            setShowModalTypes(false);
            setShowModalShapes(false);
            setShowModalModalities(false);
        }
    }

    async function handleAddModality() {
        setNewModalityError(null);
        if (!newModalityName.trim()) {
            setNewModalityError("El nombre no puede quedar vacío.");
            return;
        }
        const { data, error } = await supabase
            .from("modalities")
            .insert([{ name: newModalityName.trim(), description: newModalityDescription.trim() }])
            .select()
            .single();
        if (error) setNewModalityError(error.message);
        else {
            setModalities((prev) => [...prev, data]);
            setNewModalityName("");
            setNewModalityDescription("");
            setShowModalModalities(false);
        }
    }

    async function handleAddType() {
        setNewTypeError(null);
        if (!newTypeName.trim()) {
            setNewTypeError("El nombre no puede quedar vacío.");
            return;
        }
        const { data, error } = await supabase
            .from("types")
            .insert([{ name: newTypeName.trim(), description: newTypeDescription.trim() }])
            .select()
            .single();
        if (error) setNewTypeError(error.message);
        else {
            setTypes((prev) => [...prev, data]);
            setNewTypeName("");
            setNewTypeDescription("");
            setShowModalTypes(false);
        }
    }

    async function handleAddShape() {
        setNewShapeError(null);
        if (!newShapeName.trim()) {
            setNewShapeError("El nombre no puede quedar vacío.");
            return;
        }
        const { data, error } = await supabase
            .from("shapes")
            .insert([{ name: newShapeName.trim(), description: newShapeDescription.trim() }])
            .select()
            .single();
        if (error) setNewShapeError(error.message);
        else {
            setShapes((prev) => [...prev, data]);
            setNewShapeName("");
            setNewShapeDescription("");
            setShowModalShapes(false);
        }
    }

    // Image upload & preview handlers omitted for brevity - use previous code

    function resetForm() {
        setFormData({
            id: null,
            name: "",
            description: "",
            price: "",
            category_id: null,
            modality_id: null,
            type_id: null,
            shape_id: null,
        });
        setError(null);

        // Limpiar imágenes
        setSelectedFiles([]);
        previewUrls.forEach((url) => URL.revokeObjectURL(url));
        setPreviewUrls([]);
        setExistingImages([]);
        setImagesToDelete([]);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);

        if (!formData.name || !formData.price) {
            setError("El nombre y precio son obligatorios.");
            return;
        }

        setUploading(true);
        try {
            let productId = formData.id;

            if (productId) {
                // Actualizar producto
                const { error } = await supabase
                    .from("products")
                    .update({
                        name: formData.name,
                        description: formData.description,
                        price: parseFloat(formData.price),
                        category_id: formData.category_id,
                        modality_id: formData.modality_id,
                        type_id: formData.type_id,
                        shape_id: formData.shape_id,
                    })
                    .eq("id", productId);
                if (error){
                    console.error("Error actualizando producto:", error.message);
                }

                // Borra imágenes marcadas para eliminar
                await deleteImages(imagesToDelete);
            } else {
                // Crear producto nuevo
                const { data, error } = await supabase
                    .from("products")
                    .insert([
                        {
                            name: formData.name,
                            description: formData.description,
                            price: parseFloat(formData.price),
                            category_id: formData.category_id,
                            modality_id: formData.modality_id,
                            type_id: formData.type_id,
                            shape_id: formData.shape_id,
                        },
                    ])
                    .select()
                    .single();
                if (error) {
                    console.error("Error creando producto:", error.message);
                }
                productId = data.id;
            }

            // Subir imágenes nuevas y guardar registros
            const newImageUrls = await uploadImages(productId);
            await saveProductImages(productId, newImageUrls);

            resetForm();
            fetchData();
            alert("Producto guardado con éxito.");
        } catch (e) {
            setError(e.message);
        }
        setUploading(false);
    }

    async function handleEdit(product) {
        setFormData({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            category_id: product.category_id,
            modality_id: product.modality_id,
            type_id: product.type_id,
            shape_id: product.shape_id,
        });
        setError(null);
        setSelectedFiles([]);
        setPreviewUrls([]);
        // Aquí debes cargar las imágenes existentes del producto
        // Supongamos que tienes un endpoint o forma de obtener URLs guardadas
        const { data: imagesData, error } = await supabase
            .from("product_images")
            .select("image_url")
            .eq("product_id", product.id);
        if (!error && imagesData) {
            const urls = imagesData.map((img) => img.image_url);
            setExistingImages(urls);
            setImagesToDelete([]);
        } else {
            setExistingImages([]);
            setImagesToDelete([]);
        }
    }
    const imageUrls = useImageUrls(existingImages, supabase);

    async function handleDelete(id) {
        if (!window.confirm("¿Estás seguro de eliminar este producto?")) return;
        const { error } = await supabase.from("products").delete().eq("id", id);
        if (error) setError(error.message);
        else fetchData();
    }

    function handleFileChange(e) {
        const files = Array.from(e.target.files);
        const validImages = files.filter((file) => file.type.startsWith("image/"));
        if (validImages.length !== files.length) {
            alert("Sólo se permiten archivos de imagen.");
            return;
        }

        const newPreviewUrls = validImages.map((file) => URL.createObjectURL(file));
        setSelectedFiles((prev) => [...prev, ...validImages]);
        setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    }

    function removeNewImage(index) {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
        setPreviewUrls((prev) => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    }

    function removeExistingImage(urlToRemove) {
        setImagesToDelete((prev) => [...prev, urlToRemove]);
        setExistingImages((prev) => prev.filter((url) => url !== urlToRemove));
    }

    async function uploadImages() {
        if (selectedFiles.length === 0) return [];

        const uploadedUrls = [];

        for (const file of selectedFiles) {
            const fileExt = file.name.split(".").pop();
            const fileName = Date.now()}_${Math.random().toString(36).substring(2, 9);

            const { error: uploadError } = await supabase.storage
                .from("product-images")
                .upload(fileName, file, { cacheControl: "3600", upsert: false });

            if (uploadError) throw new Error(`Error subiendo imagen ${file.name}: ${uploadError.message}`);

            uploadedUrls.push(`${fileName}.${fileExt}`);
        }
        return uploadedUrls;
    }

    async function deleteImages(urls) {
        if (!urls.length) return;
        const { error } = await supabase
            .from("product_images")
            .delete()
            .in("image_url", urls);
        if (error) throw error;
    }

    async function saveProductImages(productId, imageUrls) {
        if (imageUrls.length === 0) return;

        const inserts = imageUrls.map((url) => ({
            product_id: productId,
            image_url: url,
        }));

        const { error } = await supabase.from("product_images").insert(inserts);
        if (error) throw error;
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-10 bg-gray-50 rounded-lg shadow-lg">
            <h1 className="text-4xl font-extrabold mb-10 text-gray-900">Gestión de Catálogo</h1>

            <form onSubmit={handleSubmit} className="mb-12 bg-white p-8 rounded-lg shadow-md space-y-6">
                {error && <div className="text-red-600 font-semibold">{error}</div>}

                <div>
                    <label className="block text-sm font-semibold mb-2">Nombre</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-2">Descripción</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-400 resize-none"
                        rows="4"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-2">Precio</label>
                    <input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
                        required
                    />
                </div>

                {/* Selectores con botón para agregar nuevo */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="flex justify-between items-center text-sm font-semibold mb-2">
                            Categoría
                            <button
                                type="button"
                                onClick={() => setShowCategoryModal(true)}
                                className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                            >
                                + Nueva
                            </button>
                        </label>
                        <select
                            value={formData.category_id ?? ""}
                            onChange={(e) => setFormData({ ...formData, category_id: e.target.value || null })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="">Seleccione categoría</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="flex justify-between items-center text-sm font-semibold mb-2">
                            Modalidad
                            <button
                                type="button"
                                onClick={() => setShowModalModalities(true)}
                                className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                            >
                                + Nueva
                            </button>
                        </label>
                        <select
                            value={formData.modality_id ?? ""}
                            onChange={(e) => setFormData({ ...formData, modality_id: e.target.value || null })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="">Seleccione modalidad</option>
                            {modalities.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="flex justify-between items-center text-sm font-semibold mb-2">
                            Marca
                            <button
                                type="button"
                                onClick={() => setShowModalTypes(true)}
                                className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                            >
                                + Nuevo
                            </button>
                        </label>
                        <select
                            value={formData.type_id ?? ""}
                            onChange={(e) => setFormData({ ...formData, type_id: e.target.value || null })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="">Seleccione tipo</option>
                            {types.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="flex justify-between items-center text-sm font-semibold mb-2">
                            Forma
                            <button
                                type="button"
                                onClick={() => setShowModalShapes(true)}
                                className="text-blue-600 hover:text-blue-800 text-xs font-semibold"
                            >
                                + Nueva
                            </button>
                        </label>
                        <select
                            value={formData.shape_id ?? ""}
                            onChange={(e) => setFormData({ ...formData, shape_id: e.target.value || null })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="">Seleccione forma</option>
                            {shapes.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2">Imágenes existentes</label>
                    {existingImages.length === 0 && <p className="text-gray-500">No hay imágenes.</p>}
                    <div className="flex flex-wrap gap-3">
                        {existingImages.map((url, i) => (
                            <div key={url} className="relative w-24 h-24 border rounded overflow-hidden">
                                <img src={imageUrls[i]} alt={`Imagen ${i + 1}`} className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeExistingImage(url)}
                                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700"
                                    aria-label="Eliminar imagen"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Images upload */}
                <div>
                    <label className="block text-sm font-semibold mb-2">Agregar nuevas imágenes</label>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="mb-3 w-full border rounded cursor-pointer"
                    />
                    {previewUrls.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                            {previewUrls.map((url, i) => (
                                <div key={i} className="relative w-24 h-24 border rounded overflow-hidden">
                                    <img src={url} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeNewImage(i)}
                                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700"
                                        aria-label="Eliminar imagen"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Submit button */}
                <div className="mt-8">
                    <button
                        type="submit"
                        disabled={uploading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded shadow disabled:opacity-50"
                    >
                        {uploading ? "Guardando..." : formData.id ? "Actualizar Producto" : "Agregar Producto"}
                    </button>
                </div>
            </form>

            {/* Modals definitions left unchanged, you can style similarly importing or creating your own Modals */}

            {showCategoryModal && (
                <Modal
                    title="Agregar Nueva Categoria"
                    onClose={() => {
                        setShowCategoryModal(false);
                        setNewCategoryName("");
                        setNewCategoryDescription("");
                        setNewCategoryError(null);
                    }}
                    onSave={handleAddCategory}
                    error={newCategoryError}
                    input={[
                        {
                            label: "Nombre de la categoria",
                            value: newCategoryName,
                            onChange: (e) => setNewCategoryName(e.target.value),
                            type: "text",
                        },
                        {
                            label: "Descripción de la categoria (opcional)",
                            value: newCategoryDescription,
                            onChange: (e) => setNewCategoryDescription(e.target.value),
                            type: "textarea",
                        },
                    ]}
                />
            )}
            {showModalTypes && (
                <Modal
                    title="Agregar Nueva Marca"
                    onClose={() => {
                        setShowModalTypes(false);
                        setNewTypeName("");
                        setNewTypeDescription("");
                        setNewTypeError(null);
                    }}
                    onSave={handleAddType}
                    error={newTypeError}
                    input={[
                        {
                            label: "Nombre de la marca",
                            value: newTypeName,
                            onChange: (e) => setNewTypeName(e.target.value),
                            type: "text",
                        },
                        {
                            label: "Descripción de la marca (opcional)",
                            value: newTypeDescription,
                            onChange: (e) => setNewTypeDescription(e.target.value),
                            type: "textarea",
                        },
                    ]}
                />
            )}

            {showModalModalities && (
                <Modal
                    title="Agregar Nueva Modalidad"
                    onClose={() => {
                        setShowModalModalities(false);
                        setNewModalityName("");
                        setNewModalityDescription("");
                        setNewModalityError(null);
                    }}
                    onSave={handleAddModality}
                    error={newModalityError}
                    input={[
                        {
                            label: "Nombre de la modalidad",
                            value: newModalityName,
                            onChange: (e) => setNewModalityName(e.target.value),
                            type: "text",
                        },
                        {
                            label: "Descripción de la modalidad (opcional)",
                            value: newModalityDescription,
                            onChange: (e) => setNewModalityDescription(e.target.value),
                            type: "textarea",
                        },
                    ]}
                />
            )}

            {showModalShapes && (
                <Modal
                    title="Agregar Nueva Forma"
                    onClose={() => {
                        setShowModalShapes(false);
                        setNewShapeName("");
                        setNewShapeDescription("");
                        setNewShapeError(null);
                    }}
                    onSave={handleAddShape}
                    error={newShapeError}
                    input={[
                        {
                            label: "Nombre de la forma",
                            value: newShapeName,
                            onChange: (e) => setNewShapeName(e.target.value),
                            type: "text",
                        },
                        {
                            label: "Descripción de la forma (opcional)",
                            value: newShapeDescription,
                            onChange: (e) => setNewShapeDescription(e.target.value),
                            type: "textarea",
                        },
                    ]}
                />
            )}

            {/* Table section styled */}
            {loading ? (
                <p className="text-center mt-6">Cargando productos...</p>
            ) : products.length === 0 ? (
                <p className="text-center mt-6">No hay productos registrados.</p>
            ) : (
                <table className="w-full border-collapse text-sm shadow-md rounded-lg overflow-hidden">
                    <thead>
                    <tr className="bg-indigo-600 text-white">
                        <th className="p-3">Nombre</th>
                        <th className="p-3">Precio</th>
                        <th className="p-3">Categoría</th>
                        <th className="p-3">Modalidad</th>
                        <th className="p-3">Tipo</th>
                        <th className="p-3">Forma</th>
                        <th className="p-3">Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {products.map((product) => (
                        <tr key={product.id} className="border-b hover:bg-indigo-50 transition">
                            <td className="p-3">{product.name}</td>
                            <td className="p-3">${product.price.toFixed(2)}</td>
                            <td className="p-3">{categories.find((c) => c.id === product.category_id)?.name || "Sin categoría"}</td>
                            <td className="p-3">{modalities.find((m) => m.id === product.modality_id)?.name || "N/A"}</td>
                            <td className="p-3">{types.find((t) => t.id === product.type_id)?.name || "N/A"}</td>
                            <td className="p-3">{shapes.find((s) => s.id === product.shape_id)?.name || "N/A"}</td>
                            <td className="p-3 flex space-x-2">
                                <button
                                    onClick={() => handleEdit(product)}
                                    className="bg-yellow-400 px-4 py-1 rounded hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
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

// Modal simple, you can customize styling more if you want
function Modal({ title, onClose, onSave, error, input }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-md max-w-sm w-full">
                <h2 className="text-xl font-bold mb-4">{title}</h2>

                {error && <div className="mb-3 text-red-600 font-semibold">{error}</div>}

                {input.map(({ label, value, onChange, type }, i) =>
                    type === "textarea" ? (
                        <textarea
                            key={i}
                            placeholder={label}
                            value={value}
                            onChange={onChange}
                            className="w-full border p-2 rounded resize-none mb-4"
                            rows={3}
                        />
                    ) : (
                        <div key={i} className="mb-4">
                            <label className="block mb-1 font-semibold">{label}</label>
                            <input
                                type={type}
                                value={value}
                                onChange={onChange}
                                className="w-full border p-2 rounded"
                            />
                        </div>
                    )
                )}

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded border hover:bg-gray-100 focus:outline-none focus:ring-2"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onSave}
                        className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2"
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
}
