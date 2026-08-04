import client from './client';
import type {
  CompanyResult,
  PersonResult,
  SearchResponse,
  RevealEmailResult,
  RevealPhoneResult,
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

  revealWorkEmail: (recordId: string): Promise<RevealEmailResult> =>
    client.get(`/search/persons/${recordId}/email`).then((r) => r.data),

  revealPersonalEmail: (recordId: string): Promise<RevealEmailResult> =>
    client.get(`/search/persons/${recordId}/personal-email`).then((r) => r.data),

  revealPhone: (recordId: string): Promise<RevealPhoneResult> =>
    client.get(`/search/persons/${recordId}/phone`).then((r) => r.data),
};
