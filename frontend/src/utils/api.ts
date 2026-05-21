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

const DEFAULT_PROXY_TEMPLATE = "https://api.allorigins.win/raw?url={url}";

const buildProxyUrl = (template: string, targetUrl: string) => {
  if (template.includes("{url}")) {
    return template.replace("{url}", encodeURIComponent(targetUrl));
  }

  return `${template}${encodeURIComponent(targetUrl)}`;
};

type EndpointConfig = {
  endpointPath: string;
  fpsId: string;
  prodApiUrl?: string;
};

const resolveEndpointUrl = ({
  endpointPath,
  fpsId,
  prodApiUrl,
}: EndpointConfig) => {
  const fpsQuery = `fpsId=${fpsId}&month=5&year=2026`;
  const apiPath = `${endpointPath}?${fpsQuery}`;
  const targetUrl = `https://aepos.ap.gov.in${endpointPath}?${fpsQuery}`;
  const netlifyPath = `/api${endpointPath}?${fpsQuery}`;

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
    endpointPath: "/Epos_Spring/fps/fpstransaction",
    fpsId: FPS_ID,
    prodApiUrl: import.meta.env.VITE_PROD_API_URL,
  });
};

export const getTransactionsApiUrlByFpsId = (fpsId: string) => {
  return resolveEndpointUrl({
    endpointPath: "/Epos_Spring/fps/fpstransaction",
    fpsId,
    prodApiUrl: import.meta.env.VITE_PROD_API_URL,
  });
};

export const getStockApiUrl = () => {
  return resolveEndpointUrl({
    endpointPath: "/Epos_Spring/fps/getfpsStockregisterOld",
    fpsId: FPS_ID,
    prodApiUrl: import.meta.env.VITE_PROD_STOCK_API_URL,
  });
};

export const getStockApiUrlByFpsId = (fpsId: string) => {
  return resolveEndpointUrl({
    endpointPath: "/Epos_Spring/fps/getfpsStockregisterOld",
    fpsId,
    prodApiUrl: import.meta.env.VITE_PROD_STOCK_API_URL,
  });
};

export const getApiUrl = getTransactionsApiUrl;
