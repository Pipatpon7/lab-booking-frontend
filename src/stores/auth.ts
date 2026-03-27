import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "../api/axios";

export const useAuthStore = defineStore("auth", () => {
  const token = ref(localStorage.getItem("token") || "");
  const role = ref(localStorage.getItem("role") || "");
  const fullName = ref(localStorage.getItem("fullName") || "");

  const isLoggedIn = computed(() => !!token.value);
  const isAdmin = computed(() => role.value === "admin");

  async function login(email: string, password: string) {
    const res = await api.post("/auth/login", { email, password });
    token.value = res.data.access_token;
    role.value = res.data.role;
    fullName.value = res.data.fullName;
    localStorage.setItem("token", token.value);
    localStorage.setItem("role", role.value);
    localStorage.setItem("fullName", fullName.value);
  }

  async function register(email: string, password: string, fullName: string) {
    await api.post("/auth/register", { email, password, fullName });
  }

  function logout() {
    token.value = "";
    role.value = "";
    fullName.value = "";
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("fullName");
  }

  return {
    token,
    role,
    fullName,
    isLoggedIn,
    isAdmin,
    login,
    register,
    logout,
  };
});
