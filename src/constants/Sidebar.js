import farmerIcon from "../assets/img/menus/member_fill.svg";
import gardenIcon from "../assets/img/menus/garden.svg";
import fruitIcon from "../assets/img/menus/fruit.svg";
import deviceIcon from "../assets/img/menus/device.svg";

export const LOCAL_ERP_CHILDREN = [
    {
        id: "local-erp-farmer",
        zh_name: "农户管理",
        en_name: "Farmer",
        link: "/erp/farmer",
        icon: farmerIcon,
        icon_local: true,
        is_blank: false,
    },
    {
        id: "local-erp-garden",
        zh_name: "园区管理",
        en_name: "Garden Management",
        link: "/erp/garden",
        icon: gardenIcon,
        icon_local: true,
        is_blank: false,
    },
    {
        id: "local-erp-fruit",
        zh_name: "果种管理",
        en_name: "Fruit Management",
        link: "/erp/fruit",
        icon: fruitIcon,
        icon_local: true,
        is_blank: false,
    },
    {
        id: "local-erp-device",
        zh_name: "设备管理",
        en_name: "Device",
        link: "/erp/device",
        icon: deviceIcon,
        icon_local: true,
        is_blank: false,
    },
];

function isHarvestSettlementMenu(item) {
    const normalizedLink = `/${item?.link || ""}`.replace(/\/{2,}/g, "/").replace(/\/$/, "");
    const normalizedName = `${item?.zh_name || ""}`.replace(/\s/g, "");

    return (
        (normalizedName.includes("采收") && normalizedName.includes("结算")) ||
        item?.name === "erp" ||
        normalizedLink === "/erp" ||
        normalizedLink.startsWith("/erp/")
    );
}

export function appendLocalSidebarChildren(menus = []) {
    return menus.map((item) => {
        if (!isHarvestSettlementMenu(item)) return item;

        const remoteChildren = Array.isArray(item.children) ? item.children : [];
        const remoteLinks = new Set(remoteChildren.map((child) => child.link));
        const fallbackChildren = LOCAL_ERP_CHILDREN.filter((child) => !remoteLinks.has(child.link));

        return {
            ...item,
            children: [...remoteChildren, ...fallbackChildren],
        };
    });
}
