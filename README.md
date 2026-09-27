# Gestor de Garantías · Ferre Don Nico

App para registrar las garantías de los clientes, imprimir su ticket en la Epson TM-T88 (80 mm) y dar seguimiento hasta que se entregan.
Los datos viven en una hoja de Google Sheets y la app se conecta **directo** a ella con un Apps Script (sin SheetDB).

## Qué hace

- **Registro:** captura la garantía y descarga el ticket en PDF (con logo). El folio `GAR-0001` lo asigna la hoja al guardar, así nunca se repite aunque dos cajas registren al mismo tiempo.
- **Embarque:** busca el folio y lo marca como enviado al proveedor.
- **Consulta:** busca el folio, lo marca como *En tienda*, *Nota de crédito* o *Entregada*, y permite **reimprimir el ticket**.
- El folio se puede buscar como `GAR-0015`, `gar-15` o solo `15`.
- Muestra cuántos días lleva abierta cada garantía (en rojo después de 30 días).
- **Avisos al cliente:** en Consulta, botón *Registrar aviso* (cuenta hasta 3 y guarda la fecha).
- **Reporte semanal:** garantías con 3 avisos o más, con más de 30 días y con nota de crédito; se descarga en PDF para la revisión del Jefe de Operaciones con el Gerente.
- **Asistente de dudas:** botón *¿Dudas?* con las preguntas frecuentes del manual (se editan en `src/lib/faq.ts`).
- **Ticket en dos copias** (cliente y tienda) y envío del comprobante por **WhatsApp**.

### Estatus

| En la hoja | En la app | Significa |
|---|---|---|
| Sin Enviar | Sin enviar | Recibida en tienda, falta mandarla al proveedor |
| En proceso | Con proveedor | Ya se embarcó |
| En Tienda | En tienda | Regresó del proveedor, espera al cliente |
| Nota de Crédito | Nota de crédito | El proveedor la resolvió con nota de crédito |
| Listo | Entregada | Ya se entregó al cliente (queda cerrada) |

Si se intenta entregar una garantía que aún no regresa del proveedor, la app pide confirmar.

## Configuración (una sola vez)

### 1. Apps Script en la hoja

1. Abre la hoja de Google Sheets de garantías y entra a **Extensiones > Apps Script**.
2. Borra lo que haya y pega el contenido de [`apps-script/Code.gs`](apps-script/Code.gs).
3. Cambia `API_KEY: 'CAMBIA-ESTA-CLAVE'` por una clave propia (ej. una frase larga sin espacios).
4. Si las garantías no están en la primera pestaña, escribe su nombre en `SHEET_GARANTIAS`.
5. Guarda y ejecuta la función `probarConexion` (autoriza los permisos). En el registro debe salir cuántas garantías hay y el siguiente folio.
6. **Implementar > Nueva implementación** > tipo **Aplicación web**:
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario**
7. Copia la URL que termina en `/exec`.

> Cada vez que se actualice `Code.gs` (por ejemplo, al agregar el contador de avisos) hay que pegar el código nuevo y publicar una **Nueva versión**; si no, la app marcará "Acción no válida".

> Si después cambias el código del script: **Implementar > Administrar implementaciones > Editar > Nueva versión**. Así la URL no cambia.

### 2. Variables de la app

En Vercel (Settings > Environment Variables), en AI Studio (Secrets) o en un archivo `.env.local`:

```
VITE_SHEETS_API_URL=https://script.google.com/macros/s/XXXX/exec
VITE_SHEETS_API_KEY=la-misma-clave-del-paso-3
```

Después de guardarlas hay que volver a publicar (redeploy) para que la app las tome.

## Desarrollo local

```
npm install
npm run dev
```

## Seguridad

- La clave va dentro de la app publicada, así que es una protección básica: evita que alguien use la hoja sin conocer la URL y la clave. No compartas la URL del script.
- El script solo permite **agregar** garantías y **cambiar** estatus, fechas y observaciones. No permite borrar ni modificar los datos del cliente.
- La URL anterior de SheetDB quedó en el historial público del repositorio: **desactívala o bórrala en sheetdb.io** en cuanto la nueva conexión funcione.
