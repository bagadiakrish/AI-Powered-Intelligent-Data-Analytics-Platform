import api from "./api";

export const trainModel = async (datasetId, targetCol, algorithm, params = {}, featureCols = []) => {
  const response = await api.post("/ml/train/", {
    dataset_id: datasetId,
    target_col: targetCol,
    feature_cols: featureCols,
    algorithm,
    params,
  });
  return response.data;
};

export const getModels = async () => {
  const response = await api.get("/ml/models/");
  return response.data;
};

export const getModelDetail = async (id) => {
  const response = await api.get(`/ml/models/${id}/`);
  return response.data;
};

export const deleteModel = async (id) => {
  const response = await api.delete(`/ml/models/${id}/`);
  return response.data;
};
