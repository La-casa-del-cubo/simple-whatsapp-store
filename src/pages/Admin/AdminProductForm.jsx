import { useState, useEffect, useContext } from "react";
import { SupabaseContext } from "../../contexts/SupabaseContext";

export default function AdminProductForm({ onSaved }) {
    const supabase = useContext(SupabaseContext);

    // Datos del producto
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

    // Imágenes seleccionadas (archivos locales para previsualización)
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagesPreviews, setImagesPreviews] = useState([]);

    // Estados de listas para selects
    const [categories, setCategories] = useState([]);
    const [modalities, setModalities] = useState([]);
    const [types, setTypes] = useState([]);
    const [shapes, setShapes] = useState([]);
    const [colors, setColors] = useState([]);
    const [selectedColors, setSelectedColors] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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

    // Manejar selección de archivos de imagen
    function handleImageSelection(event) {
        const files = Array.from(event.target.files);
        if (!files.length) return;

        // Validar que sean imágenes
        const validImages = files.filter(file => file.type.startsWith('image/'));

        if (validImages.length !== files.length) {
            alert("Solo se permiten archivos de imagen");
            return;
        }

        // Crear URLs de previsualización
        const newPreviews = validImages.map(file => ({
            file,
            url: URL.createObjectURL(file),
            id: Math.random().toString(36).substr(2, 9)
        }));

        setSelectedImages(prev => [...prev, ...validImages]);
        setImagesPreviews(prev => [...prev, ...newPreviews]);
    }

    // Remover imagen de la lista
    function removeImage(previewId) {
        setImagesPreviews(prev => {
            const updated = prev.filter(p => p.id !== previewId);
            // Liberar memoria de las URLs de objeto
            const toRemove = prev.find(p => p.id === previewId);
            if (toRemove) URL.revokeObjectURL(toRemove.url);
            return updated;
        });

        setSelectedImages(prev => {
            const indexToRemove = imagesPreviews.findIndex(p => p.id === previewId);
            return prev.filter((_, index) => index !== indexToRemove);
        });
    }

    // Subir imágenes a Supabase Storage
    async function uploadImages() {
        if (selectedImages.length === 0) return [];

        const uploadedUrls = [];

        for (const file of selectedImages) {
            const fileExt = file.name.split(".").pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

            const { data, error } = await supabase.storage
                .from("product-images")
                .upload(fileName, file, {
                    cacheControl: "3600",
                    upsert: false
                });

            if (error) {
                throw new Error(`Error subiendo imagen ${file.name}: ${error.message}`);
            }

            const { data: publicUrl } = supabase.storage
                .from("product-images")
                .getPublicUrl(fileName);

            uploadedUrls.push(publicUrl.publicUrl);
        }

        return uploadedUrls;
    }

    // Guardar imágenes en la tabla product_images
    async function saveProductImages(productId, imageUrls) {
        if (imageUrls.length === 0) return;

        const inserts = imageUrls.map(url => ({
            product_id: productId,
            image_url: url
        }));

        const { error } = await supabase
            .from("product_images")
            .insert(inserts);

        if (error) throw error;
    }

    // Manejar colores seleccionados
    function toggleColor(colorId) {
        setSelectedColors(prev =>
            prev.includes(colorId)
                ? prev.filter(id => id !== colorId)
                : [...prev, colorId]
        );
    }

    // Guardar producto completo con imágenes
    async function handleSave() {
        if (!formData.name || !formData.price) {
            setError("Nombre y precio son obligatorios");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 1. Guardar producto
            let productId = formData.id;

            if (productId) {
                // Actualizar producto existente
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

                if (error) throw error;
            } else {
                // Crear nuevo producto
                const { data, error } = await supabase
                    .from("products")
                    .insert([{
                        name: formData.name,
                        description: formData.description,
                        price: parseFloat(formData.price),
                        category_id: formData.category_id,
                        modality_id: formData.modality_id,
                        type_id: formData.type_id,
                        shape_id: formData.shape_id,
                    }])
                    .select()
                    .single();

                if (error) throw error;
                productId = data.id;
            }

            // 2. Subir imágenes a Storage
            const imageUrls = await uploadImages();

            // 3. Guardar URLs de imágenes en la base de datos
            await saveProductImages(productId, imageUrls);

            // 4. Guardar relación de colores
            if (productId && selectedColors.length > 0) {
                await supabase.from("product_colors").delete().eq("product_id", productId);

                const colorInserts = selectedColors.map(colorId => ({
                    product_id: productId,
                    color_id: colorId
                }));

                const { error } = await supabase.from("product_colors").insert(colorInserts);
                if (error) throw error;
            }

            // Limpiar formulario
            resetForm();

            if (onSaved) onSaved();
            alert("Producto guardado exitosamente con todas las imágenes");

        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

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

        // Limpiar imágenes y liberar memoria
        imagesPreviews.forEach(preview => URL.revokeObjectURL(preview.url));
        setSelectedImages([]);
        setImagesPreviews([]);
        setSelectedColors([]);
        setError(null);
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
            <h2 className="text-2xl font-bold mb-6">Crear/Editar Producto</h2>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                {/* Campos básicos del producto */}
                <div>
                    <label className="block font-semibold mb-1">Nombre *</label>
                    <input
                        type="text"
                        required
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
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block font-semibold mb-1">Precio *</label>
                    <input
                        type="number"
                        required
                        step="0.01"
                        className="w-full border rounded px-3 py-2"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                </div>

                {/* Selects para categoría, modalidad, etc. */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block font-semibold mb-1">Categoría</label>
                        <select
                            className="w-full border rounded px-3 py-2"
                            value={formData.category_id ?? ""}
                            onChange={(e) => setFormData({ ...formData, category_id: e.target.value || null })}
                        >
                            <option value="">Selecciona una categoría</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block font-semibold mb-1">Modalidad</label>
                        <select
                            className="w-full border rounded px-3 py-2"
                            value={formData.modality_id ?? ""}
                            onChange={(e) => setFormData({ ...formData, modality_id: e.target.value || null })}
                        >
                            <option value="">Selecciona una modalidad</option>
                            {modalities.map(mod => (
                                <option key={mod.id} value={mod.id}>{mod.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Subida de imágenes */}
                <div>
                    <label className="block font-semibold mb-2">Imágenes del producto</label>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageSelection}
                        className="w-full border rounded px-3 py-2 mb-3"
                    />

                    {/* Previsualización de imágenes */}
                    {imagesPreviews.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {imagesPreviews.map(preview => (
                                <div key={preview.id} className="relative">
                                    <img
                                        src={preview.url}
                                        alt="Preview"
                                        className="w-full h-24 object-cover rounded border"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(preview.id)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Colores */}
                <div>
                    <label className="block font-semibold mb-2">Colores</label>
                    <div className="flex flex-wrap gap-2">
                        {colors.map(color => (
                            <label key={color.id} className="inline-flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedColors.includes(color.id)}
                                    onChange={() => toggleColor(color.id)}
                                />
                                <span
                                    className="w-5 h-5 rounded border"
                                    style={{ backgroundColor: color.hex_code || "#ccc" }}
                                />
                                <span>{color.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {loading ? "Guardando producto e imágenes..." : "Guardar Producto"}
                </button>
            </div>
        </div>
    );
}
