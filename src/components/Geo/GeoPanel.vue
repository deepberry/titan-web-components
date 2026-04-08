<template>
    <div class="m-geo-panel-lite">
        <div class="m-geo-input">
            <el-input v-model="localGeo" :placeholder="placeholder" :disabled="geoEditable" prefix-icon="MapLocation">
                <template #append>
                    <el-button icon="Edit" @click="geoEditable = false" />
                </template>
            </el-input>

            <el-button icon="Location" @click="getCurrentCoordinate">{{ currentBtnText }}</el-button>
        </div>

        <AMap
            ref="aMap"
            v-model="localGeo"
            :height="mapHeight"
            :amap-key="amapKey"
            :security-js-code="securityJsCode"
            :enable-search="enableSearch"
            :search-placeholder="searchPlaceholder"
            @change="onMapChange"
        />
    </div>
</template>

<script>
import AMap from "./AMap.vue";

export default {
    name: "GeoPanelLite",
    components: {
        AMap,
    },
    props: {
        modelValue: {
            type: String,
            default: "",
        },
        placeholder: {
            type: String,
            default: "请输入经纬度，格式：lng,lat",
        },
        currentBtnText: {
            type: String,
            default: "当前位置",
        },
        mapHeight: {
            type: [Number, String],
            default: 360,
        },
        amapKey: {
            type: String,
            default: "df1ee3a9c428ec279403256692257992",
        },
        securityJsCode: {
            type: String,
            default: "",
        },
        enableSearch: {
            type: Boolean,
            default: true,
        },
        searchPlaceholder: {
            type: String,
            default: "Search & Enter",
        },
    },
    emits: ["update:modelValue", "change"],
    data() {
        return {
            localGeo: "",
            geoEditable: true,
            syncing: false,
        };
    },
    watch: {
        modelValue: {
            immediate: true,
            handler(v) {
                const next = this.normalize(v);
                if (next !== this.localGeo) {
                    this.syncing = true;
                    this.localGeo = next;
                    this.$nextTick(() => {
                        this.syncing = false;
                    });
                }
            },
        },
        localGeo(v) {
            const cleaned = this.normalize(v);
            if (cleaned !== v) {
                this.localGeo = cleaned;
                return;
            }
            if (this.syncing) return;
            this.$emit("update:modelValue", cleaned);
            this.$emit("change", cleaned);
        },
    },
    methods: {
        normalize(value) {
            return String(value || "").replace(/\s/g, "");
        },
        onMapChange(geo) {
            this.localGeo = this.normalize(geo);
        },
        getCurrentCoordinate() {
            this.$refs.aMap?.getCurrentGeo?.();
        },
        addMarker(center) {
            this.$refs.aMap?.addMarker?.(center);
        },
    },
};
</script>

<style lang="less">
.m-geo-panel-lite {
    .m-geo-input {
        margin-bottom: 10px;
        display: flex;
        justify-content: space-between;
        gap: 10px;
    }
}
</style>
