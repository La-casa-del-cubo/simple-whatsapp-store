// src/App.js
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Auth/Login";
import Catalog from "./pages/Public/Catalog";
import Cart from "./pages/Public/Cart";
import AboutUs from "./pages/Public/AboutUs";
import About from "./pages/Public/About";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProductForm from "./pages/Admin/AdminProductForm.jsx";
import ProductDetail from "./pages/Public/ProductDetail.jsx";
import MarqueeTipTap from "./pages/Admin/MarqueeTipTap.jsx";
import AdminWhatsApp from "./pages/Admin/WhatsAppSettings";
import CatalogManagement from "./pages/Admin/CatalogManagement.jsx";

function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    {/* Páginas públicas */}
                    <Route path="/" element={<Catalog />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/sobre-nosotros" element={<AboutUs />} />
                    <Route path="/acerca-de" element={<About />} />
                    <Route path="/product/:productId" element={<ProductDetail />} />

                    {/* Auth */}
                    <Route path="/login" element={<Login />} />

                    {/* Admin privadas */}
                    <Route
                        path="/admin/catalog"
                        element={
                            <ProtectedRoute>
                                <CatalogManagement />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/banner"
                        element={
                            <ProtectedRoute>
                                <MarqueeTipTap />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/whatsapp"
                        element={
                            <ProtectedRoute>
                                <AdminWhatsApp />
                            </ProtectedRoute>
                        }
                    />

                    {/* catch-all */}
                    <Route path="*" element={<div>Página no encontrada</div>} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}

export default App;
