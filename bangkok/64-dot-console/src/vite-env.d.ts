/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_WALLET_CONNECT_PROJECT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
