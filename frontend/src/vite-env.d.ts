//frontend/src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_PORT: string;
    readonly VITE_API_URL: string;
    readonly VITE_API_TARGET: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}