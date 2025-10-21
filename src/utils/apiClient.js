import logger from './logger';

const DEFAULT_TIMEOUT = 15000;
const DEFAULT_HEADERS = {
  Accept: 'application/json',
};

const isBrowser = typeof window !== 'undefined';

export const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_BASE) {
    return process.env.REACT_APP_API_BASE;
  }

  if (isBrowser) {
    return window.location.origin;
  }

  return '';
};

const isAbsoluteUrl = (value) => /^https?:\/\//i.test(value);

const joinUrl = (base, path) => {
  if (!base) {
    return path;
  }

  if (!path) {
    return base;
  }

  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  return `${normalizedBase}/${normalizedPath}`;
};

const ensureHeader = (headers, name, value) => {
  const existingKey = Object.keys(headers).find((key) => key.toLowerCase() === name.toLowerCase());
  if (!existingKey) {
    headers[name] = value;
  }
};

const isFormData = (payload) => typeof FormData !== 'undefined' && payload instanceof FormData;
const isBlob = (payload) => typeof Blob !== 'undefined' && payload instanceof Blob;
const isArrayBuffer = (payload) =>
  typeof ArrayBuffer !== 'undefined' && (payload instanceof ArrayBuffer || ArrayBuffer.isView(payload));
const isURLSearchParams = (payload) =>
  typeof URLSearchParams !== 'undefined' && payload instanceof URLSearchParams;

const createTimeoutError = (url, timeout) => {
  const error = new Error(`Request to ${url} timed out after ${timeout}ms`);
  error.name = 'TimeoutError';
  return error;
};

const attachAbortSignal = (controller, externalSignal) => {
  if (!externalSignal) {
    return () => {};
  }

  if (externalSignal.aborted) {
    controller.abort(externalSignal.reason || new Error('Request aborted'));
    return () => {};
  }

  const listener = () => {
    controller.abort(externalSignal.reason || new Error('Request aborted'));
  };

  externalSignal.addEventListener('abort', listener, { once: true });

  return () => {
    externalSignal.removeEventListener('abort', listener);
  };
};

export const request = async (path, options = {}) => {
  const {
    baseUrl,
    method = 'GET',
    headers = {},
    body,
    signal,
    timeout = DEFAULT_TIMEOUT,
    parseJson = true,
    ...fetchOptions
  } = options;

  const url = isAbsoluteUrl(path) ? path : joinUrl(baseUrl ?? getApiBaseUrl(), path);

  const controller = new AbortController();
  const detachExternalSignal = attachAbortSignal(controller, signal);

  const requestHeaders = { ...DEFAULT_HEADERS, ...headers };
  let requestBody = body;

  const shouldSerializeBody =
    body !== undefined &&
    !isFormData(body) &&
    !isBlob(body) &&
    !isArrayBuffer(body) &&
    !isURLSearchParams(body) &&
    typeof body !== 'string';

  if (shouldSerializeBody) {
    requestBody = JSON.stringify(body);
    ensureHeader(requestHeaders, 'Content-Type', 'application/json');
  }

  const abortOnTimeout =
    Number.isFinite(timeout) && timeout > 0
      ? setTimeout(() => {
          controller.abort(createTimeoutError(url, timeout));
        }, timeout)
      : null;

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: requestBody,
      signal: controller.signal,
      ...fetchOptions,
    });

    let data = null;
    if (parseJson && response.status !== 204) {
      const text = await response.text();
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (jsonError) {
          const parseError = new Error(`Failed to parse JSON response from ${url}`);
          parseError.name = 'ResponseParseError';
          parseError.data = text;
          parseError.cause = jsonError;
          logger.error('api-response-parse-error', parseError, { url, method });
          throw parseError;
        }
      }
    }

    if (!response.ok) {
      const error = new Error(
        data?.error || `Request to ${url} failed with status ${response.status}`,
      );
      error.status = response.status;
      error.data = data;
      error.url = url;
      error.method = method;
      logger.error('api-request-failed', error, { url, method, status: response.status });
      throw error;
    }

    return { data, response };
  } catch (error) {
    if (controller.signal.aborted) {
      const reason = controller.signal.reason;
      if (reason instanceof Error) {
        throw reason;
      }
      const abortError = new Error('The request was aborted');
      abortError.name = 'AbortError';
      throw abortError;
    }

    throw error;
  } finally {
    if (abortOnTimeout) {
      clearTimeout(abortOnTimeout);
    }
    detachExternalSignal();
  }
};

const createMethod = (method) => (path, options = {}) => request(path, { ...options, method });

const apiClient = {
  request,
  get: createMethod('GET'),
  post: createMethod('POST'),
  put: createMethod('PUT'),
  patch: createMethod('PATCH'),
  delete: createMethod('DELETE'),
};

export default apiClient;
