import { PAGE_TYPES } from '../constants';
import type { TabInfo, PageType } from '../types';

function extractDomain(url: string): string {
  try {
    const { hostname } = new URL(url);
    return hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function domainToCompanyName(domain: string): string {
  // Strip TLD: stripe.com → stripe, openai.com → openai
  const parts = domain.split('.');
  return parts.length >= 2 ? parts[parts.length - 2] : parts[0];
}

export function detectPageType(url: string): PageType {
  if (
    !url ||
    url.startsWith('chrome://') ||
    url.startsWith('chrome-extension://') ||
    url === 'about:blank' ||
    url.startsWith('about:')
  ) {
    return PAGE_TYPES.UNSUPPORTED;
  }
  try {
    const { hostname, pathname } = new URL(url);
    if (hostname.includes('linkedin.com')) {
      if (pathname.startsWith('/in/')) return PAGE_TYPES.LINKEDIN_PERSON;
      if (pathname.startsWith('/company/')) return PAGE_TYPES.LINKEDIN_COMPANY;
      return PAGE_TYPES.UNSUPPORTED;
    }
    return PAGE_TYPES.COMPANY_WEBSITE;
  } catch {
    return PAGE_TYPES.UNSUPPORTED;
  }
}

export function buildTabInfo(url: string): TabInfo {
  const pageType = detectPageType(url);

  if (pageType === PAGE_TYPES.LINKEDIN_PERSON) {
    // Normalize: ensure trailing slash removed for consistency
    const cleanUrl = url.split('?')[0].replace(/\/$/, '');
    return { url, pageType, linkedinUrl: cleanUrl };
  }

  if (pageType === PAGE_TYPES.LINKEDIN_COMPANY) {
    try {
      const { pathname } = new URL(url);
      // /company/softsuave/posts/?feedView=all → 'softsuave'
      // Take only the first segment after /company/ to ignore sub-pages
      const slug = pathname.replace(/^\/company\//, '').split('/')[0];
      const linkedinUrl = `https://www.linkedin.com/company/${slug}`;
      return { url, pageType, linkedinUrl, companyName: slug };
    } catch {
      return { url, pageType };
    }
  }

  if (pageType === PAGE_TYPES.COMPANY_WEBSITE) {
    const domain = extractDomain(url);
    const companyName = domainToCompanyName(domain);
    return { url, pageType, domain, companyName };
  }

  return { url, pageType };
}
