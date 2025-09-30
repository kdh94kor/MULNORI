/// <reference types="vite/client" />
declare global {
    namespace NodeJS {
      interface ProcessEnv {
        DB_HOST: string;
        DB_USER: string;
        DB_PASSWORD: string;
        DB_NAME: string;
        API_KEY: string;
        KAKAOMAP_API_KEY: string;
        OPENAPI_DIVE_API_KEY: string;
      }
    }
  }

  export {};