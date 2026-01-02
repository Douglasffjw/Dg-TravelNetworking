import api from "../api/api";

export const login = async (email, senha) => {
  const res = await api.post("/auth/login", { email, senha });
  return res.data;
};
