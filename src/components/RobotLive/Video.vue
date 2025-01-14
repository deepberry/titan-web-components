<!-----------------------------------------------------
* 组件功能：视频直播
* 参考文档：https://help.aliyun.com/document_detail/125570.html
------------------------------------------------------>
<template>
    <div id="J_prismPlayer"></div>
</template>

<script lang="ts" setup>
import pinia from "../../store/store";
import { PropType, onBeforeUnmount, onMounted } from "vue";
import { createPlayer, PlayerOptions } from "../../extensions/AliPlayer";
import { useRobotLiveStore } from "../../store/RobotLive";

// 属性
const props = defineProps({
    connection: {
        type: Object,
        required: true,
    },
    config: {
        type: Object as PropType<PlayerOptions>,
        default: () => {
            return {
                // 播放器外层容器的dom元素ID。
                id: "J_prismPlayer",
                // 播放器宽度，取值：100%、100px，Chrome浏览器下Flash播放器分别不能小于397x297px。
                width: "100%",
                // 播放器高度，取值：100%、100px
                height: "500px",
                // 视频播放地址URL。
                // URL播放方式优先级最高。URL播放方式支持多清晰度设置：
                // source:’{“HD”:”address1”,”SD”:”address2”}’
                source: "",
                // RTS的降级地址（如HLS地址）。
                rtsFallbackSource: "",
                // 封面地址
                cover: "",
                // H5是否内置播放，有的Android浏览器不起作用。
                playsinline: true,
                // 播放器是否自动播放，在移动端autoplay属性会失效。
                autoplay: true,
                // 播放内容是否为直播，直播时会禁止用户拖动进度条。
                isLive: true,
                // 配置RTS拉取不到数据的超时时间（超时会重试），单位：毫秒。默认为3000毫秒。
                rtsLoadDataTimeout: 8000,
                // 直播播放失败重试次数，默认5次。
                liveRetry: 5,
            };
        },
    },
});
const { connection: $connection, config } = props;

// 状态
const store = useRobotLiveStore(pinia);

// 实例
onMounted(() => {
    // 开始直播
    $connection.on("StartLive", (url: string) => {
        // 通过回调获取直播地址
        const _config = {
            ...config,
            source: `artc://${url}`,
            rtsFallbackSource: `https://${url}.m3u8`,
        };

        // 初始化播放器
        store.video.player = createPlayer(_config);
        store.video.status = true;
    });
});
onBeforeUnmount(() => {
    // 停止直播
    $connection.off("StartLive");
    store.video.status = true;
});
</script>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
    name: "RobotLiveVideo",
});
</script>

<style lang="less">
@import "../../assets/css/RobotLive/Video.less";
</style>
