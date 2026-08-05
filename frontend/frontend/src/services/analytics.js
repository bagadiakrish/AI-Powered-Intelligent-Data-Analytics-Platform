import api from "./api";

export const getOverview = async (id) => {
  const response = await api.get(`/analytics/${id}/overview/`);
  return response.data;
};

export const getCorrelation = async (id) => {
  const response = await api.get(`/analytics/${id}/correlation/`);
  return response.data;
};

export const getCrosstab = async (id, col1, col2) => {
  const response = await api.get(`/analytics/${id}/crosstab/`, {
    params: { col1, col2 }
  });
  return response.data;
};
