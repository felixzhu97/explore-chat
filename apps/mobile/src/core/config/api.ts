const getBaseUrl = () => {
  if (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, "");
  }
  return "http://localhost:9200";
};

export const API_BASE_URL = getBaseUrl();
export const API_V1 = `${API_BASE_URL}/api/v1`;
