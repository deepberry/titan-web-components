<template>
    <div v-if="noticeOpened" class="c-header-notice">
        <el-icon class="u-icon" size="16">
            <bell-filled />
        </el-icon>
        <div class="u-notice">
            <a
                :href="globalNotice.link ? globalNotice.link : 'javascript:;'"
                :class="{ 'is-link': globalNotice.link, 'is-move': isPad }"
                :target="globalNotice.link ? '_blank' : ''"
                >{{ globalNotice.val }}</a
            >
            <a
                :href="globalNotice.link ? globalNotice.link : 'javascript:;'"
                class="is-move"
                v-if="isPad"
                :class="{ 'is-link': globalNotice.link, 'is-move': isPad }"
                :target="globalNotice.link ? '_blank' : ''"
                >{{ globalNotice.val }}</a
            >
        </div>
        <el-icon class="u-close" @click="close">
            <close />
        </el-icon>
    </div>
</template>

<script>
import { mapState } from "pinia";
import { useCommonStore } from "../../../store/common";
export default {
    name: "GlobalNotice",
    data() {
        return {};
    },
    computed: {
        ...mapState(useCommonStore, ["globalNotice"]),
        isPad() {
            return document.documentElement.clientWidth <= 1134;
        },
        noticeOpened() {
            return !!this.globalNotice?.val && !this.globalNotice.hidden;
        },
    },
    mounted() {
        useCommonStore().loadGlobalAc();
    },
    methods: {
        close() {
            useCommonStore().globalNotice = {
                ...useCommonStore().globalNotice,
                hidden: true,
            };
            sessionStorage.setItem("global_notice", JSON.stringify(useCommonStore().globalNotice));
        },
    },
};
</script>

<style lang="less"></style>
