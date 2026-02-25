import { useState, useEffect } from "react";
import { useLogInMutation, useSignUpMutation } from "@/features/authentication/api/authApiSlice.ts";
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useToast } from "@/common/components/ui/use-toast";
import { LogIn, Eye, EyeOff, Mail, Lock, User, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/common/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error !== null && 'status' in error;
}

const extractErrorMessage = (errorData: unknown, fallback: string) => {
  if (!errorData) return fallback;
  if (typeof errorData === "string") return errorData;
  if (typeof errorData === "object") {
    const data = errorData as Record<string, unknown>;
    if (typeof data.detail === "string") return data.detail;
    if (typeof data.message === "string") return data.message;
    if (typeof data.error === "string") return data.error;

    const messages: string[] = [];
    Object.values(data).forEach((val) => {
      if (typeof val === "string") messages.push(val);
      else if (Array.isArray(val)) {
        val.forEach(v => typeof v === "string" && messages.push(v));
      }
    });
    if (messages.length > 0) return messages.join(" • ");
  }
  return fallback;
};

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // Use the mutation hooks directly
  const [logIn, { isLoading: isLoggingIn, isSuccess: isLoginSuccess, isError: isLoginError, error: loginError }] = useLogInMutation();
  const [signUp, { isLoading: isSigningUp, isSuccess: isSignUpSuccess, isError: isSignUpError, error: signUpError }] = useSignUpMutation();

  const { toast } = useToast();

  const isLoading = isLoggingIn || isSigningUp;

  const passwordValidation = {
    length: password.length >= 8,
    letters: /[a-zA-Z]/.test(password),
    numbers: /[0-9]/.test(password),
    noName: first_name ? !password.toLowerCase().includes(first_name.toLowerCase()) : true,
    noSurname: last_name ? !password.toLowerCase().includes(last_name.toLowerCase()) : true,
  };

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const isPasswordError = password.length > 0 && !isPasswordValid;
  const isConfirmPasswordError = confirmPassword.length > 0 && confirmPassword !== password;
  const isConfirmPasswordSuccess = confirmPassword.length > 0 && confirmPassword === password;

  const formatName = (val: string) => {
    let cleanVal = val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
    if (cleanVal.length > 0) {
      cleanVal = cleanVal.charAt(0).toUpperCase() + cleanVal.slice(1);
    }
    return cleanVal;
  };

  // Use useEffect to handle side effects like toast messages
  useEffect(() => {
    if (isLoginSuccess) {
      toast({
        title: "Sesión iniciada",
        description: "Bienvenido de vuelta",
      });
      resetAndClose();
    }
  }, [isLoginSuccess, toast]);

  useEffect(() => {
    if (isSignUpSuccess) {
      toast({
        title: "Registro exitoso",
        description: "Sesión iniciada automáticamente",
      });
      resetAndClose();
    }
  }, [isSignUpSuccess, toast]);

  useEffect(() => {
    if (isLoginError) {
      let errorMessage = "Ocurrió un error inesperado";

      // Use a type guard to safely access the `data` property
      if (isFetchBaseQueryError(loginError)) {
        errorMessage = extractErrorMessage(loginError.data, errorMessage);
      }

      toast({
        title: "Error de inicio de sesión",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [isLoginError, loginError, toast]);

  useEffect(() => {
    if (isSignUpError) {
      let errorMessage = "Ocurrió un error inesperado";

      if (isFetchBaseQueryError(signUpError)) {
        errorMessage = extractErrorMessage(signUpError.data, errorMessage);
      }

      toast({
        title: "Error de registro",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [isSignUpError, signUpError, toast]);


  const resetAndClose = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFirstName("");
    setLastName("");
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        if (!isPasswordValid) {
          toast({ title: "Contraseña inválida", description: "Por favor, cumple con todos los requisitos de la contraseña.", variant: "destructive" });
          return;
        }
        if (password !== confirmPassword) {
          toast({ title: "Contraseñas no coinciden", description: "Las contraseñas no son iguales.", variant: "destructive" });
          return;
        }
        await signUp({ email, password, first_name, last_name }).unwrap();
      } else {
        await logIn({ email, password }).unwrap();
      }
    } catch (error) {
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFirstName("");
    setLastName("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[95vw] max-h-[95vh] overflow-y-auto top-1/2 -translate-y-1/2">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogIn className="h-5 w-5" />
            {isSignUp ? "Crear cuenta" : "Iniciar Sesión"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="first_name">Nombre</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="first_name"
                    type="text"
                    placeholder="Nombre"
                    value={first_name}
                    onChange={(e) => setFirstName(formatName(e.target.value))}
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">Solo letras, inicial en mayúscula.</p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="last_name">Apellido</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="last_name"
                    type="text"
                    placeholder="Apellido"
                    value={last_name}
                    onChange={(e) => setLastName(formatName(e.target.value))}
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">Solo letras, inicial en mayúscula.</p>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="email">Correo electrónico</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"
                title="Debe ser un correo electrónico válido"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Lock className={cn("absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4", isSignUp && isPasswordError ? "text-destructive" : "text-muted-foreground")} />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn("pl-10 pr-10", isSignUp && isPasswordError && "border-destructive focus-visible:ring-destructive")}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {isSignUp && (
              <div className="text-[11px] text-muted-foreground mt-2 space-y-1">
                {isPasswordError && <p className="text-destructive font-semibold mb-1">Contraseña inválida</p>}
                <div className="flex items-center gap-1">
                  {passwordValidation.length ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <div className="h-3 w-3 rounded-full border border-muted-foreground/50" />}
                  <span className={passwordValidation.length ? "text-foreground" : ""}>Mínimo 8 caracteres</span>
                </div>
                <div className="flex items-center gap-1">
                  {passwordValidation.letters && passwordValidation.numbers ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <div className="h-3 w-3 rounded-full border border-muted-foreground/50" />}
                  <span className={passwordValidation.letters && passwordValidation.numbers ? "text-foreground" : ""}>Debe incluir letras y números</span>
                </div>
                {(first_name || last_name) && (
                  <div className="flex items-center gap-1">
                    {passwordValidation.noName && passwordValidation.noSurname ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <div className="h-3 w-3 rounded-full border border-muted-foreground/50" />}
                    <span className={passwordValidation.noName && passwordValidation.noSurname ? "text-foreground" : (password.length > 0 ? "text-destructive" : "")}>No debe contener tu nombre o apellido</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {isSignUp && (
            <div className="space-y-1">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <div className="relative">
                <Lock className={cn("absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4", isConfirmPasswordError ? "text-destructive" : "text-muted-foreground")} />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={cn("pl-10 pr-20", isConfirmPasswordError && "border-destructive focus-visible:ring-destructive")}
                  required
                />

                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                  {isConfirmPasswordSuccess && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  {isConfirmPasswordError && <XCircle className="h-4 w-4 text-destructive" />}
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-muted-foreground hover:text-foreground inline-flex items-center justify-center"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {isConfirmPasswordError && (
                <p className="text-[11px] text-destructive font-semibold">Las contraseñas no coinciden</p>
              )}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {isSignUp ? "Creando cuenta..." : "Iniciando sesión..."}
              </div>
            ) : (
              <>
                <LogIn className="h-4 w-4 mr-2" />
                {isSignUp ? "Crear cuenta" : "Iniciar Sesión"}
              </>
            )}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-primary hover:underline"
            >
              {isSignUp
                ? "¿Ya tienes cuenta? Iniciar sesión"
                : "¿No posee una cuenta? Registrarse"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}