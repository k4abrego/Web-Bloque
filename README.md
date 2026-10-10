# Web-Bloque

Frontend web del proyecto SIPINNA.

## Documentación del código

El proyecto usa **JSDoc** para documentar sus módulos JavaScript y componentes
React. La documentación debe explicar el propósito de una pieza pública, sus
parámetros, el valor que devuelve y los errores relevantes.

### Convención

- Componentes: describir la responsabilidad del componente y usar `@param`
	para sus props y `@returns` para el elemento React que renderiza.
- Servicios: describir el endpoint o la operación y documentar cada argumento,
	el `Promise` devuelto y las condiciones de error con `@throws` cuando aplique.
- Objetos compartidos: declarar su forma con `@typedef` y reutilizar ese tipo
	en los componentes que lo reciben.
- Comentarios internos: documentar solo decisiones o transformaciones que no
	sean evidentes por el código.

### Ejemplo

```js
/**
 * Obtiene un reporte por su folio.
 *
 * @param {string|number} folio Folio del reporte.
 * @returns {Promise<unknown>} Detalle devuelto por la API.
 */
export async function obtenerReportePorId(folio) {
		return apiFetch(`/reportes/${folio}`);
}
```

La documentación se mantiene junto al símbolo que describe y se valida
ejecutando `npm run lint` y `npm run build`.
