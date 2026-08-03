// Shared TypeScript types and interfaces.

export interface ExtensionMessage<T = unknown> {
  type: string;
  payload?: T;
}

// Future types to add here:
//   LeadProfile, CompanyProfile, AuthUser, CreditBalance,
//   RevealResult, SearchFilters, StorageSchema, etc.
