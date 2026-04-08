<template>
    <div class="w-a-map" :style="{ height: `${height}px` }">
        <div class="m-search-box" v-if="enableSearch">
            <el-select
                v-model="keywords"
                filterable
                remote
                default-first-option
                :placeholder="searchPlaceholder"
                :remote-method="onSearch"
                :loading="loading"
                class="u-search"
                @change="onSelect"
            >
                <template #prefix>
                    <el-icon><Search /></el-icon>
                </template>
                <el-option
                    v-for="item in pois"
                    :key="item.id || item.location"
                    :label="item.label"
                    :value="item.location"
                >
                    <div class="c-select__option-wrapper">
                        <div class="u-name">{{ item.name }}</div>
                        <div class="u-extra">{{ item.label }}</div>
                    </div>
                </el-option>
            </el-select>
        </div>

        <div :id="mapId" class="u-map-container"></div>
    </div>
</template>

<script>
import { debounce } from "lodash";
import { getAMapPlace } from "@/service/amap";

let loadPromise = null;

function loadAMapSdk(amapKey, securityJsCode = "") {
    if (typeof window === "undefined") return Promise.reject(new Error("window is not available"));
    if (window.AMap) return Promise.resolve(window.AMap);
    if (loadPromise) return loadPromise;

    if (securityJsCode) {
        window._AMapSecurityConfig = {
            securityJsCode,
        };
    }

    loadPromise = new Promise((resolve, reject) => {
        const existScript = document.getElementById("deepberry-amap-jsapi");
        if (existScript) {
            existScript.addEventListener("load", () => resolve(window.AMap));
            existScript.addEventListener("error", reject);
            return;
        }

        const script = document.createElement("script");
        script.id = "deepberry-amap-jsapi";
        script.src = `https://webapi.amap.com/maps?v=2.0&key=${amapKey}&plugin=AMap.Scale,AMap.ToolBar,AMap.Geocoder,AMap.Geolocation`;
        script.async = true;
        script.onload = () => {
            if (window.AMap) {
                resolve(window.AMap);
            } else {
                reject(new Error("AMap load failed"));
            }
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });

    return loadPromise;
}

export default {
    name: "AMap",
    props: {
        modelValue: {
            type: String,
            default: "",
        },
        height: {
            type: [Number, String],
            default: 360,
        },
        id: {
            type: [String, Number],
            default: "",
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
        zoom: {
            type: Number,
            default: 15.5,
        },
    },
    emits: ["update:modelValue", "change", "ready"],
    data() {
        return {
            map: null,
            marker: null,
            geolocation: null,
            AMapRef: null,
            loading: false,
            keywords: "",
            pois: [],
            mapReady: false,
        };
    },
    computed: {
        mapId() {
            return this.id ? `db_amap_${this.id}` : "db_amap_default";
        },
        parsedCenter() {
            const parts = String(this.modelValue || "").split(",");
            if (parts.length !== 2) return [116.397428, 39.90923];
            const lng = Number(parts[0]);
            const lat = Number(parts[1]);
            if (!Number.isFinite(lng) || !Number.isFinite(lat)) return [116.397428, 39.90923];
            return [Number(lng.toFixed(6)), Number(lat.toFixed(6))];
        },
    },
    watch: {
        modelValue: {
            immediate: true,
            handler() {
                if (!this.mapReady) return;
                this.syncMarkerFromModel();
            },
        },
    },
    mounted() {
        this.initMap();
    },
    beforeUnmount() {
        if (this.map && this.map.destroy) {
            this.map.destroy();
        }
        this.map = null;
        this.marker = null;
        this.geolocation = null;
    },
    methods: {
        async initMap() {
            try {
                const AMap = await loadAMapSdk(this.amapKey, this.securityJsCode);
                this.AMapRef = AMap;

                this.map = new AMap.Map(this.mapId, {
                    resizeEnable: true,
                    zoom: this.zoom,
                    center: this.parsedCenter,
                    viewMode: "2D",
                });

                this.map.addControl(new AMap.Scale());
                this.map.addControl(new AMap.ToolBar());
                this.initGeolocationPlugin(AMap);

                this.map.on("click", (e) => {
                    const lng = e?.lnglat?.getLng?.();
                    const lat = e?.lnglat?.getLat?.();
                    if (!Number.isFinite(lng) || !Number.isFinite(lat)) return;
                    this.setGeo([lng, lat]);
                });

                this.mapReady = true;
                this.syncMarkerFromModel();
                this.$emit("ready", this.map);
            } catch (e) {
                console.error("[AMap] init error", e);
            }
        },
        initGeolocationPlugin(AMap) {
            AMap.plugin("AMap.Geolocation", () => {
                this.geolocation = new AMap.Geolocation({
                    enableHighAccuracy: true,
                    timeout: 10000,
                    showButton: false,
                    panToLocation: true,
                    zoomToAccuracy: true,
                });
                this.map.addControl(this.geolocation);
            });
        },
        formatGeo([lng, lat]) {
            return `${Number(lng).toFixed(6)},${Number(lat).toFixed(6)}`;
        },
        parseGeo(geo) {
            const parts = String(geo || "").split(",");
            if (parts.length !== 2) return null;
            const lng = Number(parts[0]);
            const lat = Number(parts[1]);
            if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
            return [lng, lat];
        },
        syncMarkerFromModel() {
            const center = this.parseGeo(this.modelValue);
            if (!center) return;
            this.setMarker(center, false);
            this.map.setCenter(center);
        },
        setMarker(center, autoFit = true) {
            if (!this.AMapRef || !this.map) return;
            if (!this.marker) {
                this.marker = new this.AMapRef.Marker({
                    position: center,
                });
                this.map.add(this.marker);
            } else {
                this.marker.setPosition(center);
            }
            if (autoFit) {
                this.map.setCenter(center);
            }
        },
        setGeo(center, autoFit = true) {
            this.setMarker(center, autoFit);
            const geo = this.formatGeo(center);
            this.$emit("update:modelValue", geo);
            this.$emit("change", geo);
        },
        addMarker(center) {
            const parsed = Array.isArray(center) ? center : this.parseGeo(center);
            if (!parsed) return;
            this.setGeo(parsed);
        },
        getCurrentGeo() {
            if (!this.geolocation) return;
            this.geolocation.getCurrentPosition((status, result) => {
                if (status !== "complete") return;
                const lng = result?.position?.getLng?.();
                const lat = result?.position?.getLat?.();
                if (!Number.isFinite(lng) || !Number.isFinite(lat)) return;
                this.setGeo([lng, lat]);
            });
        },
        onSelect(geo) {
            const parsed = this.parseGeo(geo);
            if (!parsed) return;
            this.setGeo(parsed);
            this.keywords = "";
        },
        onSearch: debounce(function (keywords) {
            if (!keywords) {
                this.pois = [];
                return;
            }
            this.loading = true;
            getAMapPlace({ keywords })
                .then((res) => {
                    const pois = res?.data?.data?.pois || [];
                    this.pois = pois.map((item) => ({
                        ...item,
                        label: `${item.pname || ""}${item.cityname || ""}${item.adname || ""}${item.address || ""}`,
                    }));
                })
                .finally(() => {
                    this.loading = false;
                });
        }, 500),
    },
};
</script>

<style lang="less">
.w-a-map {
    position: relative;
    width: 100%;
    .m-search-box {
        position: absolute;
        z-index: 10;
        top: 10px;
        left: 10px;
        width: 320px;
        .u-search {
            width: 100%;
        }
    }
    .u-map-container {
        width: 100%;
        height: 100%;
        min-height: 320px;
        border-radius: 6px;
        overflow: hidden;
        border: 1px solid #ebeef5;
    }
}
.c-select__option-wrapper {
    .flex;
    align-items: center;
    gap: 10px;
    line-height: 1.5;
    .u-name {
        font-weight: 600;
        color: #303133;
    }
    .u-extra {
        color: #909399;
        font-size: 12px;
    }
}
</style>
