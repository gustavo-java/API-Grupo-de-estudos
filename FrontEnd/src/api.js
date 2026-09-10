let token = sessionStorage.getItem("nexo-token");
export function setToken(value) {
  token = value;
  if (value) sessionStorage.setItem("nexo-token", value);
  else sessionStorage.removeItem("nexo-token");
}
export function hasToken() {
  return Boolean(token);
}

export async function api(path, { method = "GET", body, signal } = {}) {
  let response;
  try {
    response = await fetch(path, {
      method,
      signal,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body && !(body instanceof FormData)
          ? { "Content-Type": "application/json" }
          : {}),
      },
      body:
        body instanceof FormData
          ? body
          : body
            ? JSON.stringify(body)
            : undefined,
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error(
      "Não foi possível conectar à API. Verifique a conexão e tente novamente.",
    );
  }
  const data = await response.json().catch(() => null);
  if (response.status === 403)
    window.dispatchEvent(new Event("permissions-changed"));
  if (!response.ok) {
    if (
      response.status === 401 &&
      !["/auth/login", "/auth/register"].includes(path)
    ) {
      setToken(null);
      window.dispatchEvent(new Event("session-expired"));
    }
    const message = Array.isArray(data?.message)
      ? data.message.join(" ")
      : data?.message;
    throw new Error(
      response.status >= 500
        ? "A API está indisponível. Tente novamente em instantes."
        : message || "Não foi possível concluir a operação.",
    );
  }
  return data;
}
