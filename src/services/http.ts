const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type ApiRequestOptions = RequestInit & {
  query?: Record<string, string | number | boolean | undefined | null>;
};

const buildUrl = (path: string, query?: ApiRequestOptions["query"]) => {
  const base = path.startsWith("/") ? `${API_BASE_URL}${path}` : `${API_BASE_URL}/${path}`;
  if (!query) return base;

  const searchParams = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${base}?${queryString}` : base;
};

const parseErrorMessage = (payload: any, status: number) => {
  return (
    payload?.message ||
    payload?.error ||
    (Array.isArray(payload?.errors) ? payload.errors.join(", ") : null) ||
    `Request failed with status ${status}`
  );
};

const isAuthRefreshableRequest = (path: string) => {
  const lowerPath = path.toLowerCase();
  return ![
    "/auth/login",
    "/auth/signup",
    "/auth/refresh",
    "/auth/logout",
  ].some((segment) => lowerPath.includes(segment));
};

export const apiRequest = async <T>(path: string, options: ApiRequestOptions = {}): Promise<T> => {
  const { query, headers, ...rest } = options;
  const isFormDataBody = rest.body instanceof FormData;
  const method = String(rest.method || "GET").toUpperCase();

  const isRetryableMethod = ["GET", "DELETE", "PUT"].includes(method);
  const maxNetworkRetries = isRetryableMethod ? 2 : 0;

  const run = async () => {
    let attempt = 0;
    let lastError: unknown = null;

    while (attempt <= maxNetworkRetries) {
      try {
        const response = await fetch(buildUrl(path, query), {
          credentials: "include",
          headers: isFormDataBody
            ? {
                ...headers,
              }
            : {
                "Content-Type": "application/json",
                ...headers,
              },
          ...rest,
        });

        const isJson = response.headers.get("content-type")?.includes("application/json");
        const payload = isJson ? await response.json() : null;
        return { response, payload };
      } catch (error) {
        lastError = error;
        if (attempt >= maxNetworkRetries) {
          const message = error instanceof Error ? error.message : "Network request failed";
          throw new Error(
            `Unable to reach server (${message}). Backend may be waking up after cold start. Please retry in a few seconds.`
          );
        }

        const backoffMs = (attempt + 1) * 1200;
        await sleep(backoffMs);
      }

      attempt += 1;
    }

    throw new Error(lastError instanceof Error ? lastError.message : "Network request failed");
  };

  let { response, payload } = await run();

  if (response.status === 401 && isAuthRefreshableRequest(path)) {
    const refreshResponse = await fetch(buildUrl("/auth/refresh"), {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    if (refreshResponse.ok) {
      ({ response, payload } = await run());
    }
  }

  if (!response.ok) {
    throw new Error(parseErrorMessage(payload, response.status));
  }

  return payload as T;
};
