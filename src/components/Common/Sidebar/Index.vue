<template>
    <div
        class="c-nav"
        :class="{
            'c-nav--opened': isCollapse,
            'c-nav--closed': !isCollapse,
        }"
        ref="nav"
    >
        <!-- <template v-if="homes?.length">
            <el-popover
                placement="right-end"
                class="c-nav-logo_pop"
                popper-class="c-nav-logo_popcontent"
                trigger="click"
                effect="dark"
            >
                <template #reference>
                    <div class="c-nav-logo">
                        <img
                            v-if="!isCollapse"
                            class="u-simple"
                            :class="'u-logo'"
                            :src="require(`../../../assets/img/common/logo.svg`)"
                            fill="#fff"
                        />
                        <img
                            class="u-full"
                            :class="'u-logo'"
                            :src="require(`../../../assets/img/common/logo-full.svg`)"
                            fill="#fff"
                            v-else
                        />
                    </div>
                </template>
                <div class="c-nav-home">
                    <a class="c-nav-home__item" v-for="(item, i) in homes" :key="i" :href="item.href">
                        <span class="u-name">{{ item.name }}</span>
                    </a>
                </div>
            </el-popover>
        </template> -->
        <a class="c-nav-logo" href="/atlas">
            <img
                v-if="!isCollapse"
                class="u-simple"
                :class="'u-logo'"
                :src="require(`../../../assets/img/common/logo.svg`)"
                fill="#fff"
            />
            <img
                class="u-full"
                :class="'u-logo'"
                :src="require(`../../../assets/img/common/logo-full.svg`)"
                fill="#fff"
                v-else
            />
        </a>
        <div class="c-nav-menu">
            <ul class="c-nav-menu__list">
                <li
                    v-for="(item, i) in menus"
                    :key="menuKey(item, i)"
                    class="c-nav-menu__item"
                    :class="{
                        active: isActive(item),
                        'has-children': hasChildren(item),
                        'is-expand': isExpanded(item, i),
                    }"
                >
                    <el-popover
                        placement="right-start"
                        trigger="hover"
                        :width="200"
                        :show-after="80"
                        :hide-after="80"
                        :disabled="isCollapse || !hasChildren(item)"
                        popper-class="c-nav-menu__sub-popper"
                    >
                        <template #reference>
                            <div class="c-nav-menu__title" @click.stop="handleMenuItemClick(item, i)">
                                <template v-if="item.icon">
                                    <img
                                        class="u-icon"
                                        v-if="item.icon.endsWith('.svg')"
                                        :src="iconPath(item.icon, item.icon_local)"
                                        v-svg-inline
                                    />
                                    <img class="u-icon" v-else :src="iconPath(item.icon, item.icon_local)" />
                                </template>
                                <img
                                    class="u-icon"
                                    v-else
                                    :src="require(`../../../assets/img/default_icon.svg`)"
                                    v-svg-inline
                                />
                                <span class="u-name">{{ getName(item) }}</span>
                                <el-icon v-if="hasChildren(item)" class="u-expand">
                                    <ArrowUp v-if="isExpanded(item, i)" />
                                    <ArrowDown v-else />
                                </el-icon>
                            </div>
                        </template>
                        <ul v-if="hasChildren(item)" class="c-nav-menu__flyout">
                            <li
                                v-for="(child, childIndex) in item.children"
                                :key="menuKey(child, childIndex)"
                                class="c-nav-menu__flyout-item"
                                :class="{ active: isSubActive(child) }"
                                @click.stop="handleSubMenuItemClick(child)"
                            >
                                <template v-if="child.icon">
                                    <img
                                        class="u-icon"
                                        v-if="child.icon.endsWith('.svg')"
                                        :src="iconPath(child.icon, child.icon_local)"
                                        v-svg-inline
                                    />
                                    <img class="u-icon" v-else :src="iconPath(child.icon, child.icon_local)" />
                                </template>
                                <span class="u-name">{{ getName(child) }}</span>
                            </li>
                        </ul>
                    </el-popover>
                    <ul
                        v-if="hasChildren(item) && isCollapse"
                        class="c-nav-menu__sub"
                        :class="{ 'is-expand': isExpanded(item, i) }"
                    >
                        <el-tooltip
                            v-for="(child, childIndex) in item.children"
                            :key="menuKey(child, childIndex)"
                            effect="dark"
                            :content="getName(child)"
                            placement="right"
                            :hide-after="0"
                            :disabled="isCollapse"
                        >
                            <li
                                class="c-nav-menu__subitem"
                                :class="{ active: isSubActive(child) }"
                                @click.stop="handleSubMenuItemClick(child)"
                            >
                                <template v-if="child.icon">
                                    <img
                                        class="u-icon"
                                        v-if="child.icon.endsWith('.svg')"
                                        :src="iconPath(child.icon, child.icon_local)"
                                        v-svg-inline
                                    />
                                    <img class="u-icon" v-else :src="iconPath(child.icon, child.icon_local)" />
                                </template>
                                <span class="u-name">{{ getName(child) }}</span>
                            </li>
                        </el-tooltip>
                    </ul>
                </li>
            </ul>
        </div>

        <div class="c-nav-mask" @click="close" v-if="isPad"></div>
    </div>
</template>

<script>
// import { markRaw } from "vue";
import { mapState } from "pinia";
import { useCommonStore } from "../../../store/common";
import User from "../../../utils/user";
// import menus from "@deepberry/common/data/app_nav.json";
import { getCdnLink } from "@deepberry/common/js/utils";
import { getMenus } from "../../../service/account";
import { appendLocalSidebarChildren } from "../../../constants/Sidebar";
import { ArrowDown, ArrowUp } from "@element-plus/icons-vue";

export default {
    name: "CommonSidebar",
    components: {
        ArrowDown,
        ArrowUp,
    },
    props: {
        // homes: {
        //     type: Array,
        //     default: () => [],
        // },
        // menuList: {
        //     // erp menus 传入进来 已经统一
        //     type: Array,
        //     default: () => [],
        // },
    },
    data() {
        return {
            menus: [],
        };
    },
    computed: {
        ...mapState(useCommonStore, ["opened", "sideExpanded"]),
        activeMenu() {
            // 路由中存在则用路由的，不存在则用path中的
            const routeActiveMenu = this.$route?.meta?.activeMenu ? `/${this.$route.meta.activeMenu}` : "";
            return routeActiveMenu || location.pathname || "";
        },
        isCollapse() {
            return this.opened;
        },
        isEnglish() {
            return User.getLocale() === "en-us";
        },
        appIndex() {
            return this.menus?.findIndex((item) => this.isActive(item));
        },
        isPad() {
            return document.documentElement.clientWidth <= 1134;
        },
        // isErp() {
        //     return this.menuList && this.menuList.length > 0;
        // },
        path() {
            return location.pathname;
        },
    },
    watch: {
        appIndex: {
            immediate: true,
            handler(val) {
                if (val < 0) return;

                const item = this.menus[val];
                if (this.hasChildren(item)) {
                    this.expandMenu(item, val);
                }
            },
        },
        path: {
            immediate: true,
            handler(path) {
                if (path.startsWith("/atlas")) {
                    location.href = "/overview";
                }
            },
        },
    },
    mounted() {
        // if (this.isErp) {
        //     // erp menus 传入进来
        //     this.menus = this.menuList;
        // } else {
        //     this.loadMenus();
        // }
        this.loadMenus();
        document.addEventListener("click", this.closeEvent);
    },
    unmounted() {
        document.removeEventListener("click", this.closeEvent);
    },
    methods: {
        loadMenus() {
            getMenus().then((res) => {
                this.menus = appendLocalSidebarChildren(res.data.data || []);
            });
        },
        iconPath(icon, isLocal = false) {
            if (isLocal) {
                return icon;
            }
            if (icon.startsWith("http")) {
                return icon;
            }
            if (icon.startsWith("/")) {
                return getCdnLink(icon.split("/").slice(1).join("/"));
            }
            return getCdnLink(icon);
        },
        isActive(item) {
            let parentName = "/" + item.link?.split("/").filter(Boolean)?.[0];
            // if (this.isErp) {
            //     parentName = item.link;
            // }
            return this.activeMenu?.startsWith(parentName);
        },
        isSubActive(item) {
            if (!item?.link) return false;

            const link = item.link.startsWith("/") ? item.link : `/${item.link}`;
            return this.activeMenu === link || this.activeMenu?.startsWith(`${link}/`);
        },
        hasChildren(item) {
            return Array.isArray(item?.children) && item.children.length > 0;
        },
        menuKey(item, index) {
            return item?.id ?? item?.name ?? item?.link ?? index;
        },
        isExpanded(item, index) {
            return this.sideExpanded.includes(this.menuKey(item, index));
        },
        expandMenu(item, index) {
            const key = this.menuKey(item, index);
            if (!this.sideExpanded.includes(key)) {
                useCommonStore().sideExpanded = [...this.sideExpanded, key];
            }
        },
        toggleSubMenu(item, index) {
            const key = this.menuKey(item, index);
            const expanded = this.sideExpanded.includes(key);

            useCommonStore().sideExpanded = expanded
                ? this.sideExpanded.filter((menuKey) => menuKey !== key)
                : [...this.sideExpanded, key];
        },
        handleMenuItemClick(item, index) {
            if (this.hasChildren(item)) {
                this.toggleSubMenu(item, index);
                return;
            }

            this.navigateToMenu(item);
        },
        handleSubMenuItemClick(item) {
            this.navigateToMenu(item);

            if ((window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) < 768) {
                this.close();
            }
        },
        navigateToMenu(item) {
            if (item.is_blank) {
                window.open(item.link, "_blank");
            } else {
                location.href = item.link;
            }
        },
        closeEvent(e) {
            if ((window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) > 768) return;
            if (!this.$refs.nav.contains(e.target)) {
                useCommonStore().opened = false;
                localStorage.setItem("titan_sidebar_collapse", useCommonStore().opened ? 1 : 0);
            }
        },
        close() {
            useCommonStore().opened = false;
            localStorage.setItem("titan_sidebar_collapse", useCommonStore().opened ? 1 : 0);
        },
        getName(item) {
            return this.isEnglish ? item["en_name"] : item["zh_name"];
        },
    },
};
</script>

<style lang="less">
@import "../../../assets/css/Common/Sidebar/index.less";
</style>
