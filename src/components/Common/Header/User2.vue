<template>
    <div class="c-header-panel c-header-info">
        <div class="c-header-profile" id="c-header-profile">
            <CommonAvatar class="u-avatar" :src="profile?.avatar" />
            <template v-if="isPhone || (!isPhone && !isFounder && !isSuper)">
                <ul
                    :class="[
                        'c-header-user-menu',
                        'u-pop-content',
                        {
                            'c-header-user-menu--mobile': isPhone,
                            'c-header-user-menu--desktop-lite': !isPhone && !isFounder && !isSuper,
                        },
                    ]"
                >
                    <li>
                        <a @click="changeOrg">{{ t("commonHeader.change_organization") }}</a>
                    </li>
                    <li>
                        <a href="/uc/message">{{ t("commonHeader.message") }}</a>
                    </li>
                    <li>
                        <a href="/uc/profile">{{ t("commonHeader.profile_settings") }}</a>
                    </li>
                    <li v-if="isSuper || isFounder || hasPermission('manage_member')">
                        <a href="/uc/enterprise/member">
                            {{ t("commonHeader.enterprise_settings") }}
                        </a>
                    </li>
                    <li v-if="isSuper || isFounder">
                        <a href="/uc/enterprise/dashboard">{{ t("commonHeader.dashboard_management") }} </a>
                    </li>
                    <li v-if="isSuper || isFounder">
                        <a href="/uc/order">{{ t("commonHeader.order_center") }}</a>
                    </li>
                    <li v-if="isSuper || isFounder">
                        <a href="/uc/enterprise/setting">{{ t("commonHeader.system_settings") }} </a>
                    </li>
                    <hr />
                    <li>
                        <a @click="logout">{{ t("commonHeader.logout") }}</a>
                    </li>
                </ul>
            </template>
            <template v-else>
                <div class="c-header-userdata u-pop-content">
                    <div class="u-profile">
                        <div class="u-basic">
                            <span class="u-displayname">{{ profile?.name }}</span>
                        </div>
                        <div class="u-id">
                            <span
                                >{{ t("commonHeader.current_organization")
                                }}<b>{{ profile?.organization?.name }}</b></span
                            >
                        </div>
                    </div>

                    <el-button-group class="u-actions">
                        <a class="el-button el-button--default is-plain" href="/uc/profile">{{
                            t("commonHeader.profile_settings")
                        }}</a>
                        <a class="el-button el-button--default is-plain" href="/uc/order">{{
                            t("commonHeader.order_center")
                        }}</a>
                        <a class="el-button el-button--default is-plain is-disabled">{{
                            t("commonHeader.invoice_center")
                        }}</a>
                    </el-button-group>

                    <div class="u-other">
                        <a
                            v-if="isSuper || isFounder || hasPermission('manage_member')"
                            href="/uc/enterprise/member"
                            class="u-item"
                            ><el-icon><User /></el-icon>{{ t("commonHeader.user_management") }}
                        </a>
                        <a href="/uc/enterprise/dashboard" class="u-item"
                            ><img
                                class="u-dashboard-icon"
                                svg-inline
                                src="../../../assets/img/common/greenhouse.svg"
                                alt=""
                            />{{ t("commonHeader.dashboard_management") }}
                        </a>
                        <a v-if="isFounder || isSuper" href="/uc/system/setting" class="u-item"
                            ><el-icon><Setting /></el-icon>{{ t("commonHeader.system_settings") }}
                        </a>
                        <div class="u-logout">
                            <el-button @click="logout" plain>{{ t("commonHeader.logout") }}</el-button>
                        </div>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<script>
import { useLocale } from "../../../hooks";
const { t } = useLocale();
import User from "../../../utils/user";
import CommonAvatar from "../Widget/Avatar.vue";
export default {
    name: "CommonUser2",
    components: {
        CommonAvatar,
    },
    props: {
        profile: {
            type: Object,
            default: () => ({}),
        },
    },
    computed: {
        isSuper() {
            return this.profile?.token?.is_super;
        },
        isDev() {
            return this.profile?.token?.is_dev;
        },
        isFounder() {
            return this.profile?.id === this.profile?.organization?.user_id || this.profile.level === 99;
        },
    },
    data() {
        return {
            isPhone: window.innerWidth < 768,
        };
    },
    methods: {
        t,
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
@border-hr: #e1e4e8;
.u-delta() {
    .pa;
    background-clip: padding-box;
    background-color: #fff;
    color: @color;
    border: 1px solid rgba(27, 31, 35, 0.15);
    border-radius: 4px;
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);
    right: 0;
    list-style: none;
    margin: 8px 0 0 0;
    position: absolute;
    z-index: 820;
    top: 100%;

    &:before {
        content: "";
        position: absolute;
        right: 19px;
        top: -7px;
        width: 0;
        height: 0;
        border-left: 7px solid transparent;
        border-right: 7px solid transparent;
        border-bottom: 7px solid rgba(27, 31, 35, 0.15);
        pointer-events: none;
    }

    &:after {
        content: "";
        position: absolute;
        right: 13px;
        top: -6px;
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-bottom: 6px solid #fff;
        pointer-events: none;
    }
}

//操作面板
.c-header-panel {
    .c-header-user-menu {
        .u-delta;
        padding: 10px 0;
        width: 160px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
        font-size: 14px;

        a {
            display: block;
            line-height: 21px;
            color: #454545;
            &:hover {
                color: #fff;
            }
            outline: none;
            text-decoration: none;
            overflow: hidden;
            padding: 5px 10px 5px 16px;
            text-overflow: ellipsis;
            white-space: nowrap;

            &:hover {
                background-color: @primary;
            }
        }

        hr {
            .mt(2px);
            .mb(2px);
            border: none;
            border-top: 1px solid @border-hr;
        }
    }

    .c-header-user-menu.c-header-user-menu--desktop-lite:before {
        right: 12px;
    }

    .c-header-user-menu.c-header-user-menu--desktop-lite:after {
        right: 13px;
    }
    position: relative;
    height: 100%;
    user-select: none;
    cursor: pointer;
    box-sizing: border-box;

    .u-dashboard-icon {
        width: 14px;
        height: 14px;
        fill: #454545;
        margin-right: 5px;
    }

    .u-pop-content {
        visibility: hidden;
        opacity: 0;
        transition: visibility 0.15s, opacity 0.15s linear;
    }

    &:hover {
        .u-pop-content {
            opacity: 1;
            visibility: visible;
        }
    }

    &.on {
        .c-header-user-menu {
            display: block;
        }
    }
}

@media screen and (max-width: @phone) {
    .c-header-panel {
        &:not(&.c-header-info) {
            display: none;
        }
        .c-header-user-menu {
            min-width: 120px;
            width: auto;
            padding: 5px 0;
            border-radius: 4px;
            border: 1px solid #dcdfe6;
            box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        }

        .c-header-user-menu.c-header-user-menu--mobile:before {
            right: 12px;
        }

        .c-header-user-menu.c-header-user-menu--mobile:after {
            right: 13px;
        }

        .c-header-user-menu a {
            line-height: 36px;
            padding: 0 16px;
            font-size: 14px;
            color: #606266;
        }

        .c-header-user-menu a:hover {
            background: #ecf5ff;
            color: @primary;
        }
    }
}

.c-header-info {
    height: 100%;
    .flex;
    align-items: center;
}

.c-header-userdata {
    .u-delta;
    &:after {
        border-bottom-color: #f4f6f7;
        right: 20px;
    }

    top: calc(100% + 17px);
}

// 用户信息
.c-header-profile {
    cursor: pointer;
    position: relative;
    padding: 4px 5px 2px 6px;

    .c-header-user-menu {
        margin-top: 8px;
    }
    .u-avatar {
        vertical-align: middle;
        margin-right: 2px;
    }

    hr {
        margin: 8px 0;
        border-top: 1px solid @border-hr;
    }

    &.on {
        .c-header-user-menu {
            display: block;
        }
    }
}

.c-header-userdata {
    background-clip: padding-box;
    // background-color: #fff;
    color: #3d454d;
    border: 1px solid rgba(27, 31, 35, 0.15);
    border-radius: 4px;
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);
    right: 0;
    list-style: none;
    position: absolute;
    z-index: 820;
    top: 100%;
    width: 360px;
    margin-top: 10px;
    margin-right: -10px;

    .u-profile {
        background-color: #f4f6f7;
        padding: 12px;
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
    }

    .u-basic {
        .flex;
        align-items: center;
        gap: 3px;
    }

    .u-displayname {
        .fz(15px);
        .nobreak;
        max-width: 200px;
        color: @color;
        .bold;
        &:hover {
            color: @primary;
        }
    }

    .u-id {
        font-size: 12px;
        color: #999;
        margin-top: 6px;
        .flex(y);
        b {
            color: @color;
        }
    }

    .u-actions {
        width: 100%;
        .flex;

        .el-button {
            border-radius: 0;
            flex: 1;

            &:first-of-type {
                border-left-width: 0;
            }
            &:last-of-type {
                border-right-width: 0;
            }
        }
    }

    .u-other {
        padding: 10px 5px;
        .u-item {
            padding: 6px 10px;
            color: #454545;
            display: flex;
            border-radius: 4px;
            align-items: center;
            font-size: 14px;
            margin-bottom: 2px;

            &:hover {
                background: @primary;
                color: #fff;
            }

            i {
                .mr(5px);
            }
        }
    }

    .u-logout {
        padding: 0 10px 10px 10px;
        .mt(10px);

        .el-button {
            width: 100%;
        }
    }
}
</style>
