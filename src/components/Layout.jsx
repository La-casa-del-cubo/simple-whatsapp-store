
import PublicMarquee from "./PublicMarquee.jsx";
import AdminSideMenu from "./AdminSideMenu.jsx";
import {useUser} from "../hooks/useUser.jsx";

import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { SupabaseContext } from "../contexts/SupabaseContext";


const officialColors = [
    "#ff0000", // rojo
    "#ff6400", // naranja
    "#ffff00", // amarillo
    "#00bb00", // verde
    "#0000bb", // azul
]

// Suavizar colores para estética más agradable
function softenColor(hex, percent = 0.6) {
    const num = parseInt(hex.replace("#", ""), 16)
    const r = Math.round(((num >> 16) & 255) * (1 - percent) + 255 * percent)
    const g = Math.round(((num >> 8) & 255) * (1 - percent) + 255 * percent)
    const b = Math.round((num & 255) * (1 - percent) + 255 * percent)
    return `rgb(${r},${g},${b})`
}

function MenuItem({ to, label, idx }) {
    // Prepara colores suavizados (memo para render)
    const colors = officialColors;

    // Aleatoriza colores para el cubo 2x2
    const shuffled = (() => {
        const arr = [...colors]
        for (let i = arr.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1))
            ;[arr[i], arr[j]] = [arr[j], arr[i]]
        }
        return arr.slice(0, 4)
    })()

    return (
        <Link
            to={to}
            className="flex items-center gap-2 px-4 py-2 rounded-md shadow-md text-black font-semibold transition transform duration-300 ease-in-out hover:scale-105 bg-white"
            aria-label={`Ir a ${label}`}
        >
            <svg width={28} height={28} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                {shuffled.map((color, i) => {
                    const x = (i % 2) * 12
                    const y = Math.floor(i / 2) * 12
                    return (
                        <rect
                            key={i}
                            x={x}
                            y={y}
                            width={12}
                            height={12}
                            fill={color}
                            rx={2}
                            ry={2}
                            stroke="#000"
                            strokeWidth={0.7}
                        />
                    )
                })}
            </svg>
            <span>{label}</span>
        </Link>
    )
}


export default function Layout({ children }) {
    const { user, isAdmin } = useUser();
    const supabase = useContext(SupabaseContext);
    const [menuPages, setMenuPages] = useState([]);

    useEffect(() => {
        async function fetchMenuPages() {
            const { data } = await supabase
                .from("page_configuration")
                .select("page_name, title")
                .eq("show_in_menu", true)
                .order("title", { ascending: true });
            if (data) setMenuPages(data);
        }
        fetchMenuPages();
    }, [supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        // Puedes agregar redirección aquí si quieres, por ejemplo a login
        window.location.href = "/";
    };


    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-gray-900 shadow sticky top-0 z-50">
                <PublicMarquee />
                <nav className="max-w-6xl mx-auto flex items-center h-16 space-x-6">
                    <div className="flex items-center space-x-2">
                        <img
                            src="/logo.png"
                            alt="Logo de la tienda"
                            className="w-10 h-10 object-contain"
                        />
                        <Link
                            to="/"
                            className="text-white text-lg font-bold select-none"
                            aria-label="Inicio"
                        >
                            La casa del cubo
                        </Link>
                    </div>

                    {menuPages.map((page, idx) => (

                            <MenuItem key={page.page_name} to={`/pages/${page.page_name}`} label={page.title} idx={idx} />
                    ))}

                    {isAdmin && (user && (
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                                >
                                    Cerrar sesión
                                </button>
                            )
                    )}
                </nav>
            </header>

            <div className="flex flex-1">
                {isAdmin && <aside className="w-64 flex-shrink-0 bg-gray-800 text-white"><AdminSideMenu isAdmin={isAdmin} /></aside>}
                <main className="flex-1 bg-white p-6">{children}</main>
            </div>

            <footer className="bg-gray-900 text-gray-300 p-6 text-center">
                &copy; {new Date().getFullYear()} La casa del cubo. Todos los derechos reservados.
            </footer>
        </div>
    );
}
