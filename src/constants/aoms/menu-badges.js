export const MENU_BADGE_REFRESH_EVENT = "aoms:menu-badge-refresh";

export function normalizeMenuBadgeCount(value) {
    const count = Number(value);

    return Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
}

export function formatMenuBadgeCount(value) {
    const count = normalizeMenuBadgeCount(value);

    return count > 99 ? "99+" : String(count);
}

const BADGE_TONE_PRIORITY = Object.freeze({ default: 0, warning: 1, danger: 2 });

function normalizeMenuBadge(value) {
    if (value && typeof value === "object") {
        const tone = Object.prototype.hasOwnProperty.call(BADGE_TONE_PRIORITY, value.tone) ? value.tone : "default";
        return { count: normalizeMenuBadgeCount(value.count), tone };
    }
    return { count: normalizeMenuBadgeCount(value), tone: "default" };
}

function strongestBadgeTone(items) {
    return items.reduce((tone, item) => {
        const candidate = item?.badgeTone || "default";
        return BADGE_TONE_PRIORITY[candidate] > BADGE_TONE_PRIORITY[tone] ? candidate : tone;
    }, "default");
}

export function decorateMenuBadgeCounts(menus, countsByPath = {}) {
    if (!Array.isArray(menus)) return [];

    return menus.map((item) => {
        const children = decorateMenuBadgeCounts(item?.children, countsByPath);
        const mockChildren = decorateMenuBadgeCounts(item?.mockChildren, countsByPath);
        const displayChildren = children.length > 0 ? children : mockChildren;
        const childCount = displayChildren.reduce((sum, child) => sum + normalizeMenuBadgeCount(child.badgeCount), 0);
        const ownBadge = normalizeMenuBadge(countsByPath[item?.path]);
        const badgeCount = ownBadge.count || childCount;
        const badgeTone = ownBadge.count > 0 ? ownBadge.tone : strongestBadgeTone(displayChildren);

        return {
            ...item,
            ...(Array.isArray(item?.children) ? { children } : {}),
            ...(Array.isArray(item?.mockChildren) ? { mockChildren } : {}),
            badgeCount,
            badgeTone,
        };
    });
}

export function requestMenuBadgeRefresh() {
    window.dispatchEvent(new CustomEvent(MENU_BADGE_REFRESH_EVENT));
}
