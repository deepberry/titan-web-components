import { parseSidebarForbidden } from "../constants/aoms/sidebar-settings";

export const SIDEBAR_CONFIG_URL = "https://cdn.deepberry.cn/common/system/conf/titan_default.json";

export async function loadSidebarSettings(signal) {
    const response = await fetch(SIDEBAR_CONFIG_URL, { cache: "no-cache", signal });
    if (!response.ok) throw new Error(`Sidebar configuration HTTP ${response.status}`);
    const config = await response.json();
    return { hidden: parseSidebarForbidden(config?.sidebar_menu_forbidden) };
}
