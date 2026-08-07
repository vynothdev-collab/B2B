import client from './client';
import type {
  CompanyResult,
  PersonResult,
  SearchResponse,
  UnlockEmailResult,
  UnlockPhoneResult,
} from '../types';

export const searchApi = {
  searchCompanies: (companies: string[], pageSize = 5): Promise<SearchResponse<CompanyResult>> =>
    client.post('/search/companies', { companies, page_size: pageSize }).then((r) => r.data),

  searchPersons: (linkedinUrls: string[], pageSize = 5): Promise<SearchResponse<PersonResult>> =>
    client
      .post('/search/persons', { linkedin_url: linkedinUrls, page_size: pageSize })
      .then((r) => r.data),

  searchEmployees: (
    filters: { companyName?: string; companyLinkedinUrl?: string },
    page = 1,
    pageSize = 10
  ): Promise<SearchResponse<PersonResult>> =>
    client
      .post('/search/persons', {
        ...(filters.companyName && { company_name: [filters.companyName] }),
        ...(filters.companyLinkedinUrl && { company_linkedin_url: [filters.companyLinkedinUrl] }),
        page,
        page_size: pageSize,
      })
      .then((r) => r.data),

  getCompanyDetail: (recordId: string): Promise<CompanyResult> =>
    client.get(`/search/companies/${recordId}/detail`).then((r) => r.data),

  getPersonDetail: (recordId: string): Promise<PersonResult> =>
    client.get(`/search/persons/${recordId}/detail`).then((r) => r.data),

  unlockWorkEmail: (recordId: string): Promise<UnlockEmailResult> =>
    client.get(`/search/persons/${recordId}/unlock/work-email`).then((r) => r.data),

  unlockPersonalEmail: (recordId: string): Promise<UnlockEmailResult> =>
    client.get(`/search/persons/${recordId}/unlock/personal-email`).then((r) => r.data),

  unlockMobile: (recordId: string): Promise<UnlockPhoneResult> =>
    client.get(`/search/persons/${recordId}/unlock/mobile`).then((r) => r.data),

  unlockCompanyEmail: (recordId: string): Promise<UnlockEmailResult> =>
    client.get(`/search/companies/${recordId}/unlock/email`).then((r) => r.data),

  unlockCompanyPhone: (recordId: string): Promise<UnlockPhoneResult> =>
    client.get(`/search/companies/${recordId}/unlock/phone`).then((r) => r.data),
};
