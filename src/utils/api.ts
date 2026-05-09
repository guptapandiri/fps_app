/**
 * API endpoint strategy:
 * - DEV: use Vite proxy path (no CORS issues)
 * - PROD: use either:
 *   1) endpoint-specific env URL override (preferred: your own proxy endpoint), or
 *   2) Netlify rewrite proxy (default in this project), or
 *   3) VITE_CORS_PROXY_TEMPLATE (must contain {url} placeholder), or
 *   4) default public bridge fallback
 */

export const FPS_ID = "0684120";

const FPS_QUERY = `fpsId=${FPS_ID}&month=5&year=2026`;

const TRANSACTION_API_PATH = `/Epos_Spring/fps/fpstransaction?${FPS_QUERY}`;
const TRANSACTION_TARGET_URL = `https://aepos.ap.gov.in/Epos_Spring/fps/fpstransaction?${FPS_QUERY}`;
const TRANSACTION_NETLIFY_PROXY_PATH = `/api/Epos_Spring/fps/fpstransaction?${FPS_QUERY}`;

const STOCK_API_PATH = `/Epos_Spring/fps/getfpsStockregisterOld?${FPS_QUERY}`;
const STOCK_TARGET_URL = `https://aepos.ap.gov.in/Epos_Spring/fps/getfpsStockregisterOld?${FPS_QUERY}`;
const STOCK_NETLIFY_PROXY_PATH = `/api/Epos_Spring/fps/getfpsStockregisterOld?${FPS_QUERY}`;

const DEFAULT_PROXY_TEMPLATE = "https://api.allorigins.win/raw?url={url}";

const buildProxyUrl = (template: string, targetUrl: string) => {
  if (template.includes("{url}")) {
    return template.replace("{url}", encodeURIComponent(targetUrl));
  }

  return `${template}${encodeURIComponent(targetUrl)}`;
};

type EndpointConfig = {
  apiPath: string;
  targetUrl: string;
  netlifyPath: string;
  prodApiUrl?: string;
};

const resolveEndpointUrl = ({
  apiPath,
  targetUrl,
  netlifyPath,
  prodApiUrl,
}: EndpointConfig) => {
  if (import.meta.env.DEV) {
    return apiPath;
  }

  const trimmedProdUrl = prodApiUrl?.trim();
  if (trimmedProdUrl) {
    return trimmedProdUrl;
  }

  const useNetlifyProxy = import.meta.env.VITE_USE_NETLIFY_PROXY !== "false";
  if (useNetlifyProxy) {
    return netlifyPath;
  }

  const proxyTemplate =
    import.meta.env.VITE_CORS_PROXY_TEMPLATE?.trim() || DEFAULT_PROXY_TEMPLATE;
  return buildProxyUrl(proxyTemplate, targetUrl);
};

export const getTransactionsApiUrl = () => {
  return resolveEndpointUrl({
    apiPath: TRANSACTION_API_PATH,
    targetUrl: TRANSACTION_TARGET_URL,
    netlifyPath: TRANSACTION_NETLIFY_PROXY_PATH,
    prodApiUrl: import.meta.env.VITE_PROD_API_URL,
  });
};

export const getStockApiUrl = () => {
  return resolveEndpointUrl({
    apiPath: STOCK_API_PATH,
    targetUrl: STOCK_TARGET_URL,
    netlifyPath: STOCK_NETLIFY_PROXY_PATH,
    prodApiUrl: import.meta.env.VITE_PROD_STOCK_API_URL,
  });
};

export const getApiUrl = getTransactionsApiUrl;
