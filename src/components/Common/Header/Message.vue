<template>
    <el-tooltip :content="t('commonHeader.message')" placement="bottom">
        <button
            class="c-topbar__message-button"
            type="button"
            :aria-label="t('commonHeader.message')"
            @click="toMessage"
        >
            <span class="c-topbar__message-icon">
                <img
                    class="c-topbar__action-icon"
                    src="../../../assets/img/common/header/message.svg"
                    alt=""
                    aria-hidden="true"
                />
                <span v-if="unReadCount" class="c-topbar__message-dot" />
            </span>
        </button>
    </el-tooltip>
</template>
<script>
import { getMessageUnRead } from "../../../service/account";
import { useLocale } from "../../../hooks/index";
const { t } = useLocale();
export default {
    name: "CommonHeaderMsg",
    props: {
        preview: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            unReadCount: 0,
        };
    },
    methods: {
        t,
        // 获取未读消息
        getMessageUnRead() {
            getMessageUnRead(this.preview ? { mute: true } : undefined)
                .then((res) => {
                    this.unReadCount = ~~res.data.data;
                })
                .catch(() => {
                    this.unReadCount = 0;
                });
        },
        toMessage() {
            location.href = "/uc/message";
        },
    },
    mounted() {
        this.getMessageUnRead();
    },
};
</script>
