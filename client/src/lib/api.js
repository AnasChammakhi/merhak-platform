const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

export const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80";

let csrfToken = null;


export function resetCsrfToken() {
  csrfToken = null;
}

export function getImageUrl(url, fallback = DEFAULT_PRODUCT_IMAGE) {
  if (!url) return fallback;
  const normalized = String(url).trim();

  if (!normalized) return fallback;
  if (normalized.startsWith("http://") || normalized.startsWith("https://") || normalized.startsWith("data:")) {
    return normalized;
  }

  const cleanPath = normalized.startsWith("/") ? normalized : `/${normalized}`;

  if (cleanPath.startsWith("/assets/") || cleanPath.startsWith("/uploads/")) {
    return cleanPath;
  }

  const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");
  return `${baseUrl}${cleanPath}`;
}


async function getCsrfToken() {
  if (csrfToken) {
    return csrfToken;
  }


  const response =
    await fetch(
      `${API_URL}/auth/csrf`,
      {
        credentials:
          "include",
      }
    );


  if (!response.ok) {
    throw new Error(
      "Impossible d'initialiser la sécurité de la session."
    );
  }


  const data =
    await response.json();


  csrfToken =
    data.csrfToken;


  return csrfToken;
}


export async function apiFetch(
  path,
  options = {}
) {
  const method =
    (
      options.method ||
      "GET"
    ).toUpperCase();


  const headers =
    new Headers(
      options.headers || {}
    );


  headers.set(
    "Accept",
    "application/json"
  );


  const unsafeMethods = [
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
  ];


  if (
    unsafeMethods.includes(method)
  ) {
    const token =
      await getCsrfToken();

    headers.set(
      "X-CSRF-Token",
      token
    );
  }


  let body =
    options.body;


  if (
    body &&
    !(body instanceof FormData) &&
    typeof body !== "string"
  ) {
    headers.set(
      "Content-Type",
      "application/json"
    );

    body =
      JSON.stringify(body);
  }


  const response =
    await fetch(
      `${API_URL}${path}`,
      {
        ...options,
        method,
        headers,
        body,

        credentials:
          "include",
      }
    );


  const contentType =
    response.headers.get(
      "content-type"
    );


  let data = null;


  if (
    contentType?.includes(
      "application/json"
    )
  ) {
    data =
      await response.json();
  }


  if (!response.ok) {
    const error =
      new Error(
        data?.message ||
          "Une erreur est survenue."
      );

    error.status =
      response.status;

    throw error;
  }


  return data;
}