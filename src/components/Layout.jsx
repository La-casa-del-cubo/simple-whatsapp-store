// src/components/Layout.jsx
import Header from "./Header";
import PublicMarquee from "./PublicMarquee.jsx";

export default function Layout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <PublicMarquee />
            <Header />
            <main className="flex-grow">{children}</main>
            {/* Agrega footer si quieres */}
        </div>
    );
}
