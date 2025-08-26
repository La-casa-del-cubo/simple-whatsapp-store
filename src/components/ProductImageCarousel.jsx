import { useState, useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function ProductImagesCarousel({ imageUrls }) {
    const [nav1, setNav1] = useState(null);
    const [nav2, setNav2] = useState(null);

    const slider1 = useRef(null);
    const slider2 = useRef(null);

    // Configuraciones del slider principal
    const mainSettings = {
        asNavFor: nav2,
        ref: slider => setNav1(slider),
        arrows: true,
        fade: true,
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
    };

    // Configuraciones del slider de miniaturas
    const thumbSettings = {
        asNavFor: nav1,
        ref: slider => setNav2(slider),
        slidesToShow: Math.min(imageUrls.length, 5),
        swipeToSlide: true,
        focusOnSelect: true,
        centerMode: true,
        infinite: true,
        arrows: false,
        vertical: false,
        dots: false,
    };

    return (
        <div>
            {/* Slider principal */}
            <Slider {...mainSettings}>
                {imageUrls.map((url, index) => (
                    <div key={index}>
                        <img
                            src={url}
                            alt={`Producto imagen ${index + 1}`}
                            className="w-full h-[500px] object-cover rounded"
                            loading="lazy"
                            style={{ userSelect: "none" }}
                        />
                    </div>
                ))}
            </Slider>

            {/* Slider de miniaturas */}
            <div className="mt-4 mx-auto max-w-md cursor-pointer">
                <Slider {...thumbSettings}>
                    {imageUrls.map((url, index) => (
                        <div key={index} className="px-1">
                            <img
                                src={url}
                                alt={`Miniatura ${index + 1}`}
                                className="h-20 object-cover rounded border border-gray-300 hover:border-blue-500"
                                loading="lazy"
                                style={{ userSelect: "none" }}
                            />
                        </div>
                    ))}
                </Slider>
            </div>
        </div>
    );
}
