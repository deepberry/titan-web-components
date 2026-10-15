import routes from "./routes.json";
import { fallbackMenus } from "./fallback-menus";
import { isDeveloper, isSuperAdmin, isSuperUser } from "./user-access";
import { applySidebarSettings } from "./sidebar-settings";
import { isOrganizationAdmin } from "./route-access";

export { canAccessRoute, collectPermissions, hasRoutePermission, isOrganizationAdmin } from "./route-access";

function joinRoutePath(parentPath, routePath) {
    if (!routePath) {
        return parentPath || "/";
    }

    if (routePath.startsWith("/")) {
        return routePath;
    }

    if (!parentPath || parentPath === "/") {
        return `/${routePath}`;
    }

    return `${parentPath.replace(/\/$/, "")}/${routePath}`;
}

function normalizeRouteRecord(route, parentPath) {
    return {
        ...route,
        path: joinRoutePath(parentPath, route.path),
        meta: route.meta || {},
    };
}

function walkMenus(menus, visitor) {
    if (!Array.isArray(menus)) {
        return;
    }

    menus.forEach((item) => {
        visitor(item);

        if (Array.isArray(item?.children) && item.children.length > 0) {
            walkMenus(item.children, visitor);
        }
    });
}

function sortByOrder(items) {
    return [...items].sort((first, second) => {
        const firstOrder = Number(first.order);
        const secondOrder = Number(second.order);
        const firstHasOrder = Number.isFinite(firstOrder);
        const secondHasOrder = Number.isFinite(secondOrder);

        if (firstHasOrder && secondHasOrder && firstOrder !== secondOrder) {
            return firstOrder - secondOrder;
        }

        if (firstHasOrder !== secondHasOrder) {
            return firstHasOrder ? -1 : 1;
        }

        return String(first.title || "").localeCompare(String(second.title || ""));
    });
}

function getOrderValue(item, fallback = "") {
    return item?.order ?? item?.sort ?? fallback;
}

function getMenuIndex(item) {
    return item?.menuIndex || item?.code || item?.path || item?.title || "";
}

function getDisplayChildren(item) {
    if (Array.isArray(item?.children) && item.children.length > 0) {
        return item.children;
    }

    if (Array.isArray(item?.mockChildren) && item.mockChildren.length > 0) {
        return item.mockChildren;
    }

    return [];
}

function buildMenuIndexes(menus) {
    const byPath = new Map();
    const byPermission = new Map();

    walkMenus(menus, (item) => {
        const itemPath = item?.path || item?.route;
        const itemPermission = item?.permission || item?.code;

        if (typeof itemPath === "string" && itemPath && !byPath.has(itemPath)) {
            byPath.set(itemPath, item);
        }

        if (typeof itemPermission === "string" && itemPermission) {
            byPermission.set(itemPermission, item);
        }
    });

    return {
        byPath,
        byPermission,
    };
}

function findMenuMeta(route, menuIndexes) {
    if (menuIndexes.byPath.has(route.path)) {
        return menuIndexes.byPath.get(route.path);
    }

    if (typeof route.meta?.permission === "string" && menuIndexes.byPermission.has(route.meta.permission)) {
        return menuIndexes.byPermission.get(route.meta.permission);
    }

    return null;
}

function normalizeMockChildren(children = []) {
    if (!Array.isArray(children)) {
        return [];
    }

    return children
        .filter((item) => item && typeof item === "object")
        .map((item) => ({
            path: item.path || item.route || "",
            title: item.title || item.name || item.label || "未命名菜单",
            titleKey: item.titleKey || "",
            code: item.code || item.permission || item.path || item.route || item.title || "mock-menu",
            menuIndex: item.code || item.permission || item.path || item.route || item.title || "mock-menu",
            order: getOrderValue(item),
            icon: item.icon || "Menu",
            disabled: item.disabled !== undefined ? item.disabled : !(item.path || item.route),
            children: normalizeMockChildren(item.children),
            isMock: true,
        }));
}

function buildSidebarBranch(
    routeList,
    menuIndexes,
    user,
    parentPath = "",
    parentRequiresOrganizationAdmin = false,
    parentRequiresSuperAdmin = false,
    parentRequiresDeveloper = false
) {
    const entries = [];

    routeList.forEach((route) => {
        const normalizedRoute = normalizeRouteRecord(route, parentPath);

        if (normalizedRoute.meta.public) {
            return;
        }

        const requiresDeveloper = parentRequiresDeveloper || normalizedRoute.meta.developer === true;
        if (requiresDeveloper && !isDeveloper(user) && !isSuperUser(user)) return;

        const requiresOrganizationAdmin =
            parentRequiresOrganizationAdmin || normalizedRoute.meta.organizationAdmin === true;
        const requiresSuperAdmin = parentRequiresSuperAdmin || normalizedRoute.meta.superAdmin === true;

        if (requiresSuperAdmin && !isSuperAdmin(user)) {
            return;
        }

        if (requiresOrganizationAdmin && !isOrganizationAdmin(user)) {
            return;
        }

        const linkedMenu = findMenuMeta(normalizedRoute, menuIndexes);
        const childMenus =
            !normalizedRoute.meta.placeholder && Array.isArray(normalizedRoute.children)
                ? buildSidebarBranch(
                      normalizedRoute.children,
                      menuIndexes,
                      user,
                      normalizedRoute.path,
                      requiresOrganizationAdmin,
                      requiresSuperAdmin,
                      requiresDeveloper
                  )
                : [];
        const hasRouteChildren = Array.isArray(normalizedRoute.children) && normalizedRoute.children.length > 0;
        const shouldRenderCurrent = normalizedRoute.meta.menu !== false && Boolean(normalizedRoute.name);

        if (hasRouteChildren && childMenus.length === 0 && !normalizedRoute.meta.placeholder) {
            return;
        }

        if (!shouldRenderCurrent) {
            entries.push(...childMenus);
            return;
        }

        const mockChildren = normalizedRoute.meta.placeholder
            ? []
            : normalizeMockChildren(linkedMenu?.mockChildren || normalizedRoute.meta.mockChildren);
        const menuIndex =
            linkedMenu?.code ||
            linkedMenu?.permission ||
            normalizedRoute.meta.permission ||
            normalizedRoute.name ||
            normalizedRoute.path;
        const menuNode = {
            path: normalizedRoute.path,
            title:
                linkedMenu?.title ||
                linkedMenu?.name ||
                linkedMenu?.label ||
                normalizedRoute.meta.title ||
                normalizedRoute.name ||
                "未命名菜单",
            titleKey: linkedMenu?.titleKey || normalizedRoute.meta.titleKey || "",
            code: linkedMenu?.code || linkedMenu?.permission || normalizedRoute.meta.permission || normalizedRoute.path,
            menuIndex,
            order: getOrderValue(linkedMenu, normalizedRoute.meta.order ?? ""),
            icon: normalizedRoute.meta.icon || "Menu",
            disabled: normalizedRoute.meta.disabled === true || linkedMenu?.disabled === true,
            children: sortByOrder(childMenus),
            mockChildren: sortByOrder(mockChildren),
        };

        entries.push(menuNode);
    });

    return sortByOrder(entries);
}

function findParentTrail(items, targetPath, trail = []) {
    for (const item of items) {
        const children = getDisplayChildren(item);

        if (children.length > 0) {
            const matchedTrail = findParentTrail(children, targetPath, [...trail, getMenuIndex(item)]);

            if (matchedTrail) {
                return matchedTrail;
            }
        }

        if (item.path === targetPath) {
            return trail;
        }
    }

    return null;
}

export function extractUserMenus(user, cachedMenus = []) {
    if (isSuperAdmin(user)) {
        return fallbackMenus;
    }

    if (Array.isArray(cachedMenus) && cachedMenus.length > 0) {
        return cachedMenus;
    }

    const userMenus = user?.menus || user?.menuList || user?.menu_list;

    return Array.isArray(userMenus) && userMenus.length > 0 ? userMenus : fallbackMenus;
}

export function resolveSidebarMenus(
    menus,
    user,
    { development = process.env.NODE_ENV === "development", hidden = [] } = {}
) {
    const customMenus = (Array.isArray(menus) ? menus : []).filter((item) => item?.user_id && item?.organization_id);
    // 内置菜单以本地配置为准；接口只提供真实扩展项，线上隐藏配置由 applySidebarSettings 处理。
    const menuIndexes = buildMenuIndexes(fallbackMenus);
    const entries = buildSidebarBranch(routes, menuIndexes, user);
    if (development) {
        customMenus.push({
            id: "dev-demo",
            isDevDemo: true,
            slug: "demo",
            title: "自定义项",
            en_name: "Custom item",
            link: "https://deepberry.cn",
            is_blank: 1,
        });
    }
    if (customMenus.length) {
        const systemIndex = entries.findIndex((item) => item.path === "/system");
        entries.splice(systemIndex < 0 ? entries.length : systemIndex, 0, {
            menuIndex: "custom-extensions",
            title: "扩展功能",
            titleKey: "menu.extensions",
            en_name: "Extensions",
            icon: "ext-feat",
            children: sortByOrder(
                customMenus.map((item) => ({
                    ...item,
                    path: item.path || item.link || "",
                    title: item.title || item.zh_name || item.name || "未命名菜单",
                    menuIndex: `custom-menu-${item.id || item.link || item.path}`,
                    order: getOrderValue(item),
                    icon: item.icon || "ext-func-1",
                }))
            ),
        });
    }
    return applySidebarSettings(entries, { hidden });
}

export function resolveActiveMenuPath(menus, routePath, activeMenu = "") {
    const targetPaths = [activeMenu, routePath].filter(
        (path, index, paths) => typeof path === "string" && path && paths.indexOf(path) === index
    );

    for (const targetPath of targetPaths) {
        let matchedPath = "";

        walkMenus(menus, (item) => {
            const itemPath = typeof item?.path === "string" ? item.path : "";
            const matches = itemPath && (targetPath === itemPath || targetPath.startsWith(`${itemPath}/`));

            if (matches && item.disabled !== true && itemPath.length > matchedPath.length) {
                matchedPath = itemPath;
            }
        });

        if (matchedPath) {
            return matchedPath;
        }
    }

    return activeMenu || routePath || "/";
}

export function resolveOpenedMenuPaths(menus, activePath) {
    if (!activePath) {
        return [];
    }

    const matchedTrail = findParentTrail(menus, activePath);

    return Array.isArray(matchedTrail) ? matchedTrail : [];
}
