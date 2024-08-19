<template>
    <el-avatar class="u-avatar" :size="size" :src="srcUrl"></el-avatar>
</template>

<script>
import { getCdnLink } from "@deepberry/common/js/utils";
export default {
    name: "Avatar",
    props: {
        src: {
            type: String,
            default: "",
        },
        size: {
            type: Number,
            default: 25,
        },
    },
    computed: {
        srcUrl() {
            let src = "";
            let avatar = this.src || "img/common/logo/blue.svg";
            if (avatar.startsWith("http") || avatar.startsWith("//")) {
                src = avatar;
            } else {
                src = getCdnLink(avatar);
            }
            return src;
        },
    },
};
</script>

<style lang="less"></style>
