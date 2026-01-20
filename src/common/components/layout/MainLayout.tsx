import { Outlet } from "react-router-dom";
import { AppSidebar } from "./Sidebar";
import { AppHeader } from "./Header";
import { Footer } from "./Footer";
import { SidebarProvider } from "@/common/components/ui/sidebar";

export const MainLayout = () => (
    <SidebarProvider>
        <div className="min-h-screen flex w-full">
            <AppSidebar />
            <main className="flex-1 flex flex-col">
                <AppHeader />
                <div className="flex-1 flex flex-col">
                    <Outlet /> {/* Aquí "caen" las páginas como Index, RoomsPage, etc. */}
                </div>
                <Footer />
            </main>
        </div>
    </SidebarProvider>
);
