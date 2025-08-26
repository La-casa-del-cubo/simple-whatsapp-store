import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { SupabaseContext } from "../../contexts/SupabaseContext";
import {useImageUrls} from "../../hooks/useImagesUrls.jsx";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ProductImagesCarousel from "../../components/ProductImageCarousel.jsx";
import DynamicCubeTitle from "../../components/DynamicCubeTitle.jsx";

export default function ProductDetail() {
    const supabase = useContext(SupabaseContext);
    const { productId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedColorId, setSelectedColorId] = useState(null);
    const [imageFilePaths, setImageFilePaths] = useState([]); // nuevo estado para filePaths

    // Extraemos filtros previos del query params para pasar al volver
    const searchParams = new URLSearchParams(location.search);
    const previousFilters = searchParams.toString() ? `?${searchParams.toString()}` : "";

    const settings = {
        dots: true,
        infinite: true,
        speed: 300,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
    };

    const [loadingWhatsApp, setLoadingWhatsApp] = useState(false);

    async function handleWhatsAppClick() {
        setLoadingWhatsApp(true);

        try {
            const { data: whatsappConfig, error } = await supabase
                .from("whatsapp_config")
                .select("*")
                .limit(1)
                .single();

            if (error) throw error;
            const colorName = selectedColorId || "Original";
            console.log(product)

            const phone = whatsappConfig?.phone_number || "+5210000000000";
            const defaultMessage = whatsappConfig?.default_message || "Hola, me interesa este producto.";
            const message = `${defaultMessage}\n
            Nombre: ${product.name}\n
            Descripción: ${product.description || "Sin descripción"}\n
            Marca: ${product.categories.name}\n
            Tipo: ${product.types.name}\n
            Shape: ${product.shapes.name}\n
            Precio: $${product.price}\n
            Color seleccionado: ${colorName}\n
            ¿Me puedes ayudar con la compra?
            `.trim();

            const url = `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;

            window.open(url, "_blank");
        } catch (e) {
            alert("Error obteniendo la configuración de WhatsApp: " + e.message);
        }

        setLoadingWhatsApp(false);
    }

    useEffect(() => {
        async function fetchProduct() {
            setLoading(true);
            const { data, error } = await supabase
                .from("products")
                .select(`
          *,
          product_images(image_url),
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
                setImageFilePaths([]);
            } else {
                setProduct(data);
                if (data.product_images?.length) {
                    // Extrae solo el filePath desde la columna image_url
                    setImageFilePaths(data.product_images.map(img => {
                        // Si guardaste la url completa, extrae solo el path:
                        try {
                            const url = new URL(img.image_url);
                            // Asume que el filePath son los segmentos después de /object/product-images/
                            const pathMatch = url.pathname.match(/\/object\/product-images\/(.+)/);
                            return pathMatch ? pathMatch[1] : img.image_url;
                        } catch {
                            // Si ya es un path, úsalo directamente
                            return img.image_url;
                        }
                    }));
                } else {
                    setImageFilePaths([]);
                }
            }
            setLoading(false);
        }
        fetchProduct();
    }, [productId, supabase]);

    const imageUrls = useImageUrls(imageFilePaths, supabase);

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
                <div className="md:w-1/2">
                    {imageUrls.length > 0 ? (
                        <ProductImagesCarousel imageUrls={imageUrls} />
                    ) : (
                        <div className="w-full h-96 bg-gray-200 flex items-center justify-center rounded text-gray-500">
                            Sin imágenes disponibles
                        </div>
                    )}
                </div>

                <div className="flex flex-col flex-1">
                    <DynamicCubeTitle title={product.name} />

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
                        onClick={() => handleWhatsAppClick(product)}
                        disabled={loadingWhatsApp}
                        className="bg-green-600 text-white px-6 py-3 rounded shadow hover:bg-green-700 transition"
                        aria-label={`Pedir producto ${product.name} por WhatsApp`}
                    >
                        {loadingWhatsApp ? "Cargando..." : "Pedir por WhatsApp"}
                    </button>
                </div>
            </div>
        </div>
    );
}
