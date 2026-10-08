import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import routeDefinitions from "../constants/aoms/routes.json";
import { aomsPreviewMenus } from "../constants/AomsSidebar";
import ComponentsHome from "../views/ComponentsHome.vue";
import NavigationPreview from "../views/NavigationPreview.vue";

// Mirror AOMS paths and metadata without importing its business pages or auth store.
function makeRoutes(records, parentPath = ""): RouteRecordRaw[] {
    return records.flatMap((record) => {
        const path = record.path.startsWith("/") ? record.path : `${parentPath.replace(/\/$/, "")}/${record.path}`;
        const children = record.children ? makeRoutes(record.children, path) : [];
        if (!record.name) return children;
        const firstLeaf = (menus) => {
            for (const item of menus) {
                if (item.path === path) {
                    let leaf = item;
                    while (leaf.children?.length) leaf = leaf.children[0];
                    return leaf.path;
                }
                const found = firstLeaf(item.children || []);
                if (found) return found;
            }
        };
        const redirect = record.redirect || (children.length ? firstLeaf(aomsPreviewMenus) : undefined);
        return [
            {
                path,
                name: record.name,
                meta: record.meta || {},
                ...(redirect ? { redirect } : { component: path === "/" ? ComponentsHome : NavigationPreview }),
            } as RouteRecordRaw,
            ...children,
        ];
    });
}

export const routes: RouteRecordRaw[] = [
    ...makeRoutes(routeDefinitions),
    { path: "/:pathMatch(.*)*", component: NavigationPreview, meta: { title: "页面不存在" } },
];
export default createRouter({ history: createWebHistory(), routes });
