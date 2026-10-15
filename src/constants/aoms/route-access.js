import { isDeveloper, isSuperAdmin, isSuperUser } from "./user-access";

function appendPermission(set, value) {
    if (typeof value !== "string") return;

    const normalizedValue = value.trim();
    if (normalizedValue) set.add(normalizedValue);
}

function walkMenus(menus, visitor) {
    if (!Array.isArray(menus)) return;

    menus.forEach((item) => {
        visitor(item);
        if (Array.isArray(item?.children) && item.children.length > 0) {
            walkMenus(item.children, visitor);
        }
    });
}

export function isOrganizationAdmin(user) {
    const organization = user?.organization || user?.Organization || user?.org;
    const founderId = organization?.user_id ?? organization?.userId;

    return isSuperAdmin(user) || (founderId != null && String(founderId) === String(user?.id));
}

export function collectPermissions(menus) {
    const permissions = new Set();

    if (Array.isArray(menus)) {
        menus.forEach((item) => appendPermission(permissions, item));
    }

    walkMenus(menus, (item) => {
        appendPermission(permissions, item?.code);
        appendPermission(permissions, item?.permission);
    });

    return permissions;
}

export function hasRoutePermission(requiredPermission, permissions) {
    if (!requiredPermission) return true;

    const normalizedPermissions = permissions instanceof Set ? permissions : collectPermissions(permissions);
    const requiredList = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];

    return requiredList.some((permission) => normalizedPermissions.has(permission));
}

export function canAccessRoute(to, menus, user) {
    if (to.matched.some((record) => record.meta?.developer === true) && !isDeveloper(user) && !isSuperUser(user)) {
        return false;
    }

    if (isSuperAdmin(user)) return true;

    if (to.matched.some((record) => record.meta?.superAdmin === true)) return false;

    const requiresOrganizationAdmin = to.matched.some((record) => record.meta?.organizationAdmin === true);
    if (requiresOrganizationAdmin) return isOrganizationAdmin(user);

    const permissions = menus instanceof Set ? menus : collectPermissions(menus);
    return to.matched.every((record) => hasRoutePermission(record.meta?.permission, permissions));
}
