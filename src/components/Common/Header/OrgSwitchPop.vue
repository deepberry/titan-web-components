<template>
    <el-dialog class="m-org-switch" :width="460" :model-value="modelValue" append-to-body align-center @close="onClose">
        <template #header>
            <div class="m-org-switch__heading">
                <span class="m-org-switch__icon"
                    ><el-icon><OfficeBuilding /></el-icon
                ></span>
                <div>
                    <h2 class="m-org-switch__title">{{ t("commonHeader.change_organization") }}</h2>
                    <p class="m-org-switch__description">{{ t("commonHeader.organization.select") }}</p>
                </div>
            </div>
        </template>
        <el-select
            v-model="value"
            class="m-org-switch__select"
            style="width: 100%"
            filterable
            :placeholder="t('commonHeader.organization.search')"
            :aria-label="t('commonHeader.organization.select')"
            popper-class="m-org-switch__popper"
        >
            <el-option
                v-for="item in list"
                :key="item.id"
                :value="item.id"
                :label="`${item.name}(ID:${item.id})`"
                class="m-org-switch__item"
            >
                <span class="u-name">{{ item.name }}</span>
                <span class="u-id">(ID:{{ item.id }})</span>
            </el-option>
        </el-select>
        <template #footer>
            <el-button @click="onClose">{{ t("commonHeader.messagebox.cancel") }}</el-button>
            <el-button type="primary" :disabled="value === ''" @click="onConfirm">{{
                t("commonHeader.messagebox.confirm")
            }}</el-button>
        </template>
    </el-dialog>
</template>

<script>
import { getSuperToken, getAllOrganization } from "../../../service/account";
import User from "../../../utils/user";
import { OfficeBuilding } from "@element-plus/icons-vue";
import { useLocale } from "../../../hooks";
const { t } = useLocale();

export default {
    name: "OrgSwitchPop",
    components: { OfficeBuilding },
    props: {
        modelValue: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            list: [],
            value: "",
        };
    },
    emits: ["update:modelValue", "changeOrg"],
    watch: {
        modelValue: {
            handler(val) {
                if (val) {
                    this.loadData();
                }
            },
        },
    },
    methods: {
        t,
        onClose() {
            this.$emit("update:modelValue", false);
        },
        onConfirm() {
            getSuperToken({ organization_id: this.value }).then((res) => {
                sessionStorage.setItem("old_org_id", this.value);
                this.$emit("changeOrg");
                User.update(res.data.data).then(() => {
                    location.reload();
                });
            });
        },
        loadData() {
            getAllOrganization().then((res) => {
                this.list = res.data.data;
            });
        },
    },
    mounted() {
        // 切换完成后 如果在nodeIndex界面会先在nodeIndex中判断旧组织ID， 再到此处全局清除旧组织ID
        const oldOrgId = sessionStorage.getItem("old_org_id");
        if (oldOrgId) {
            sessionStorage.removeItem("old_org_id");
        }
    },
};
</script>

<style lang="less">
.el-dialog.m-org-switch {
    --el-color-primary: var(--titan-primary, #15518f);
    max-width: calc(100vw - 32px);
    padding: 0;
    overflow: hidden;
    border: 1px solid #dce4ef;
    border-radius: 20px;
    box-shadow: 0 24px 72px rgba(7, 31, 73, 0.24);

    .el-dialog__header {
        margin: 0;
        padding: 28px 54px 24px 28px;
        border-bottom: 1px solid #e6ebf2;
        background: linear-gradient(135deg, #f4f7fc, #fff);
    }

    .el-dialog__headerbtn {
        top: 18px;
        right: 14px;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;

        &:hover {
            background: #eaf0f8;
        }
    }

    .el-dialog__body {
        padding: 28px;
    }
    .el-dialog__footer {
        padding: 18px 28px;
        border-top: 1px solid #e6ebf2;
        background: #fbfcfe;
    }
    .el-button {
        min-width: 88px;
        height: 38px;
        border-radius: 10px;
        font-weight: 600;
    }
    .el-button--primary:not(.is-disabled) {
        border-color: var(--titan-primary, #15518f);
        background: var(--titan-primary, #15518f);
        &:hover {
            background: var(--titan-navy, #0a2e67);
            border-color: var(--titan-navy, #0a2e67);
        }
    }
}
.m-org-switch__heading {
    display: flex;
    align-items: center;
    gap: 14px;
}
.m-org-switch__icon {
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    flex: none;
    border-radius: 12px;
    background: var(--titan-primary-dark, #071f49);
    color: #fff;
    font-size: 22px;
    box-shadow: inset 0 -3px 0 var(--titan-accent, #ea6300);
}
.m-org-switch__title {
    margin: 0;
    color: var(--titan-primary-dark, #071f49);
    font-size: 19px;
    font-weight: 700;
    line-height: 1.5;
}
.m-org-switch__description {
    margin: 4px 0 0;
    color: #7c899b;
    font-size: 13px;
    line-height: 1.6;
}
.m-org-switch__select .el-select__wrapper {
    min-height: 44px;
    padding: 10px 14px;
    border-radius: 10px;
    box-shadow: 0 0 0 1px #d6dfeb inset;
    &.is-focused {
        box-shadow: 0 0 0 1px var(--titan-primary, #15518f) inset;
    }
}
.m-org-switch__popper {
    border-radius: 12px;
    box-shadow: 0 12px 32px rgba(7, 31, 73, 0.14);
    .el-select-dropdown__wrap {
        max-width: 95vw;
    }
    .el-select-dropdown__item.is-selected {
        color: var(--titan-primary, #15518f);
        background: #edf3fa;
        .u-id {
            color: var(--titan-accent, #ea6300);
        }
    }
}
.m-org-switch__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .u-id {
        font-size: 12px;
        color: #999;
        padding-left: 10px;
        flex-shrink: 0;
    }
    .u-name {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}
</style>
