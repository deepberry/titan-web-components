<template>
    <el-sub-menu
        v-if="hasChildren"
        :index="nodeIndex"
        :disabled="item.disabled"
        :class="menuNodeClass"
        :popper-class="collapsed ? 'c-titan-sidebar__popper' : ''"
        :title="collapsed ? displayTitle : undefined"
    >
        <template #title>
            <span class="c-titan-sidebar__menu-entry">
                <img v-svg-inline :src="resolvedIcon" class="c-titan-sidebar__menu-icon" alt="" />
                <span class="c-titan-sidebar__menu-title">{{ displayTitle }}</span>
                <span
                    v-if="hasBadge"
                    class="c-titan-sidebar__menu-badge"
                    :class="[`is-${badgeTone}`, { 'is-dot': collapsed }]"
                    :aria-label="badgeLabel"
                    >{{ collapsed ? "" : formattedBadgeCount }}</span
                >
            </span>
        </template>

        <sidebar-menu-node
            v-for="child in displayChildren"
            :key="getNodeKey(child)"
            :item="child"
            :collapsed="false"
            :level="level + 1"
        />
    </el-sub-menu>

    <el-menu-item
        v-else
        :index="itemIndex"
        :class="menuNodeClass"
        :disabled="item.disabled"
        :title="collapsed ? displayTitle : undefined"
    >
        <span class="c-titan-sidebar__menu-entry">
            <img v-svg-inline :src="resolvedIcon" class="c-titan-sidebar__menu-icon" alt="" />
            <span class="c-titan-sidebar__menu-title">
                {{ displayTitle }}
                <span v-if="item.isDevDemo" class="c-titan-sidebar__dev-tag">DEV</span>
            </span>
            <span
                v-if="hasBadge"
                class="c-titan-sidebar__menu-badge"
                :class="[`is-${badgeTone}`, { 'is-dot': collapsed }]"
                :aria-label="badgeLabel"
                >{{ collapsed ? "" : formattedBadgeCount }}</span
            >
        </span>
    </el-menu-item>
</template>

<script>
import { sidebarIcon, sidebarTitle } from "../../../constants/AomsSidebar";
import User from "../../../utils/user";
import { translate } from "../../../hooks/useLocale";
import { getCdnLink } from "@deepberry/common/js/utils";
import { formatMenuBadgeCount, normalizeMenuBadgeCount } from "../../../constants/aoms/menu-badges";

export default {
    name: "SidebarMenuNode",
    props: {
        item: {
            type: Object,
            required: true,
        },
        collapsed: {
            type: Boolean,
            default: false,
        },
        level: {
            type: Number,
            default: 1,
        },
    },
    computed: {
        nodeIndex() {
            return this.getNodeKey(this.item);
        },
        itemIndex() {
            return this.item?.path || this.nodeIndex;
        },
        displayChildren() {
            if (Array.isArray(this.item?.children) && this.item.children.length > 0) {
                return this.item.children;
            }

            if (Array.isArray(this.item?.mockChildren) && this.item.mockChildren.length > 0) {
                return this.item.mockChildren;
            }

            return [];
        },
        hasChildren() {
            return this.displayChildren.length > 0;
        },
        resolvedIcon() {
            const icon = this.item?.icon || "";
            if (this.item.icon_local || /^https?:/.test(icon)) return icon;
            if (icon.includes("/") || icon.endsWith(".svg")) return getCdnLink(icon.replace(/^\//, ""));
            return sidebarIcon(icon);
        },
        displayTitle() {
            return sidebarTitle(this.item, User.getLocale() === "en-us");
        },
        badgeLabel() {
            return translate("commonSidebar.badge", User.getLocale())
                .replace("{title}", this.displayTitle)
                .replace("{count}", String(this.badgeCount));
        },
        badgeCount() {
            return normalizeMenuBadgeCount(this.item?.badgeCount);
        },
        hasBadge() {
            return this.badgeCount > 0;
        },
        badgeTone() {
            return ["warning", "danger"].includes(this.item?.badgeTone) ? this.item.badgeTone : "default";
        },
        formattedBadgeCount() {
            return formatMenuBadgeCount(this.badgeCount);
        },
        menuNodeClass() {
            return [`is-level-${this.level}`, { "is-parent": this.hasChildren }];
        },
    },
    methods: {
        getNodeKey(item) {
            return item?.menuIndex || item?.code || item?.path || item?.title || "";
        },
    },
};
</script>
