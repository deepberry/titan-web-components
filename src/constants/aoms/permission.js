import routes from "./routes.json";
import { fallbackMenus } from "./fallback-menus";
import { isSuperAdmin } from "./user-access";
import { collectPermissions, hasRoutePermission, isOrganizationAdmin } from "./route-access";

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
    permissions,
    menuIndexes,
    user,
    parentPath = "",
    parentRequiresOrganizationAdmin = false,
    parentRequiresSuperAdmin = false
) {
    const entries = [];

    routeList.forEach((route) => {
        const normalizedRoute = normalizeRouteRecord(route, parentPath);

        if (normalizedRoute.meta.public) {
            return;
        }

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
        const canAccessCurrent =
            isSuperAdmin(user) ||
            requiresSuperAdmin ||
            requiresOrganizationAdmin ||
            hasRoutePermission(normalizedRoute.meta.permission, permissions);
        if (!canAccessCurrent) return;
        const childMenus =
            !normalizedRoute.meta.placeholder && Array.isArray(normalizedRoute.children)
                ? buildSidebarBranch(
                      normalizedRoute.children,
                      permissions,
                      menuIndexes,
                      user,
                      normalizedRoute.path,
                      requiresOrganizationAdmin,
                      requiresSuperAdmin
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

export function resolveSidebarMenus(menus, user) {
    const permissions = collectPermissions(menus);
    collectPermissions(user?.permissions).forEach((permission) => permissions.add(permission));
    const menuIndexes = buildMenuIndexes(menus);

    return buildSidebarBranch(routes, permissions, menuIndexes, user);
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
