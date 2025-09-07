/// <reference types="vite/client" />

interface ViteTypeOptions {
  strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
  readonly PUBLIC_APP_ENV: string;
  readonly PUBLIC_APP_VER: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
