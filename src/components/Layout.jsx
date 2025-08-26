// src/components/Layout.jsx
import Header from "./Header";
import PublicMarquee from "./PublicMarquee.jsx";
import AdminSideMenu from "./AdminSideMenu.jsx";
import {useUser} from "../hooks/useUser.jsx";

export default function Layout({ children }) {
    const { user, isAdmin } = useUser();
    console.log(user);

    //if (!isAdmin) return <div>No tienes permiso para ver esta sección.</div>;
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Marquee público en la parte superior */}
            <PublicMarquee />

            {/* Header con logout */}
            <Header />

            <div className="flex flex-grow">
                {/* Menú lateral solo visible para admin */}
                {isAdmin && <AdminSideMenu isAdmin={isAdmin} />}

                {/* Contenido principal */}
                <main className="flex-grow p-6 max-w-full">{children}</main>
            </div>
        </div>
    );
}
