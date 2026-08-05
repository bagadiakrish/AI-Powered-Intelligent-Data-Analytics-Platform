import api from "./api";

export const getDatasets = async () => {
  const response = await api.get("/datasets/");
  return response.data;
};

export const getDatasetDetail = async (id) => {
  const response = await api.get(`/datasets/${id}/`);
  return response.data;
};

export const uploadDataset = async (formData) => {
  const response = await api.post("/datasets/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const deleteDataset = async (id) => {
  const response = await api.delete(`/datasets/${id}/`);
  return response.data;
};

export const getDatasetPreview = async (id) => {
  const response = await api.get(`/datasets/${id}/preview/`);
  return response.data;
};

export const cleanDataset = async (id, options) => {
  const response = await api.post(`/datasets/${id}/clean/`, options);
  return response.data;
};
