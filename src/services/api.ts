import axios, { AxiosHeaders, type AxiosRequestConfig } from "axios";

export const INVITE_CODE_STORAGE_KEY = "llquiz.inviteCode";

let inviteCodeFallback: string | null = null;

const getStorage = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

export const getInviteCode = () => {
  return getStorage()?.getItem(INVITE_CODE_STORAGE_KEY) ?? inviteCodeFallback;
};

export const setInviteCode = (inviteCode: string) => {
  const normalizedInviteCode = inviteCode.trim();

  inviteCodeFallback = normalizedInviteCode || null;

  if (!normalizedInviteCode) {
    getStorage()?.removeItem(INVITE_CODE_STORAGE_KEY);
    return;
  }

  getStorage()?.setItem(INVITE_CODE_STORAGE_KEY, normalizedInviteCode);
};

export const clearInviteCode = () => {
  inviteCodeFallback = null;
  getStorage()?.removeItem(INVITE_CODE_STORAGE_KEY);
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
});

api.interceptors.request.use((config) => {
  const inviteCode = getInviteCode();

  if (inviteCode) {
    const headers = AxiosHeaders.from(config.headers);

    headers.set("Authorization", `Bearer ${inviteCode}`);
    config.headers = headers;
  }

  return config;
});

export const mutationInstance = async <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  const { data } = await api.request<T>({ ...config, ...options });

  return data;
};
