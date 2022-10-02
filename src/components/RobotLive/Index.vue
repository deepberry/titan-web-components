<!-----------------------------------------------------
* 组件功能：控制轨道机器人进行移动，并直播展示给用户
------------------------------------------------------>
<template>
    <div class="w-live w-live-aliyun">
        <!-- 视频直播 -->
        <div class="w-live-video">
            <!-- 播放器 -->
            <Live class="u-video" :connection="$connection" v-if="videoEnable" :config="videoConf" />
            <!-- 播放器组插槽 -->
            <slot name="video"></slot>
        </div>

        <!-- 控制器 -->
        <div class="w-live-controller">
            <!-- 控制器组插槽 -->
            <slot name="controller"></slot>
            <div class="u-controllers">
                <div class="u-controllers-item">
                    <slot name="camera"></slot>
                    <Camera class="u-controller u-controller--camera" :connection="$connection" v-if="cameraEnable" />
                </div>
                <div class="u-controllers-item">
                    <slot name="robot"></slot>
                    <Robot class="u-controller u-controller--robot" :connection="$connection" v-if="robotEnable" />
                </div>
            </div>
        </div>

        <slot></slot>
    </div>
</template>

<script lang="ts" setup>
import Camera from "./Camera.vue";
import Robot from "./Robot.vue";
import Live from "./Video.vue";
import { createConnection, HubConnectionOptions } from "../../extensions/HubConnection";
import { PlayerOptions } from "../../extensions/AliPlayer";
import { PropType, onUnmounted } from "vue";

// 属性
const props = defineProps({
    // 连接设置
    connectionConf: {
        type: Object as PropType<HubConnectionOptions>,
        required: true,
    },
    // 直播设置
    videoConf: {
        type: Object as PropType<PlayerOptions>,
    },
    // 启用相机
    cameraEnable: {
        type: Boolean as PropType<boolean>,
        default: true,
    },
    // 启用机器人
    robotEnable: {
        type: Boolean as PropType<boolean>,
        default: true,
    },
    // 启用视频
    videoEnable: {
        type: Boolean as PropType<boolean>,
        default: true,
    },
});
const { cameraEnable, robotEnable, videoEnable } = props;

// 连接
const $connection = createConnection(props.connectionConf);
$connection.start();
onUnmounted(() => {
    $connection.stop();
});
</script>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
    name: "RobotLive",
});
</script>

<style lang="less">
.w-live {
    .flex;
    width: 1000px;
    gap: 20px;
    .w-live-video {
        .flex;
        align-items: center;
        background-color: #000;
        width: 400px;
        border: 1px solid #ddd;
        .r(5px);
    }
    .w-live-controller {
        .w-controller + .w-controller {
            .mt(30px);
        }
    }
    .u-controllers-item {
        .u-title {
            .fz(16px,2);
            .bold;
            .mb(20px);
        }
    }
}
@media only screen and (max-width: 1000px) {
    .w-live {
        flex-direction: column;
        .w-live-video {
            .size(100%,460px);
            min-width: 100px;
            min-height: 100px;
        }
        .w-live-controller .u-controllers {
            .flex;
            justify-content: space-between;
        }
    }
}
@media only screen and (max-width: 750px) {
    .w-live {
        .w-live-video {
            .size(100%,340px);
        }
        .w-live-controller .u-controllers {
            zoom: 0.75;
        }
    }
}
@media only screen and (max-width: 450px) {
    .w-live {
        .w-live-video {
            .size(100%,220px);
        }
        .w-live-controller .u-controllers {
            zoom: 0.45;
        }
    }
}
@media only screen and (max-width: 300px) {
    .w-live {
        .w-live-video {
            .size(100%,180px);
        }
        .w-live-controller .u-controllers {
            zoom: 0.35;
        }
    }
}
</style>
