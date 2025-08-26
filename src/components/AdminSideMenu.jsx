import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { SupabaseContext } from "../contexts/SupabaseContext";

// Opcional: Recibe prop user o saca del contexto si tienes hook global de usuario/admin
export default function AdminSideMenu({ isAdmin }) {
    const location = useLocation();

    if (!isAdmin) return null;

    const menuItems = [
        { name: "Marquee", path: "/admin/banner" },
        { name: "Gestión del Catálogo", path: "/admin/catalog" },
        { name: "Catálogo", path: "/" },
        { name: "Configuración WhatsApp", path: "/admin/whatsapp" },
    ];

    return (
        <nav className="bg-gray-800 text-white w-64 min-h-screen p-6 sticky top-0 hidden md:block">
            <h2 className="text-lg font-bold mb-6">Panel Admin</h2>
            <ul className="space-y-3">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;

                    return (
                        <li key={item.path}>
                            <Link
                                to={item.path}
                                className={`block px-4 py-2 rounded hover:bg-gray-700 transition ${
                                    isActive ? "bg-gray-700 font-semibold" : ""
                                }`}
                            >
                                {item.name}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
