import { createBrowserRouter } from "react-router-dom";
import DownPage from "@/pages/DownPage";

/* =========================================================================
   ORIGINAL ROUTES (Commented out temporarily due to project stoppage)
   =========================================================================

import { Navigate } from "react-router-dom";
import { MainLayout } from "@/common/components/layout/MainLayout";
import { ManagementLayout } from "@/common/components/layout/ManagementLayout";

// Features
import Index from "@/features/homepage/pages/Index";
import HistoriaPage from "@/features/homepage/pages/HistoryPage";
import UserDetailsPage from "@/features/users/pages/UserDetailsPage";
import UserEditPage from "@/features/users/pages/UserEditPage";

// Content
import RoomsPage from "@/features/content/pages/RoomsPage";
import SelectedRoomPage from "@/features/content/pages/SelectedRoomPage";
import BookPage from "@/features/content/pages/BookPage";
import NewsListPage from "@/features/content/pages/NewsListPage";
import NewsDetailPage from "@/features/content/pages/NewsDetailPage";

// Reservations
import PrestamoSala from "@/features/room-bookings/pages/RoomBookingPage";
import MisPrestamos from "@/features/loans/pages/MyLoansPage";

// Management
import CollectionPage from "@/features/content-management/pages/CollectionManagementPage";
import BookFormPage from "@/features/content-management/pages/BookFormPage";
import VideoFormPage from "@/features/content-management/pages/VideoFormPage";
import GenresManagementPage from "@/features/content-management/pages/GenresManagementPage";
import GenreFormPage from "@/features/content-management/pages/GenreFormPage";
import LanguageManagementPage from "@/features/content-management/pages/LanguageManagementPage";
import LanguageFormPage from "@/features/content-management/pages/LanguageFormPage";
import MaterialManagementPage from "@/features/content-management/pages/MaterialManagementPage";
import MaterialFormPage from "@/features/content-management/pages/MaterialFormPage";
import AuthorManagementPage from "@/features/content-management/pages/AuthorManagementPage";
import AuthorFormPage from "@/features/content-management/pages/AuthorFormPage";
import ProfileManagementPage from "@/features/content-management/pages/ProfileManagementPage";
import ProfileFormPage from "@/features/content-management/pages/ProfileFormPage";
import Estadisticas from "@/features/content-management/pages/StatisticsDashboardPage";
import RoomBookingManagementPage from "@/features/room-bookings/pages/RoomBookingManagementPage";
import FastCheckoutPage from "@/features/loans/pages/FastCheckoutPage";
import NewsManagementPage from "@/features/content-management/pages/NewsManagementPage";
import NewsFormPage from "@/features/content-management/pages/NewsFormPage";

import NotFound from "@/pages/NotFound";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />, // Contiene Sidebar, Header y Footer
        errorElement: <NotFound />,
        children: [
            { index: true, element: <Index /> },
            { path: "historia", element: <HistoriaPage /> },
            { path: "perfil/", element: <UserDetailsPage /> },
            { path: "perfil/editar", element: <UserEditPage /> },

            // Catalog
            {
                path: "salas",
                children: [
                    { index: true, element: <RoomsPage /> },
                    { path: ":roomName", element: <SelectedRoomPage /> }
                ]
            },
            { path: "libros/:slug", element: <BookPage /> },

            // Reservations (Unified)
            {
                path: "reservas",
                children: [
                    { path: "salas", element: <PrestamoSala /> },
                    { path: "libros", element: <MisPrestamos /> },
                ]
            },
            // Redirect old routes to new ones (Optional but good for UX, though we rely on link updates mostly)
            { path: "prestamo/sala", element: <Navigate to="/reservas/salas" replace /> },

            // News
            { path: "noticias", element: <NewsListPage /> },
            { path: "noticias/:slug", element: <NewsDetailPage /> },
        ]
    },
    {
        path: "gestion",
        element: <ManagementLayout />, // Layout simplificado para admin
        children: [
            { path: "coleccion", element: <CollectionPage /> },
            { path: "libro/create", element: <BookFormPage /> },
            { path: "libro/:slug", element: <BookFormPage /> },
            { path: "video/create", element: <VideoFormPage /> },
            { path: "video/:slug", element: <VideoFormPage /> },

            { path: "generos", element: <GenresManagementPage /> },
            { path: "generos/create", element: <GenreFormPage /> },
            { path: "generos/:slug", element: <GenreFormPage /> },

            { path: "lenguajes", element: <LanguageManagementPage /> },
            { path: "lenguajes/create", element: <LanguageFormPage /> },
            { path: "lenguajes/:id", element: <LanguageFormPage /> },

            { path: "materiales", element: <MaterialManagementPage /> },
            { path: "materiales/create", element: <MaterialFormPage /> },
            { path: "materiales/:id", element: <MaterialFormPage /> },

            { path: "autores", element: <AuthorManagementPage /> },
            { path: "autores/create", element: <AuthorFormPage /> },
            { path: "autores/:slug", element: <AuthorFormPage /> },

            { path: "usuarios", element: <ProfileManagementPage /> },
            { path: "usuarios/create", element: <ProfileFormPage /> },
            { path: "usuarios/:id", element: <ProfileFormPage /> },

            { path: "estadisticas", element: <Estadisticas /> },
            { path: "reservas-salas", element: <RoomBookingManagementPage /> },
            { path: "prestamo-rapido", element: <FastCheckoutPage /> },

            { path: "noticias", element: <NewsManagementPage /> },
            { path: "noticias/create", element: <NewsFormPage /> },
            { path: "noticias/:slug", element: <NewsFormPage /> },
        ]
    },
    { path: "*", element: <NotFound /> }
]);
========================================================================= */

// New routing mapping all routes to the maintenance page:
export const router = createBrowserRouter([
  {
    path: "*",
    element: <DownPage />
  }
]);
