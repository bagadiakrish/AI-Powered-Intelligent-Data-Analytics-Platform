import api from "./api";

export const registerUser = async (username, email, password, role = "Member") => {
  const response = await api.post("/auth/register/", { username, email, password, role });
  return response.data;
};

export const loginUser = async (username, password) => {
  const response = await api.post("/auth/login/", { username, password });
  return response.data;
};

export const getUserProfile = async () => {
  const response = await api.get("/auth/profile/");
  return response.data;
};
