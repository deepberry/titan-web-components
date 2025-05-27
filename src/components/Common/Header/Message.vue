<template>
    <el-tooltip :content="t('commonHeader.message')">
        <el-badge :is-dot="!!unReadCount" class="c-header-msg">
            <img
                class="u-icon u-message"
                @click="toMessage"
                :src="require('@/assets/img/common/header/message.svg')"
                svg-inline
            />
        </el-badge>
    </el-tooltip>
</template>

<script>
import { getMessageUnRead } from "@/service/account";
import { useLocale } from "../../../hooks/index";
const { t } = useLocale();
export default {
    name: "CommonHeaderMsg",
    data() {
        return {
            unReadCount: 0,
        };
    },
    methods: {
        t,
        // 获取未读消息
        getMessageUnRead() {
            getMessageUnRead().then((res) => {
                this.unReadCount = ~~res.data.data;
            });
        },
        toMessage() {
            location.href = "/user/message";
        },
    },
    mounted() {
        this.getMessageUnRead();
    },
};
</script>
