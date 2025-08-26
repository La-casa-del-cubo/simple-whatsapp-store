import React, { useMemo } from "react";

const officialColors = [
    "#ff0000", // rojo
    "#ff6400", // naranja
    "#ffff00", // amarillo
    "#00bb00", // verde
    "#0000bb", // azul
    "#ffffff", // blanco (adaptamos a blanco)
];

// Función para suavizar colores (blend con blanco)
function softenColor(hex, percent = 0.5) {
    const num = parseInt(hex.replace("#", ""), 16);
    const r = Math.round(((num >> 16) & 0xff) * (1 - percent) + 255 * percent);
    const g = Math.round(((num >> 8) & 0xff) * (1 - percent) + 255 * percent);
    const b = Math.round((num & 0xff) * (1 - percent) + 255 * percent);
    return `rgb(${r}, ${g}, ${b})`;
}

export default function DynamicCubeTitle({ title, isDynamic }) {
    // Crear array suavizado de colores
    const colors = useMemo(() => {
        return officialColors.map(color => softenColor(color, 0));
    }, []);

    // Función para barajar colores
    const shuffledColors = useMemo(() => {
        const arr = [...colors];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        // Queremos 9 colores para cubo 3x3, repetimos si hace falta
        while (arr.length < 9) arr.push(...arr);
        return arr.slice(0, 9);
    }, [colors]);

    return (
        <div className={`flex items-center gap-4 my-12 ${isDynamic ? "justify-center" : ""}`}>
            <svg
                width="44"
                height="44"
                viewBox="0 0 36 36"
                className="block shadow-lg"
                style={{ backgroundColor: "#f8f9fa" }}
            >
                {shuffledColors.map((color, i) => {
                    const x = (i % 3) * 12;
                    const y = Math.floor(i / 3) * 12;
                    return (
                        <rect
                            key={i}
                            x={x}
                            y={y}
                            width={12}
                            height={12}
                            fill={color}
                            stroke="#aaa"
                            strokeWidth="0.8"
                            rx="2"
                            ry="2"
                            style={{ transition: "fill 0.6s ease" }}
                        />
                    );
                })}
            </svg>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 drop-shadow-md">
                {title}
            </h1>
        </div>
    );
}