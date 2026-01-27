import { Outlet } from "react-router-dom";
import { AppSidebar } from "./Sidebar";
import { AppHeader } from "./Header";
import { Footer } from "./Footer";
import { SidebarProvider } from "@/common/components/ui/sidebar";

export const ManagementLayout = () => (
    <SidebarProvider>
        <div className="min-h-screen flex w-full bg-interface/5">
            <AppSidebar />
            <main className="flex-1 flex flex-col">
                <AppHeader />
                <div className="flex-1 flex flex-col p-6">
                    {/* Added padding for management pages as per common pattern */}
                    <Outlet />
                </div>
                <Footer />
            </main>
        </div>
    </SidebarProvider>
);
