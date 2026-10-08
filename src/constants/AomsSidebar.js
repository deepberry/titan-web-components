import { resolveSidebarMenus, resolveActiveMenuPath, resolveOpenedMenuPaths } from "./aoms/permission";
import { fallbackMenus } from "./aoms/fallback-menus";
import zh from "./aoms/zh-cn.json";
import en from "./aoms/en-us.json";

const icons = require.context("../assets/img/aoms", false, /\.svg$/);
export function sidebarIcon(name) {
    const key = `./${name}.svg`;
    return icons.keys().includes(key) ? icons(key) : require("../assets/img/default_icon.svg");
}
export function sidebarTitle(item, english = false) {
    const dictionary = english ? en : zh;
    const translated = item.titleKey?.split(".").reduce((value, key) => value?.[key], dictionary);
    return translated || (english ? item.en_name : item.zh_name) || item.title || item.name || "";
}
export function normalizeSidebarMenus(items = []) {
    return items.map((item) => ({
        ...item,
        path: item.path || item.link || "",
        title: item.title || item.zh_name || item.name || "",
        menuIndex: item.menuIndex || item.code || item.path || item.link || String(item.id),
        children: normalizeSidebarMenus(item.children?.length ? item.children : item.mockChildren || []),
    }));
}
// The component showcase displays all navigation states. Host apps supply their authorized menus.
export const aomsPreviewMenus = resolveSidebarMenus(fallbackMenus, { is_founder: true });
export { resolveSidebarMenus, resolveActiveMenuPath, resolveOpenedMenuPaths };
