/// <reference types="astro/client" />
/// <reference path="../.astro/types.d.ts" />

declare const Astro: Readonly<import("astro").AstroGlobal>;

declare global {
  interface SDKTypeMode {
    strict: true;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }

  interface ImportMetaEnv {
    readonly BASE_NAME: string;
    readonly PUBLIC_OPENAI_API_KEY?: string;
    readonly PUBLIC_OPENAI_MODEL?: string;
    readonly PUBLIC_OCR_SPACE_API_KEY?: string;
    readonly PUBLIC_GEMINI_API_KEY?: string;
    readonly PUBLIC_GEMINI_MODEL?: string;
  }
}

