const getBaseUrl = () => {
  if (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, "");
  }
  return "http://localhost:9001";
};

const getSocketUrl = () => {
  if (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_SOCKET_IO_URL) {
    return process.env.EXPO_PUBLIC_SOCKET_IO_URL.replace(/\/$/, "");
  }
  return "http://localhost:9002";
};

export const API_BASE_URL = getBaseUrl();
export const API_V1 = `${API_BASE_URL}/api/v1`;
export const SOCKET_IO_URL = getSocketUrl();
