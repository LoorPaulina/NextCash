# Contexto del Proyecto

Aplicación web de curso construida con **Next.js 16** (App Router), **React 19**, **TypeScript** y **Tailwind CSS v4**. Los componentes de UI usan **shadcn/ui** (estilo `base-nova`) sobre **@base-ui/react**.

> Antes de escribir código de Next.js, lee `AGENTS.md`: esta versión tiene cambios que pueden no coincidir con lo que conoces. Consulta las guías en `node_modules/next/dist/docs/`.

## Comandos
- Desarrollo: `pnpm dev`
- Build: `pnpm build`
- Producción local: `pnpm start` (requiere `pnpm build` previo)
- Lint: `pnpm lint`
- Tests: `pnpm test` (una vez, `vitest run`); `pnpm test:watch` (modo watch).
- Stack de pruebas: Vitest + jsdom + React Testing Library. Pruebas colocadas junto al código como `*.test.ts(x)`; configuración en `vitest.config.mts` y `vitest.setup.ts`; mocks compartidos en `tests/mocks/` y datos en `tests/fixtures/`. `@/db` y `@clerk/nextjs/server` se mockean; ninguna prueba accede a la base de datos. Playwright (E2E) no está configurado.

Usa `pnpm` como gestor de paquetes. El proyecto tiene `pnpm-lock.yaml` y también `package-lock.json`; el lock de referencia es el de pnpm.

## Estructura
```
app/                  Rutas del App Router (layout.tsx, page.tsx, globals.css, favicon.ico)
components/ui/        Componentes shadcn/ui generados (p. ej. button.tsx)
lib/                  Utilidades compartidas (utils.ts exporta `cn`)
public/               Assets estáticos servidos desde /
components.json       Configuración de shadcn/ui (alias, estilo, iconos lucide)
next.config.ts        Configuración de Next.js
eslint.config.mjs     Configuración de ESLint (eslint-config-next)
tsconfig.json         TypeScript estricto; alias `@/*` apunta a la raíz
```

Alias de importación: `@/components`, `@/components/ui`, `@/lib`, `@/lib/utils`, `@/hooks` (el directorio `hooks/` aún no existe).

## Reglas
- Usa TypeScript estricto (`strict: true`). Evita `any`; tipa props y retornos de componentes.
- Estilos con Tailwind CSS. Usa las variables de tema definidas en `app/globals.css` (p. ej. `bg-primary`, `text-muted-foreground`) en lugar de colores fijos cuando sea posible.
- Para combinar clases usa `cn` de `@/lib/utils`.
- Componentes de UI nuevos: añádelos con la CLI de shadcn (según `components.json`) en `components/ui/`, no los escribas desde cero si ya existe un equivalente. Iconos: `lucide-react`.
- Componentes de UI con variantes usan `class-variance-authority` (`cva`), como en `components/ui/button.tsx`.
- Los archivos de `components/ui/` son generados; si los modificas, hazlo de forma mínima.
- Las rutas van en `app/`; los componentes reutilizables van en `components/`, y la lógica compartida en `lib/`.
- **Nombres en código:** Variables, funciones, clases y componentes siempre en **inglés** (ej. `fetchUserData`, `isUserLoggedIn`).

- **Formularios y Validaciones:**
  - Usa **React Hook Form** junto con **Zod** y `@hookform/resolvers/zod` para la gestión y validación de formularios.
  - Genera y utiliza el componente `Form` de shadcn/ui (`components/ui/form.tsx`).
  - Define los esquemas de Zod con nombres de campos y variables en **inglés** (ej. `email`, `password`), pero los mensajes de error devueltos en las reglas del esquema deben estar en **español** para el usuario final.
  - Infiere siempre los tipos de TypeScript usando `z.infer<typeof schema>` para mantener el código fuertemente tipado.

- **Server Actions:**
  - Toda la lógica de servidor para mutaciones/formularios debe ir en archivos dedicados nombrados `actions.ts` (o dentro de una carpeta `actions/`, ej. `lib/actions/user.actions.ts`).
  - Los archivos de Server Actions deben incluir la directiva `'use server';` en la parte superior.
  - Los nombres de las funciones de acción deben estar en **inglés** y comenzar con un verbo descriptivo (ej. `createUser`, `updateCourseProgress`).

## MANDATORY WORKFLOW (Subagent Pipeline)

CRITICAL INSTRUCTION: Do NOT write or edit code directly in the main session. You MUST follow this strict subagent pipeline for ALL coding and feature requests:

1. **STEP 1:** You MUST invoke the `architect` subagent to create the implementation plan first.
2. **STEP 2:** Implement the requested code according to the plan.
3. **STEP 3:** You MUST invoke the `test-writer` subagent to write and run unit/integration tests.
4. **STEP 4:** You MUST invoke the `code-reviewer` subagent to perform a strict code audit.
5. **STEP 5:** Do NOT complete the user request until `code-reviewer` outputs an explicit status of [APROBADO].
6. **STEP 6 (Git Commit):** Once `code-reviewer` gives [APROBADO], create a clean git commit following Conventional Commits (e.g., `feat: ...` or `fix: ...`). Do NOT push to remote unless explicitly requested.