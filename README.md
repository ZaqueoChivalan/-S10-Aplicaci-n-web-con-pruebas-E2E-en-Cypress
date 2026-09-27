# Brújula Café — pedidos web con Cypress

Aplicación web funcional para consultar un menú, agregar productos a un pedido, cambiar cantidades, calcular el total y confirmar una orden persistida. El proyecto implementa frontend, API propia y persistencia local en archivos JSON.

## Arquitectura

- `public/`: interfaz accesible y observable, servida como archivos estáticos.
- `server.js`: servidor HTTP de Node.js y API REST (`/api/products`, `/api/orders`, `/api/test/reset`).
- `data/`: productos y órdenes persistidos localmente. La orden se guarda con identificador, líneas, total y fecha.
- `cypress/e2e/`: tres recorridos independientes, uno por requisito obligatorio.
- `.github/workflows/e2e.yml`: CI con Node 20, `npm ci` y Cypress; en fallos conserva screenshots/videos.

## Ejecutar

Requisitos: Node.js 20+.

```bash
npm install
npm start
```

Abrir `http://localhost:3000`. En otra terminal:

```bash
npm run cy:run
# o, iniciando el servidor automáticamente:
npm run test:e2e
```

Para reiniciar los datos durante desarrollo: `POST http://localhost:3000/api/test/reset` o `npm run reset-data` con el servidor activo. Cypress hace ese reset automáticamente antes de cada prueba mediante `cy.request()`, por lo que el orden de ejecución no importa.

## Estrategia de pruebas

1. `01-camino-exitoso.cy.ts`: agrega dos productos, cambia una cantidad, comprueba el total, intercepta `POST /api/orders` con alias `@createOrder`, valida request/response y confirma que el total quedó persistido mediante `GET /api/orders`.
2. `02-validacion.cy.ts`: comprueba el estado vacío, que confirmar está deshabilitado y que no se emite ningún `POST`.
3. `03-fallo-controlado.cy.ts`: simula explícitamente un `503` con `cy.intercept()`, verifica el mensaje, conserva el carrito y reintenta contra la API real para comprobar la recuperación.

No se usan esperas numéricas. Las sincronizaciones dependen de elementos, alias de red y respuestas observables. Los selectores de interacción usan nombres accesibles y `data-cy` estable.

## Dependencias reales y simuladas

No hay servicios de terceros ni secretos. Node.js y la API local son reales. El único fallo simulado es el `503` de la tercera prueba, de manera explícita y reproducible; la recuperación usa la API real. Los datos de prueba son locales y se reconstruyen desde el endpoint de reset.

## Cypress, Playwright y Agent Browser

Elegiría Cypress cuando el objetivo principal es una suite E2E visual y de frontend con runner interactivo, interceptación de red sencilla y depuración rápida. Elegiría Playwright cuando necesito varios navegadores, múltiples contextos/pestañas, paralelización avanzada o pruebas más cercanas a la automatización multiplataforma. Elegiría Agent Browser cuando un agente necesita explorar y operar una aplicación mediante capacidades de navegador orientadas a tareas; para esta evaluación prefiero Cypress porque exige una suite determinista, versionada y ejecutable en CI.

## Uso de IA

Se utilizó ChatGPT/Codex para proponer la separación de los tres recorridos, revisar selectores y sugerir casos de interceptación. Las aserciones, los datos, el reset y la implementación final fueron revisados para que cada prueba sea determinista y explicable por el estudiante. No se compartieron credenciales ni datos sensibles.

## Entrega

Antes de entregar, publicar este repositorio y completar en el PDF el enlace público del repositorio, el enlace de la ejecución exitosa de GitHub Actions y el enlace al video de máximo tres minutos. El PDF debe incluir las capturas generadas por Cypress: `camino-exitoso-confirmado`, `validacion-pedido-vacio` y `fallo-controlado-recuperado`, además de la evidencia de CI.
