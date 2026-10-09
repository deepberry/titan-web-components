<template>
    <div class="c-topbar__tools">
        <slot name="right" />
        <CommonExtend :profile="profile" :survey="survey" :preview="preview" :is-pad="isPad" @update="$emit('update')">
            <slot name="extend" />
        </CommonExtend>
        <Timezone :is-pad="isPad" :preview="preview" />
        <CommonOrg ref="org" :profile="profile" :organizations="organizations" @changeOrg="$emit('change-org')" />
    </div>
</template>
<script>
import CommonExtend from "./Extend.vue";
import Timezone from "./TimeZone.vue";
import CommonOrg from "./Org.vue";
export default {
    name: "CommonHeaderTools",
    components: { CommonExtend, Timezone, CommonOrg },
    props: {
        profile: { type: Object, default: () => ({}) },
        survey: { type: Object, default: () => ({}) },
        organizations: { type: Array, default: () => [] },
        preview: { type: Boolean, default: false },
        isPad: { type: Boolean, default: false },
    },
    emits: ["update", "change-org"],
    methods: {
        showOrgSwitch() {
            this.$refs.org.showOrgSwitch();
        },
    },
};
</script>
<style lang="less">
.c-topbar__tools {
    display: contents;
    > * {
        flex: none;
    }
}
</style>
