import api, { apiBaseUrl } from "./api";

export const uploadFile = async (file, folder = "general") => {
  if (!file || typeof file === "string") {
    return file || "";
  }

  const data = new FormData();
  data.append("file", file);
  data.append("folder", folder);
  const response = await api.post("/files", data, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return response.url || "";
};

export const resolveAssetUrl = (url) => {
  if (!url || url.startsWith("http") || url.startsWith("blob:")) {
    return url || "";
  }
  if (url.startsWith("/api/")) {
    return `${apiBaseUrl.replace(/\/api$/, "")}${url}`;
  }
  return url;
};
