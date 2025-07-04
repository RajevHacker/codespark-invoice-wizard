import { useAuth } from "@/pages/AuthContext";

export const useApi = () => {
  const { token, partnerName } = useAuth();

  const apiFetch = async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    const headers = new Headers(options.headers || {});
    headers.set("Content-Type", "application/json");

    if (token) headers.set("Authorization", `Bearer ${token}`);
    if (partnerName) headers.set("X-Partner-Name", partnerName);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    return response;
  };

  return { apiFetch };
};