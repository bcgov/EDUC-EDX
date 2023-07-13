declare namespace NodeJS {
  export interface ProcessEnv {
    SOAM_CLIENT_ID: string;
    SOAM_CLIENT_SECRET: string;
    SOAM_TOKEN_URL: string;
    INSTITUTE_SERVICE_URL: string;
    EDX_API_BASE_URL: string;
    CHES_CLIENT_ID: string;
    CHES_CLIENT_SECRET: string;
    CHES_TOKEN_URL: string;
    CHES_EMAIL_URL: string;
    ONBOARDING_INSTITUTE_TYPE: InstituteTypeCode | undefined;
  }
}
