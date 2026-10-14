import { resolveSidebarMenus, resolveActiveMenuPath, resolveOpenedMenuPaths } from "./aoms/permission";
import { fallbackMenus } from "./aoms/fallback-menus";
import zh from "./aoms/zh-cn.json";
import en from "./aoms/en-us.json";
import devConfigIcon from "../assets/img/menus/dev-config.svg";
import productHarvestIcon from "../assets/img/menus/product-harvest.svg";
import productErpIcon from "../assets/img/menus/product-erp.svg";
import productHycIcon from "../assets/img/menus/product-hyc.svg";
import envCtrlIcon from "../assets/img/menus/env-ctrl.svg";
import envIcon from "../assets/img/menus/env.svg";
import envDeviceIcon from "../assets/img/menus/env-device.svg";
import envDashboardIcon from "../assets/img/menus/env-dashboard.svg";
import envFertIcon from "../assets/img/menus/env-fert.svg";
import extFeatIcon from "../assets/img/menus/ext-feat.svg";
import extFuncIcon from "../assets/img/menus/ext-func-1.svg";

const menuIcons = {
    "dev-config": devConfigIcon,
    "product-harvest": productHarvestIcon,
    "product-erp": productErpIcon,
    "product-hyc": productHycIcon,
    "env-ctrl": envCtrlIcon,
    env: envIcon,
    "env-device": envDeviceIcon,
    "env-dashboard": envDashboardIcon,
    "env-fert": envFertIcon,
    "ext-feat": extFeatIcon,
    "ext-func-1": extFuncIcon,
};
const icons = require.context("../assets/img/aoms", false, /\.svg$/);
export function sidebarIcon(name) {
    if (Object.prototype.hasOwnProperty.call(menuIcons, name)) return menuIcons[name];
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
