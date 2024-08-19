<template>
    <el-dialog class="w-dialog" :width="400" :model-value="modelValue" @close="onClose">
        <template #header>
            <div class="m-org-switch__title">
                {{ t("commonHeader.organization.select") }}
            </div>
        </template>
        <el-select
            v-model="value"
            ref="select"
            style="width: 100%"
            filterable
            @hook:mounted="cancelReadOnly"
            @visible-change="cancelReadOnly"
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
            <el-button type="primary" @click="onConfirm">{{ t("commonHeader.messagebox.confirm") }}</el-button>
        </template>
    </el-dialog>
</template>

<script>
import { getSuperToken, getAllOrganization } from "@/service/account";
import User from "@/utils/user";
import { useLocale } from "@/hooks";
const { t } = useLocale();

export default {
    name: "OrgSwitchPop",
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
    emits: ["update:modelValue"],
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
                User.update(res.data.data).then(() => {
                    const extraNames = ["monitor-detail"];
                    const { name } = this.$route || {};
                    if (extraNames.includes(name)) {
                        this.onClose();
                        this.$router.go(-1);
                    } else {
                        location.reload();
                    }
                });
            });
        },
        loadData() {
            getAllOrganization().then((res) => {
                this.list = res.data.data;
            });
        },
        cancelReadOnly() {
            // 如果是移动端
            if (window.innerWidth < 768) {
                // this.$nextTick(() => {
                //     const { select } = this.$refs;
                //     const input = select.$el.querySelector(".el-input__inner");
                //     input.removeAttribute("readonly");
                // });
            }
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
.m-org-switch__title {
    .fz(15px);
    color: #000;
}
.m-org-switch__popper {
    .el-select-dropdown__wrap {
        max-width: 95vw;
    }
}
.m-org-switch__item {
    .flex;
    justify-content: space-between;
    .u-id {
        font-size: 12px;
        color: #999;
        padding-left: 10px;
        flex-basis: 30pxs;
    }
    .u-name {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}
</style>
