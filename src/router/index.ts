import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import RoomsView from "../views/RoomsView.vue";
import MyBookingsView from "../views/MyBookingsView.vue";
import AdminView from "../views/AdminView.vue";
import AdminRoomsView from "../views/AdminRoomsView.vue";
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/login" },
    { path: "/login", component: LoginView },
    { path: "/register", component: RegisterView },
    { path: "/rooms", component: RoomsView, meta: { requiresAuth: true } },
    {
      path: "/my-bookings",
      component: MyBookingsView,
      meta: { requiresAuth: true },
    },
    {
      path: "/admin",
      component: AdminView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: "/admin/rooms",
      component: AdminRoomsView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
  ],
});

router.beforeEach((to) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (to.meta.requiresAuth && !token) return "/login";
  if (to.meta.requiresAdmin && role !== "admin") return "/rooms";
});

export default router;
