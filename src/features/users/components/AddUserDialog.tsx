import { useState, useId } from "react";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/common/components/ui/dialog";
import { UserPlus } from "lucide-react";
import { useToast } from "@/common/hooks/use-toast";
import { CedulaInput } from "@/common/components/ui/cedula-input";
import { useCreateProfileMutation } from "@/features/content-management/api/profilesApiSlice";

interface AddUserDialogProps {
  onUserAdded: () => void;
}

export function AddUserDialog({ onUserAdded }: AddUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    national_document: '',
    email: '',
    password: '',
    phone: '',
    birth_date: '',
    address: '',
  });
  const { toast } = useToast();
  const [createProfile, { isLoading }] = useCreateProfileMutation();

  const dialogTitleId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password || !formData.first_name || !formData.last_name) {
      toast({
        title: "Error",
        description: "Por favor complete los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    try {
      const data = new FormData();
      data.append('email', formData.email);
      data.append('password', formData.password);
      data.append('first_name', formData.first_name);
      data.append('last_name', formData.last_name);

      if (formData.national_document) data.append('national_document', formData.national_document);
      if (formData.phone) data.append('phone', formData.phone);
      if (formData.birth_date) data.append('birth_date', formData.birth_date);
      if (formData.address) data.append('address', formData.address);

      await createProfile({ formData: data }).unwrap();

      toast({
        title: "Éxito",
        description: "Usuario creado correctamente",
      });

      setFormData({
        first_name: '',
        last_name: '',
        national_document: '',
        email: '',
        password: '',
        phone: '',
        birth_date: '',
        address: '',
      });
      setOpen(false);
      onUserAdded();

    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error?.data?.detail || error.message || "No se pudo crear el usuario",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary fg-primary-foreground hover:bg-primary/90">
          <UserPlus className="h-4 w-4 mr-2" />
          Añadir usuario
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          {/* Apply the unique ID to the DialogTitle */}
          <DialogTitle id={dialogTitleId}>Añadir Usuario</DialogTitle>
          <DialogDescription>
            Complete la información del nuevo usuario.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Ingrese el email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Ingrese la contraseña"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="first_name">Nombre *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                placeholder="Ingrese el nombre"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Apellido *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder="Ingrese el apellido"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="national_document">Cédula</Label>
              <CedulaInput
                id="national_document"
                value={formData.national_document}
                onChange={(valor) => handleInputChange('national_document', valor)}
                placeholder="Ingrese la cédula"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Ingrese el teléfono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birth_date">Fecha de Nacimiento</Label>
              <Input
                id="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={(e) => handleInputChange('birth_date', e.target.value)}
                placeholder="Ingrese la fecha de nacimiento"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Ingrese la dirección"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary fg-primary-foreground hover:bg-primary/90"
            >
              {isLoading ? "Creando..." : "Crear Usuario"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}