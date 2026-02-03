import { useState, useRef, useEffect } from "react";
import { useFastCheckoutMutation } from "../api/readingSessionsApiSlice";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/common/components/ui/card";
import { Input } from "@/common/components/ui/input";
import { Button } from "@/common/components/ui/button";
import { Label } from "@/common/components/ui/label";
import { Zap, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner"; // Using 'sonner' for avant-garde toasts if available, verified in App.tsx imports

export default function FastCheckoutPage() {
    const [userId, setUserId] = useState("");
    const [cota, setCota] = useState("");
    const [fastCheckout, { isLoading }] = useFastCheckoutMutation();

    const userInputRef = useRef<HTMLInputElement>(null);
    const cotaInputRef = useRef<HTMLInputElement>(null);

    // Focus management
    useEffect(() => {
        userInputRef.current?.focus();
    }, []);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!userId || !cota) {
            toast.error("Por favor complete todos los campos.");
            return;
        }

        try {
            await fastCheckout({ user_id: userId, cota }).unwrap();

            // Success Feedback
            toast.success("Préstamo registrado exitosamente", {
                description: `Usuario: ${userId} | Libro: ${cota}`,
                duration: 3000,
                icon: <CheckCircle2 className="text-green-500" />
            });

            // Reset
            setCota("");
            setUserId(""); // Optional: keep user ID if they are checking out multiple books? Better to reset for safety unless requested otherwise. 
            // Actually, for a library checkout, often you scan user once then many books. 
            // Let's keep the user ID populated but highlight the cota field for the next book.
            // But re-reading requirements: "User ID and Book Cota". Let's assume one-off for now to be safe, or maybe offer a checkbox "Keep User".
            // Avant-Garde decision: Minimalism. Clear everything.

            userInputRef.current?.focus();

        } catch (err: any) {
            console.error(err);
            const errorMessage = err.data?.detail || "Error al registrar el préstamo.";
            toast.error("Error en el préstamo", {
                description: errorMessage,
            });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, target: 'user' | 'cota') => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (target === 'user') {
                if (userId) cotaInputRef.current?.focus();
            } else {
                handleSubmit();
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] w-full p-4 fade-in animate-in zoom-in-95 duration-500">
            <div className="relative w-full max-w-md">
                {/* Decorative elements for Avant-Garde feel */}
                <div className="absolute -top-10 -left-10 w-24 h-24 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-secondary/10 rounded-full blur-3xl" />

                <Card className="border-border/50 bg-background/50 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                    {isLoading && (
                        <div className="absolute top-0 left-0 w-full h-1 bg-primary/20 overflow-hidden">
                            <div className="h-full bg-primary animate-progress-indeterminate" />
                        </div>
                    )}

                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto bg-primary/5 p-3 rounded-full mb-4 w-fit">
                            <Zap className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight">Préstamo Rápido</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Ingrese ID de usuario y Cota del libro
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-2">
                            <Label htmlFor="userId" className="text-xs font-medium uppercase tracking-wider text-muted-foreground ml-1">
                                ID Usuario
                            </Label>
                            <Input
                                id="userId"
                                ref={userInputRef}
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, 'user')}
                                placeholder="12345"
                                className="font-mono text-lg tracking-widest bg-background/50 border-primary/20 focus:border-primary transition-all duration-300"
                                autoComplete="off"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cota" className="text-xs font-medium uppercase tracking-wider text-muted-foreground ml-1">
                                Cota del Libro
                            </Label>
                            <Input
                                id="cota"
                                ref={cotaInputRef}
                                value={cota}
                                onChange={(e) => setCota(e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, 'cota')}
                                placeholder="ABC-123..."
                                className="font-mono text-lg tracking-widest bg-background/50 border-primary/20 focus:border-primary transition-all duration-300"
                                autoComplete="off"
                            />
                        </div>

                        <Button
                            onClick={() => handleSubmit()}
                            disabled={isLoading}
                            className="w-full h-12 text-md font-semibold mt-4 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Procesando...
                                </>
                            ) : (
                                "Confirmar Préstamo"
                            )}
                        </Button>
                    </CardContent>
                </Card>

                <div className="mt-8 text-center text-xs text-muted-foreground/50 font-mono">
                    PRESS [ENTER] TO CONTINUE
                </div>
            </div>
        </div>
    );
}
