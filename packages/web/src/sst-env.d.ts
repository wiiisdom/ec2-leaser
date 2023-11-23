/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_API: string
  readonly VITE_COGNITO_REGION: string
  readonly VITE_COGNITO_USER_POOL_ID: string
  readonly VITE_COGNITO_USER_POOL_CLIENT_ID: string
  readonly VITE_COGNITO_IDENTITY_POOL_ID: string
  readonly VITE_COGNITO_DOMAIN: string
  readonly VITE_PUBLIC_DOMAIN: string
  readonly VITE_SHOW_SNAPSHOT_RESTORE: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}