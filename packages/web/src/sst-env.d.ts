/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_API: string
  readonly VITE_SHOW_SNAPSHOT_RESTORE: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}