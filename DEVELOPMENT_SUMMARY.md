# Resumen de Desarrollo: Estabilización de Auth y Wallet

Este documento resume las actualizaciones críticas realizadas en el ecosistema de tokenización para estabilizar el flujo de usuarios y automatizar la infraestructura de billeteras.

## 1. Backend (Repositorio: `tokenization`)

### Aprovisionamiento Automático de Wallet
- **Integración de Servicios**: El servicio de `auth` ahora crea automáticamente una billetera para cada usuario nuevo durante el registro.
- **Lógica**: Se utiliza la función `get_or_create_wallet`. El proceso es no bloqueante; si la creación falla, el registro continúa para no perder al usuario.
- **Seguridad**: Se corrigió el export de llaves de cegado (blinding keys) a formato **hexadecimal**, necesario para la compatibilidad con nodos Liquid/Elements.

### Infraestructura
- **Docker Fix**: Se corrigieron las rutas de volúmenes en `docker-compose.local.yml`. El hot-reload ahora funciona correctamente en todos los servicios.
- **Base de Datos**: Se amplió el campo de direcciones en la DB para soportar direcciones confidenciales de Liquid (VARCHAR 255).

## 2. Frontend (Repositorio: `bitcoin-RWA`)

### Corrección de Error 422
- **Configuración de API**: Se habilitó `{ requireAuth: false }` para los endpoints públicos de registro y login.
- **Headers**: El cliente de API ahora fuerza siempre el `Content-Type: application/json` en peticiones POST, evitando errores de parseo en el backend.

### Mejoras de UI/UX
- **Validación de Contraseña**: Se sincronizó la validación con el backend (8+ caracteres, mayúscula, número y carácter especial).
- **Checklist Visual**: Se añadió una lista de requisitos en tiempo real en el formulario de registro.
- **Wallet Widget Persistente**:
    - Nuevo componente `WalletAddressWidget` para ver y copiar la dirección Liquid.
    - **Header de Escritorio**: Se añadió una barra superior para evitar que el widget choque con los botones de acción de las páginas.
    - **Menú Móvil**: Integración del widget en la navegación móvil.

### Limpieza
- **Sistema de Referidos**: Se eliminó por completo la lógica y los campos de códigos de referidos para simplificar el producto actual.

## 3. Siguientes Pasos para el Equipo

- **Frontend**: Implementar el polling de balance para que el widget de la cabecera actualice los fondos automáticamente.
- **Backend**: Resolver la dependencia de `btclib` en el servicio de Nostr que está causando reinicios constantes.
- **Integración**: Comenzar con el flujo de emisión de activos (Asset Issuance) utilizando el backend de wallet ya estabilizado.
