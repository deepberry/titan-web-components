<template>
    <div class="c-header-panel c-header-info">
        <el-dropdown
            trigger="click"
            placement="bottom-end"
            :popper-class="compact ? 'c-header-user-dropdown is-compact' : 'c-header-user-dropdown'"
            @command="handleCommand"
        >
            <button
                class="c-topbar__user-button"
                :class="{ 'is-avatar-only': compact }"
                type="button"
                :aria-label="userName || t('commonHeader.profile_settings')"
            >
                <CommonAvatar class="c-topbar__avatar" :src="profile?.avatar" />
                <span v-if="userName && !compact" class="c-topbar__user-name" :title="userName">{{ userName }}</span>
                <el-icon v-if="!compact" class="c-topbar__user-arrow"><ArrowDown /></el-icon>
            </button>

            <template #dropdown>
                <div>
                    <div v-if="compact" class="c-topbar c-header-user-dropdown__tools"><slot name="tools" /></div>
                    <el-dropdown-menu class="c-header-user-dropdown__menu">
                        <slot />
                        <el-dropdown-item command="profile">
                            <el-icon><User /></el-icon>
                            <span>{{ t("commonHeader.profile_settings") }}</span>
                        </el-dropdown-item>

                        <el-dropdown-item v-if="isSuper || isFounder" command="order">
                            <el-icon><ShoppingBag /></el-icon>
                            <span>{{ t("commonHeader.order_center") }}</span>
                        </el-dropdown-item>

                        <el-dropdown-item command="work-order" divided>
                            <el-icon><Tickets /></el-icon>
                            <span>{{ t("commonHeader.extend.work_order") }}</span>
                        </el-dropdown-item>
                        <el-dropdown-item command="docs">
                            <el-icon><Reading /></el-icon>
                            <span>{{ t("commonHeader.doc") }}</span>
                        </el-dropdown-item>
                        <el-dropdown-item command="support">
                            <el-icon><Phone /></el-icon>
                            <span>{{ t("commonHeader.extend.other_support") }}</span>
                        </el-dropdown-item>

                        <el-dropdown-item v-if="showSurvey" command="survey">
                            <el-icon><EditPen /></el-icon>
                            <el-badge is-dot class="c-header-survey-badge">
                                <span>{{ t("commonHeader.survey.title") }}</span>
                            </el-badge>
                        </el-dropdown-item>

                        <el-dropdown-item v-if="isPhone && !compact" command="organization" divided>
                            <el-icon><OfficeBuilding /></el-icon>
                            <span>{{ t("commonHeader.change_organization") }}</span>
                        </el-dropdown-item>
                        <el-dropdown-item v-if="isPhone && !compact" command="messages">
                            <el-icon><Bell /></el-icon>
                            <span>{{ t("commonHeader.message") }}</span>
                        </el-dropdown-item>

                        <el-dropdown-item command="logout" divided class="is-logout">
                            <el-icon><SwitchButton /></el-icon>
                            <span>{{ t("commonHeader.logout") }}</span>
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </div>
            </template>
        </el-dropdown>

        <el-dialog
            append-to-body
            class="c-header-support-dialog"
            v-model="quickVisible"
            :title="t('commonHeader.extend.other_support')"
            :width="dialogWidth"
        >
            <QuickSupport class="c-header-support__pop" />
        </el-dialog>
    </div>
</template>

<script>
import { useLocale } from "../../../hooks";
import User from "../../../utils/user";
import CommonAvatar from "../Widget/Avatar.vue";
import QuickSupport from "./QuickSupport.vue";

const { t } = useLocale();

export default {
    name: "CommonUser2",
    components: {
        CommonAvatar,
        QuickSupport,
    },
    props: {
        survey: { type: Object, default: () => ({}) },
        compact: { type: Boolean, default: false },
        profile: {
            type: Object,
            default: () => ({}),
        },
    },
    emits: ["changeOrg", "survey"],
    data() {
        return {
            isPhone: window.innerWidth < 768,
            quickVisible: false,
        };
    },
    computed: {
        showSurvey() {
            return !!this.survey.id && !this.survey.status;
        },
        isSuper() {
            return this.profile?.token?.is_super;
        },
        isDev() {
            return this.profile?.token?.is_dev;
        },
        isFounder() {
            return this.profile?.id === this.profile?.organization?.user_id || this.profile.level === 99;
        },
        userName() {
            const candidates = [
                this.profile?.name,
                this.profile?.nickname,
                this.profile?.display_name,
                this.profile?.displayName,
                this.profile?.username,
                this.profile?.phone_number,
                this.profile?.phone,
                this.profile?.user?.name,
                this.profile?.user?.username,
            ];

            const value = candidates.find((item) => item !== undefined && item !== null && String(item).trim());
            return value === undefined ? "" : String(value).trim();
        },
        canManageMembers() {
            return this.isSuper || this.isFounder || this.hasPermission("manage_member");
        },
        dialogWidth() {
            return this.isPhone ? "90%" : 680;
        },
    },
    methods: {
        t,
        handleCommand(command) {
            if (command === "survey") {
                this.$emit("survey");
                return;
            }
            const routes = {
                profile: "/uc/profile",
                messages: "/uc/message",
                members: "/uc/enterprise/member",
                dashboard: "/uc/enterprise/dashboard",
                order: "/uc/order",
                settings: "/uc/system/setting",
                "work-order": "/uc/feedback",
                docs: "/uc/help",
            };

            if (routes[command]) {
                window.location.href = routes[command];
                return;
            }

            if (command === "support") {
                this.quickVisible = true;
                return;
            }

            if (command === "organization") {
                this.changeOrg();
                return;
            }

            if (command === "logout") {
                this.logout();
            }
        },
        logout() {
            this.$confirm(t("commonHeader.confirm_logout"), t("commonHeader.logout"), {
                confirmButtonText: t("commonHeader.messagebox.confirm"),
                cancelButtonText: t("commonHeader.messagebox.cancel"),
                type: "warning",
            })
                .then(() => {
                    User.destroy();
                    User.toLogin();
                })
                .catch(() => {});
        },
        changeOrg() {
            if (this.isSuper || this.isDev) {
                this.$emit("changeOrg", true);
                return;
            }
            window.open("/uc/organization", "_self");
        },
        hasPermission(permission) {
            return User.hasPermission(permission);
        },
    },
};
</script>

<style lang="less">
.c-topbar__user-button.is-avatar-only {
    width: 40px;
    padding: 0;
    justify-content: center;
    border: 0;
    background: transparent;
    .c-topbar__avatar {
        width: 32px;
        height: 32px;
    }
}
.c-header-user-dropdown {
    &.is-compact {
        width: 222px;
        max-width: calc(100vw - 32px);

        .el-scrollbar__wrap {
            max-height: min(640px, calc(100dvh - 88px));
        }
    }

    &__tools {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px;
        padding: 10px 12px 12px;
        border-bottom: 1px solid #e8edf4;
        background: #fff;

        .c-topbar__extensions {
            display: contents;
        }

        .c-topbar__message-button {
            width: 42px;
            height: 42px;
            box-sizing: border-box;
            border-color: #dce4ef;
            background: #f3f6fa;

            &:hover,
            &:focus-visible {
                border-color: rgba(21, 81, 143, 0.35);
                background: #eaf1f8;
                transform: none;
            }
        }

        &.c-topbar .c-header-preference {
            width: 42px;
            height: 42px;
            overflow: hidden;
            box-sizing: border-box;
            margin-left: 0;
            border-color: #dce4ef;
            background: #f3f6fa;
            color: #15518f;

            .c-header-lang {
                width: 40px;
                padding: 0;
                justify-content: center;
                box-shadow: none;
            }

            .c-header-timezone {
                display: none;
            }
        }

        .c-topbar__organization {
            min-width: 0;
            width: 100%;

            > .el-dropdown {
                min-width: 0;
                width: 100%;
            }
        }

        &.c-topbar .c-topbar__org-button {
            min-width: 0;
            width: 100%;
            box-sizing: border-box;
            justify-content: flex-start;
            overflow: hidden;
            border-color: #dce4ef;
            background: #f3f6fa;

            &:hover,
            &:focus-visible {
                border-color: rgba(21, 81, 143, 0.35);
                background: #eaf1f8;
            }

            .c-topbar__org-icon {
                width: 18px;
                height: 18px;
                color: var(--titan-primary, #15518f);
                opacity: 1;
                font-size: 18px;
            }

            .c-topbar__org-arrow {
                flex: none;
                color: #7890ad;
                opacity: 1;
            }

            .c-topbar__org-text {
                min-width: 0;
                max-width: 100%;
                flex: 1;
                color: #5a5858;
                text-align: left;
            }
        }
    }
}

.c-header-panel {
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    user-select: none;
}

.el-dropdown__popper.c-header-user-dropdown.el-popper {
    min-width: 164px;
    overflow: visible;
    padding: 6px;
    border: 1px solid #dce4ef;
    border-radius: 10px;
    box-shadow: 0 14px 34px rgba(7, 31, 73, 0.16);
}

.el-dropdown__popper.c-header-user-dropdown.is-compact.el-popper {
    padding: 0 6px 6px;
}

.c-header-user-dropdown .el-popper__arrow::before {
    border-color: #dce4ef;
    background: #fff;
}

.c-header-user-dropdown .el-dropdown-menu {
    padding: 0;
}

.c-header-user-dropdown {
    .c-header-survey-badge {
        .el-badge__content.is-dot {
            top: 4px;
            right: -4px;
        }
    }
}

.c-header-user-dropdown .el-dropdown-menu__item {
    min-height: 42px;
    gap: 9px;
    padding: 0 12px;
    border-radius: 7px;
    color: #5a5858;
    font-size: 14px;
    line-height: 1.35;
}

.c-header-user-dropdown .el-dropdown-menu__item .el-icon,
.c-header-user-dropdown .el-dropdown-menu__item .u-item-icon {
    width: 18px;
    height: 18px;
    flex: none;
    margin-right: 0;
    color: #7890ad;
    fill: currentColor;
    font-size: 16px;
}

.c-header-user-dropdown .el-dropdown-menu__item .u-item-icon * {
    fill: inherit;
}

.c-header-user-dropdown .el-dropdown-menu__item:not(.is-disabled):focus,
.c-header-user-dropdown .el-dropdown-menu__item:not(.is-disabled):hover {
    background: #f3f6fa;
    color: var(--titan-primary, #15518f);
}

.c-header-user-dropdown .el-dropdown-menu__item:not(.is-disabled):focus .el-icon,
.c-header-user-dropdown .el-dropdown-menu__item:not(.is-disabled):focus .u-item-icon,
.c-header-user-dropdown .el-dropdown-menu__item:not(.is-disabled):hover .el-icon,
.c-header-user-dropdown .el-dropdown-menu__item:not(.is-disabled):hover .u-item-icon {
    color: var(--titan-accent, #ea6300);
}

.c-header-user-dropdown .el-dropdown-menu__item--divided {
    margin-top: 6px;
    border-top-color: #e8edf4;
}

.c-header-user-dropdown .el-dropdown-menu__item--divided::before {
    height: 6px;
    margin: 0 -12px;
    background: #fff;
}

.c-header-user-dropdown .el-dropdown-menu__item.is-logout:hover,
.c-header-user-dropdown .el-dropdown-menu__item.is-logout:focus {
    background: #fff4ed;
    color: var(--titan-accent, #ea6300);
}
</style>
