import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'error', // Suppress warnings, only show errors
  plugins: [
    base44({
      // Support for legacy code that imports the base44 SDK with @/integrations, @/entities, @/functions, etc.
      // The codebase still relies on these imports, so default to enabled and allow explicit opt-out
      // via BASE44_LEGACY_SDK_IMPORTS=false once all imports are migrated to @base44/sdk.
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS !== 'false'
    }),
    react(),
  ]
});