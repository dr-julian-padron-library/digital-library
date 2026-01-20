import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/common/components/ui/tooltip";
import { Toaster } from "@/common/components/ui/toaster";
import { Toaster as Sonner } from "@/common/components/ui/sonner";
import { ErrorBoundary } from "@/common/components/ErrorBoundary";
import { ThemeSynchronizer } from "@/features/configuration/components/ThemeSynchronizer";
import { router } from "@/router"; // Importamos la configuración

const queryClient = new QueryClient();

export const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeSynchronizer />
        <Toaster />
        <Sonner />
        {/* El RouterProvider reemplaza a BrowserRouter y Routes */}
        <RouterProvider router={router} />
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);