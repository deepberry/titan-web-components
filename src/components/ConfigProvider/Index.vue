<template>
    <slot />
</template>

<script setup lang="ts">
import { defineProps, PropType } from "vue";
import { useProvideLocale } from "../../hooks";

// 全局属性
const props = defineProps({
    locale: {
        type: String as PropType<string>,
    },
});
useProvideLocale(props);
</script>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
    name: "TitanConfigProvider",
});
</script>
