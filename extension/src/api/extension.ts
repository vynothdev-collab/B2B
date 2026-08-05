import client from './client';
import type { CompanyResult, PersonResult, SearchResponse } from '../types';

export const extensionApi = {
  searchPerson: (linkedinUrl: string, pageSize = 5): Promise<SearchResponse<PersonResult>> =>
    client
      .post('/extension/search/person', { linkedin_url: linkedinUrl, page_size: pageSize })
      .then((r) => r.data),

  searchCompany: (
    params: { linkedinUrl?: string; website?: string; companyName?: string },
    pageSize = 5
  ): Promise<SearchResponse<CompanyResult>> =>
    client
      .post('/extension/search/company', {
        linkedin_url: params.linkedinUrl,
        website: params.website,
        company_name: params.companyName,
        page_size: pageSize,
      })
      .then((r) => r.data),
};
