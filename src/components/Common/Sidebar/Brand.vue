<template>
    <span class="c-titan-brand" :class="{ 'is-opened': opened }">
        <img
            v-if="source"
            :key="source"
            :src="source"
            :alt="custom ? name : 'DeepBerry'"
            :class="{ 'is-default': !custom, 'is-full': full }"
            @error="onError"
        />
        <span v-else class="c-titan-brand__initial">{{ initial }}</span>
        <span v-if="opened && custom && !full" class="c-titan-brand__name" :title="name">{{ name }}</span>
    </span>
</template>
<script>
export default {
    name: "SidebarBrand",
    props: {
        opened: { type: Boolean, default: false },
        logo: { type: String, default: "" },
        logoFull: { type: String, default: "" },
        name: { type: String, default: "" },
    },
    data() {
        return { failed: [] };
    },
    computed: {
        custom() {
            return !!(this.logo || this.logoFull);
        },
        mark() {
            return this.failed.includes(this.logo) ? "" : this.logo;
        },
        full() {
            return this.opened && !!this.logoFull && !this.failed.includes(this.logoFull);
        },
        initial() {
            return Array.from(this.name.trim())[0] || "企";
        },
        source() {
            if (!this.custom)
                return this.opened
                    ? require("../../../assets/img/common/logo-full.svg")
                    : require("../../../assets/img/common/logo.svg");
            return this.full ? this.logoFull : this.mark;
        },
    },
    watch: {
        logo() {
            this.failed = [];
        },
        logoFull() {
            this.failed = [];
        },
    },
    methods: {
        onError() {
            if (this.custom && this.source) this.failed.push(this.source);
        },
    },
};
</script>
<style lang="less" scoped>
.c-titan-brand {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 40px;
    height: 42px;
    color: #fff;
    &.is-opened {
        width: 170px;
    }
    img {
        display: block;
        width: 40px;
        height: 40px;
        flex-shrink: 0;
        object-fit: contain;
        &.is-full {
            width: 170px;
            height: 42px;
        }
        &.is-default {
            filter: brightness(0) invert(1);
        }
    }
    &.is-opened img.is-default {
        width: 170px;
        height: 42px;
    }
    &__initial {
        display: grid;
        place-items: center;
        width: 40px;
        height: 40px;
        flex-shrink: 0;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.15);
        font-size: 22px;
        font-weight: 600;
    }
    &__name {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 16px;
        font-weight: 600;
    }
}
</style>
