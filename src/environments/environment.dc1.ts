import { Configuration } from '@apttus/core';
export const environment: Configuration = {
  production: true,
  defaultImageSrc: './assets/images/default.png',
  defaultCountry: 'US',
  defaultLanguage: 'en-US',
  enableErrorLogging: false,
  enableErrorReporting: false,
  enableMultiCurrency: false,
  enableQueryLogs: true,
  enablePerformanceLogs: true,
  defaultCurrency: 'USD',
  bufferTime: 20,
  maxBufferSize: 10,
  disableBuffer: false,
  subqueryLimit: 10,
  disableCache: false,
  encryptResponse: false,
  cartRetryLimit: 3,
  productIdentifier: 'Id',
  type: 'Salesforce',
  debounceTime: 1000,
  proxy: 'https://apttus-proxy.herokuapp.com',
  useIndexedDB: true,
  skipPricing: false,
  skipRules: false,
  expandDepth: 8,
  hashRouting: true,
  pricingMode: 'turbo',
  pricingFallback: false,
  packageNamespace: 'Apttus_WebStore',
  // *** TODO: Replace with Salesforce environment variables ***
  storefront: 'D-Commerce',
  organizationId: '00D2h0000008ebi',
  sentryDsn: 'https://6ad10246235742dc89f89b4c3f53f4aa@sentry.io/1230495',
  endpoint: 'https://dc1-cpqqacommunity1.cs36.force.com/ecom'
};
