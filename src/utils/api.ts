/**
 * API endpoint strategy:
 * - DEV: use Vite proxy path (no CORS issues)
 * - PROD: use either:
 *   1) VITE_PROD_API_URL (preferred: your own proxy endpoint), or
 *   2) Netlify rewrite proxy (default in this project), or
 *   3) VITE_CORS_PROXY_TEMPLATE (must contain {url} placeholder), or
 *   4) default public bridge fallback
 */

const TRANSACTION_QUERY = "fpsId=0684120&month=5&year=2026";
const API_PATH = `/Epos_Spring/fps/fpstransaction?${TRANSACTION_QUERY}`;
const TARGET_URL = `https://aepos.ap.gov.in/Epos_Spring/fps/fpstransaction?${TRANSACTION_QUERY}`;
const NETLIFY_PROXY_PATH = `/api/Epos_Spring/fps/fpstransaction?${TRANSACTION_QUERY}`;
const DEFAULT_PROXY_TEMPLATE = "https://api.allorigins.win/raw?url={url}";

const buildProxyUrl = (template: string, targetUrl: string) => {
  if (template.includes("{url}")) {
    return template.replace("{url}", encodeURIComponent(targetUrl));
  }

  return `${template}${encodeURIComponent(targetUrl)}`;
};

export const getApiUrl = () => {
  if (import.meta.env.DEV) {
    return API_PATH;
  }

  const prodApiUrl = import.meta.env.VITE_PROD_API_URL?.trim();
  if (prodApiUrl) {
    return prodApiUrl;
  }

  const useNetlifyProxy = import.meta.env.VITE_USE_NETLIFY_PROXY !== "false";
  if (useNetlifyProxy) {
    return NETLIFY_PROXY_PATH;
  }

  const proxyTemplate =
    import.meta.env.VITE_CORS_PROXY_TEMPLATE?.trim() || DEFAULT_PROXY_TEMPLATE;
  return buildProxyUrl(proxyTemplate, TARGET_URL);
};
