import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { SupabaseContext } from "../../contexts/SupabaseContext";

export default function ProductDetail() {
    const supabase = useContext(SupabaseContext);
    const { productId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedColorId, setSelectedColorId] = useState(null);

    // Extraemos filtros previos del query params para pasar al volver
    const searchParams = new URLSearchParams(location.search);
    const previousFilters = searchParams.toString() ? `?${searchParams.toString()}` : "";

    useEffect(() => {
        async function fetchProduct() {
            setLoading(true);
            const { data, error } = await supabase
                .from("products")
                .select(`
          *,
          categories(name),
          modalities(name),
          types(name),
          shapes(name),
          product_colors(color_id, colors(name, hex_code))
        `)
                .eq("id", productId)
                .single();

            if (error) {
                console.error("Error cargando producto:", error.message);
                setProduct(null);
            } else {
                setProduct(data);
            }
            setLoading(false);
        }
        fetchProduct();
    }, [productId, supabase]);

    function handleWhatsApp(product) {
        const whatsappNumber = "+5215551234567"; // Cambia por tu número real
        const colorName = selectedColorId || "Original";

        const message = `
            Hola! Estoy interesado en el producto:
            Nombre: ${product.name}
            Descripción: ${product.description || "Sin descripción"}
            Precio: $${product.price}
            Color seleccionado: ${colorName}
            ¿Me puedes ayudar con la compra?
            `.trim();

        const url = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank");
    }


    function handleBack() {
        navigate(`/${previousFilters}`);
    }

    if (loading) {
        return <div className="p-8 text-center">Cargando producto...</div>;
    }

    if (!product) {
        return <div className="p-8 text-center text-red-600">Producto no encontrado.</div>;
    }

    return (
        <div className="max-w-5xl mx-auto p-6 bg-white rounded shadow my-8">
            <button
                onClick={handleBack}
                className="mb-4 text-blue-600 hover:underline"
            >
                &laquo; Volver al catálogo
            </button>

            <div className="flex flex-col md:flex-row gap-6">
                <img
                    src={product.image_url || "/placeholder.jpg"}
                    alt={product.name}
                    className="w-full md:w-1/2 h-auto rounded object-cover"
                />

                <div className="flex flex-col flex-1">
                    <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

                    <div className="mb-4 text-gray-700">{product.description || "Sin descripción."}</div>

                    <div className="flex flex-wrap gap-2 mb-4">
                        {product.categories && (
                            <span className="px-3 py-1 bg-gray-200 rounded">{product.categories.name}</span>
                        )}
                        {product.modalities && (
                            <span className="px-3 py-1 bg-gray-200 rounded">{product.modalities.name}</span>
                        )}
                        {product.types && (
                            <span className="px-3 py-1 bg-gray-200 rounded">{product.types.name}</span>
                        )}
                        {product.shapes && (
                            <span className="px-3 py-1 bg-gray-200 rounded">{product.shapes.name}</span>
                        )}
                        {product.product_colors.length > 0 && (
                            <select
                                value={selectedColorId || "Original"}
                                onChange={(e) => setSelectedColorId(e.target.value)}
                            >
                                <option value="">Selecciona un color</option>
                                {product.product_colors.map(pc => (
                                    <option style={{ backgroundColor: pc.colors.hex_code || "#ccc" }} key={pc.color_id} value={pc.colors.name}>{pc.colors.name} {pc.colors.id}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div className="text-2xl font-bold text-green-700 mb-6">${product.price}</div>

                    <button
                        onClick={() => handleWhatsApp(product)}
                        className="bg-green-600 text-white px-6 py-3 rounded shadow hover:bg-green-700 transition"
                        aria-label={`Pedir producto ${product.name} por WhatsApp`}
                    >
                        Pedir por WhatsApp
                    </button>
                </div>
            </div>
        </div>
    );
}
