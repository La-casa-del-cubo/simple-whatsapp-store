// src/App.js
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Auth/Login";
import Catalog from "./pages/Public/Catalog";
import ProtectedRoute from "./components/ProtectedRoute";
import ProductDetail from "./pages/Public/ProductDetail.jsx";
import MarqueeTipTap from "./pages/Admin/MarqueeTipTap.jsx";
import AdminWhatsApp from "./pages/Admin/WhatsAppSettings";
import CatalogManagement from "./pages/Admin/CatalogManagement.jsx";
import PagesAdmin from "./pages/Admin/PagesAdmin.jsx";
import PublicPage from "./pages/Public/PublicPage.jsx";
import PagesList from "./components/PagesList.jsx";

function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    {/* Páginas públicas */}
                    <Route path="/" element={<Catalog />} />
                    <Route path="/product/:productId" element={<ProductDetail />} />
                    <Route path="/pages/:slug" element={<PublicPage />} />

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

                    <Route path="/admin/pages" element={
                        <ProtectedRoute>
                            <PagesList />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/pages/:page_name" element={
                        <ProtectedRoute>
                            <PagesAdmin />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/pages/new" element={
                        <ProtectedRoute>
                            <PagesAdmin isNew />
                        </ProtectedRoute>
                    } />

                    {/* catch-all */}
                    <Route path="*" element={<div>Página no encontrada</div>} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}

export default App;
