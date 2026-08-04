export const EXTENSION_NAME = 'LeadsBuddy.ai';
export const EXTENSION_VERSION = '0.1.0';

export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'lb_access_token',
  REFRESH_TOKEN: 'lb_refresh_token',
  USER: 'lb_user',
} as const;

export const MESSAGE_TYPES = {
  TAB_UPDATED: 'TAB_UPDATED',
  GET_TAB_INFO: 'GET_TAB_INFO',
  TAB_INFO: 'TAB_INFO',
} as const;

export const PAGE_TYPES = {
  COMPANY_WEBSITE: 'company_website',
  LINKEDIN_PERSON: 'linkedin_person',
  LINKEDIN_COMPANY: 'linkedin_company',
  UNSUPPORTED: 'unsupported',
} as const;
