# Equipos independientes por torneo

Los equipos se administran desde **Torneos → Ver torneo → Categorías → Equipos**.
El botón **Agregar equipo** permite crear el equipo y sus personas en el mismo formulario.

- Un borrador requiere nombre, ciudad y delegado con nombre completo, DNI y celular.
- La confirmación requiere además ocho jugadoras como mínimo. El entrenador es opcional.
- Una jugadora solo puede pertenecer a un equipo en el mismo torneo. Los DNI pueden repetirse entre torneos.
- Los datos no se comparten entre torneos. Dentro de un torneo se pueden compartir delegado y entrenador; el formulario advierte que editar sus datos afecta a esos equipos.
- Los equipos sin confirmar no se ofrecen para nuevos partidos, disponibilidades ni cruces y no aparecen en posiciones.
- Quitar una jugadora del plantel la archiva, conservando sus referencias y los datos históricos de planillas y convocatorias.
- Las URL globales antiguas de equipos y personas dirigen al flujo del torneo. Las escrituras antiguas se rechazan para impedir altas sin contexto.

## Aplicación a una base existente

Estos pasos no se ejecutan automáticamente sobre la base de trabajo. Hacer primero un respaldo y una prueba con una copia, usando el motor de base de datos de la instalación.

1. Aplicar las migraciones de la rama: `php artisan migrate`.
2. Obtener el informe sin modificar datos: `php artisan tournaments:recover-ownership`.
3. Revisar `conflicts` y `pending_team_ids`. Los conflictos bloquean la aplicación completa. La pertenencia solo se infiere de partidos, cruces, disponibilidades y referencias de planillas/convocatorias; compartir categoría no alcanza.
4. Con los conflictos resueltos, ejecutar `php artisan tournaments:recover-ownership --apply`.
5. Consultar cada equipo recuperado y completar la inscripción. Se marca como `legacy_review`: se puede consultar su historial, pero no registrar nueva actividad hasta confirmar delegado y plantel.

La recuperación genera copias independientes para cada torneo y actualiza referencias de partidos, cruces, disponibilidades, convocatorias y planillas. No altera nombres ni DNI guardados como instantáneas históricas. Una tabla de correspondencias permite repetirla sin duplicar registros. Los originales quedan conservados fuera de los torneos y nunca se agregan a uno nuevo automáticamente.

Los registros sin evidencia permanecen pendientes de revisión manual. Para asignar uno explícitamente, usar `php artisan tournaments:recover-ownership --assign=12:3` (equipo original 12, torneo 3), revisar el informe y repetir con `--apply`. La opción se puede repetir; también crea una categoría independiente desde la definición del equipo si hace falta. No se inventan DNI ni se agregan jugadoras para completar planteles históricos. La creación de nuevos torneos no ejecuta esta recuperación ni copia personas.

Las categorías de cada torneo son copias independientes de las definiciones del catálogo. Los seeders de demostración cargan datos explícitos en su torneo de prueba; no forman parte de la creación normal de torneos.

## Comprobaciones

```powershell
php -d extension=pdo_sqlite -d extension=sqlite3 vendor/bin/phpunit --filter 'TournamentRegistrationTest|LegacyTournamentRecoveryTest|PlayerTest'
npm.cmd run build
```

Las opciones `-d extension=…` habilitan SQLite solo para ese proceso cuando el PHP local no lo trae habilitado. Las pruebas usan SQLite en memoria, no la base configurada para trabajo.

La regresión original también presenta fallos en pruebas de fases, planillas y fixtures. Se comparó la versión de partida mediante una copia aislada para distinguirlos de esta funcionalidad; las reglas deportivas de esas áreas no se corrigieron dentro de este cambio.
