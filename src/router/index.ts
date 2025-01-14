import { createRouter, createWebHistory } from "vue-router";

const routes = [
    {
        path: "/account",
        name: "account",
        redirect: "/account/login",
        component: () => import("../views/Index.vue"),
        meta: { title: "账号中心 - Account" },
        children: [
            {
                path: "login",
                name: "account-login",
                component: () => import("../views/account/Login.vue"),
                meta: { title: "登录 - Sign in" },
            },
        ],
    },
    {
        path: "/greenhouse",
        name: "greenhouse",
        redirect: "/greenhouse/index",
        meta: {
            title: "园区管理 - GreenHouse",
            icon: "aigrow2",
            name: "园区管理",
        },
        component: () => import("../views/Index.vue"),
        children: [],
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
