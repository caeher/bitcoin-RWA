# Guía de Integración: Billetera Automática en el Frontend

Con los cambios realizados en el backend, el proceso de creación de billeteras ahora es **automático y transparente**. Ya no es necesario que el frontend realice una llamada adicional para "inicializar" la billetera después del registro.

## 1. Cambio en el Flujo de Registro

Antes, era común tener que llamar a un endpoint de `POST /wallet` después de que el usuario se registrara. Ahora, el backend hace esto internamente durante la llamada a `/auth/register`.

### Flujo Ideal en `Register.tsx`:
Cuando el registro es exitoso, el usuario ya tiene una billetera. Lo mejor es redirigirlo directamente al Dashboard o a la página de la Billetera.

```typescript
// src/pages/Register.tsx (ejemplo de lógica)

const handleRegister = async (data: RegisterFormData) => {
  try {
    // 1. Llamada única al registro
    const response = await authApi.register(data);
    
    // 2. Guardar sesión (el backend ya creó la wallet en segundo plano)
    setAuth(response.user, response.tokens);
    
    // 3. Redirigir directamente a la billetera o dashboard
    // No hace falta llamar a "createWallet()"
    navigate('/wallet'); 
    
    toast.success("¡Cuenta y billetera creadas con éxito!");
  } catch (error) {
    handleError(error);
  }
};
```

## 2. Visualización Inmediata en `Wallet.tsx`

Dado que la billetera ya existe, la primera vez que el usuario entre a `src/pages/Wallet.tsx`, el hook `useWallet` (o similar) ya debería obtener datos válidos en lugar de un error 404.

### Ejemplo de carga de datos:
```typescript
// src/hooks/useWallet.ts

export const useWallet = () => {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      // Esta llamada ahora funcionará inmediatamente tras el registro
      const response = await api.get('/v1/wallet');
      return response.data;
    },
    retry: 3, // Opcional: por si el backend tarda unos milisegundos extra
  });
};
```

## 3. Manejo de Direcciones de Depósito

Si quieres mostrar la dirección de la billetera inmediatamente, puedes usar el endpoint que acabamos de verificar:

```typescript
// src/components/DepositAddress.tsx

const DepositAddress = () => {
  const { data: addressData, isLoading } = useQuery({
    queryKey: ['wallet-address'],
    queryFn: () => walletApi.getOnchainAddress(), // Llama a POST /v1/wallet/onchain/address
  });

  if (isLoading) return <p>Generando dirección...</p>;

  return (
    <div className="p-4 bg-slate-900 rounded-lg">
      <p className="text-sm text-slate-400">Tu dirección Liquid:</p>
      <code className="break-all text-primary">{addressData.address}</code>
    </div>
  );
};
```

## Resumen de Beneficios
- **Menos Latencia:** Un paso menos en el frontend.
- **Mejor UX:** El usuario no ve estados de "Billetera no inicializada".
- **Consistencia:** Todos los usuarios registrados tienen garantizada una billetera en la DB.

> [!IMPORTANT]
> Recuerda que he ampliado el tamaño de la columna `address` en la base de datos a 255 caracteres para soportar las direcciones confidenciales de Liquid. Asegúrate de que tus componentes de UI (como códigos QR o inputs de dirección) soporten strings de este tamaño.
