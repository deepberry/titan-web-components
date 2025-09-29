<template>
    <div class="m-chat-box" :class="{ isNull: !chatList.length }">
        <t-chat
            ref="chatRef"
            layout="both"
            class="m-chat"
            reverse
            :clear-history="chatList.length > 0 && !loading && !isStreamLoad"
            @scroll="handleChatScroll"
            @clear="clearConfirm"
        >
            <template v-for="(item, index) in chatList" :key="index">
                <t-chat-item
                    :role="item.role"
                    :content="item.content"
                    :variant="item.role === 'user' ? 'base' : 'text'"
                >
                    <template #content>
                        <t-chat-loading
                            class="u-chat-loading"
                            v-if="index === 0 && loading"
                            animation="moving"
                            :text="$t('ai.thinking')"
                        />
                        <t-chat-content v-if="item.content.length > 0" :content="item.content" />
                        <slot name="ferPreview" :res="item.ferRes"></slot>
                        <div class="m-links" v-if="item.doc_references?.length">
                            <div class="u-label">{{ $t("ai.reference") }}：</div>
                            <t-link
                                v-for="link in mergeDocuments(item.doc_references)"
                                :key="link.doc_id"
                                theme="primary"
                                @click="handleDocView(link.text)"
                            >
                                <span v-for="(item, i) in link.index_list" :key="i">[{{ item }}]</span>
                                <span class="u-title">{{ link.doc_name }}</span>
                            </t-link>
                        </div>
                    </template>
                    <template v-if="!loading && !isStreamLoad" #actions>
                        <div class="m-actions">
                            <t-tooltip :content="$t('ai.regenerate')">
                                <RefreshIcon
                                    class="u-icon"
                                    @click="({ e }) => handleOperation('replay', { e, index })"
                                />
                            </t-tooltip>
                            <t-tooltip
                                v-if="!playDisabled"
                                :content="isPlaying && !isPaused ? $t('ai.stop_play') : $t('ai.play')"
                            >
                                <SoundIcon
                                    class="u-icon"
                                    v-if="currentIndex !== index || !isPlaying"
                                    @click="() => handleOperation('play', { content: item.content, index })"
                                />
                                <StopCircleIcon
                                    v-if="currentIndex === index && isPlaying && !isPaused"
                                    class="u-icon u-stop"
                                    @click="pause"
                                ></StopCircleIcon>
                            </t-tooltip>
                            <t-loading v-else theme="dots" size="20px" />
                            <t-tooltip :content="$t('ai.copy')">
                                <CopyIcon
                                    class="u-icon"
                                    @click="() => handleOperation('copy', { content: item.content })"
                                />
                            </t-tooltip>
                        </div>
                    </template>
                </t-chat-item>
            </template>

            <template v-if="!chatList?.length">
                <el-empty :description="$t('ai.no_chat')">
                    {{ promptTip }}
                </el-empty>
            </template>
        </t-chat>
        <t-button v-show="isShowToBottom" variant="text" class="m-skipbottom" @click="backBottom">
            <div class="u-btn">
                <ArrowDownIcon />
            </div>
        </t-button>

        <t-dialog v-model:visible="docVisible" :actions="[]" close-btn :width="350" @overlay-click="onClickOverlay">
            <div class="m-doc-container" v-html="doc"></div>
        </t-dialog>
    </div>
</template>

<script>
import { useLocale } from "../../hooks/index";
const { t } = useLocale();
import { getCdnLink } from "@deepberry/common/js/utils";
import { useChatStore } from "../../store/aibotStore";

import { Base64 } from "js-base64";
import { getASR, fetchAskUrl, fetchTtsUrl, ask, askFer, fetchAskFerUrl } from "../../service/chat";
import { throttle } from "lodash";
import { uploadToOss } from "../../service/ai-upload";
import { ArrowDownIcon, SoundIcon, CopyIcon, RefreshIcon, StopCircleIcon } from "tdesign-icons-vue-next";
import { MessagePlugin } from "tdesign-vue-next";
import { fetchEventSource } from "@microsoft/fetch-event-source";
export default {
    name: "AiChat",
    props: {
        promptTip: {
            type: String,
            default: "",
        },
        fetchAskUrl: {
            type: String,
            default: fetchAskUrl,
        },
        askFun: {
            type: Function,
            default: ask,
        },
        type: {
            type: String,
            default: "common",
        },
        prompt: {
            type: String,
            default: `
你是一个深莓智能的智能配方助理，能够根据用户的需求生成水培营养液配方。请严格按照以下要求生成配方，最终结果给出一个json即可，不需要任何说明：

### 1. JSON 输出结构

每次输出配方时，输出的格式应为 **一个完整的 JSON 结构**，包含以下字段：

\`\`\`json
{
    "n": { // 氮信息结构
        "n_k": [ // 氮钾比
            1.0,
            1.0
        ],
        "unit": "mmol/L", //单位
        "weight": 2.0, //N的总重量
        "no3_nh4": [1.0,1.0] // 硝态氮比氨态氮
    },
    "acid": { //酸信息结构
        "acid": "H2SO4", // 酸化学式 H2SO4就是硫酸，还有其他酸可以选择
        "weight": null,
        "size_type": "ratio", // 默认自动稀释
        "bucket_size": null, //筒子大小，自动稀释不用填可以为空
        "concentration": 10.0, //
        "dilution_ratio": 1000.0 //
    },
    "unit": "mol", //单位系统默认mol
    "target": [ // 其他需求微量元素列表,有多个
        {
            "unit": "mmol/L", //单位
            "count": 0,
            "is_ios": false,
            "weight": 1.0, //重量
            "element": "P"// 磷
        }
    ],
    "bucket_limit": 2, //筒子数量限制
    "target_index": null, //无其他作用
    "bucket_config": [ //筒子配置
        {
            "size": 1000.0 // 筒子大小默认单位为L
        },
        {
            "size": 1000.0 // 筒子大小默认单位为L
        }
    ],
    "strategy_type": "", //默认空字符串即可
    "water_quality": [ // 水质微量元素
        {
            "unit": "mmol/L",
            "count": 0,
            "is_ios": true, //是否为离子。NO3 NH4 等为离子
            "weight": 0, //重量信息
            "element": "NO3" // 微量元素或者离子信息
        }
    ],
    "recommend_type": "" //默认空字符串即可
}
\`\`\`

### 2. 用户确认信息：

有几个需要用户确认并告知的信息：

* **桶子信息**：
  * 用户需要确认桶子数量（最多2个），每个桶子的大小（单位：L）。如果用户未提供，可以默认为 1000L。
* **酸信息**：
  * 用户需要确认所使用的酸的化学式（例如 H2SO4），酸的浓度（例如 10.0）和稀释比例（默认 1000.0）。如果未提供，将使用默认值。
* **水质数据**：
  * 用户如未说明水质数据直接为空即可。

### 3. 水质数据和微量元素：

根据用户的要求和提供的元素浓度信息，以下微量元素将被填充到 \`water_quality\` 和 \`target\` 中：

#### 水质数据（离子/元素）：

* 默认包含以下离子和元素，如果其浓度为0，则不加入列表。若用户没有说明一般不会有任何数据，不需要任何假设。

\`\`\`json
[
    { "element": "NO3", "unit": "mmol/L" },
    { "element": "NH4", "unit": "mmol/L" },
    { "element": "HCO3", "unit": "mmol/L" },
    { "element": "P", "unit": "mmol/L" },
    { "element": "Ca", "unit": "mmol/L" },
    { "element": "Mg", "unit": "mmol/L" },
    { "element": "S", "unit": "mmol/L" },
    { "element": "Fe", "unit": "umol/L" },
    { "element": "B", "unit": "umol/L" },
    { "element": "Cu", "unit": "umol/L" },
    { "element": "Zn", "unit": "umol/L" },
    { "element": "Mn", "unit": "umol/L" },
    { "element": "Mo", "unit": "umol/L" }
]
\`\`\`

#### 其他微量元素（根据需求填充）：

* 默认包含以下微量元素，单位为 \`mmol/L\` 或 \`umol/L\`，如果含量为0，则不加入列表,优先使用用户提供的数据，否则按照需求从知识库中获取。

\`\`\`json
[
    { "element": "P", "unit": "mmol/L" },
    { "element": "Ca", "unit": "mmol/L" },
    { "element": "Mg", "unit": "mmol/L" },
    { "element": "S", "unit": "mmol/L" },
    { "element": "Fe", "unit": "umol/L" },
    { "element": "B", "unit": "umol/L" },
    { "element": "Cu", "unit": "umol/L" },
    { "element": "Zn", "unit": "umol/L" },
    { "element": "Mn", "unit": "umol/L" },
    { "element": "Mo", "unit": "umol/L" }
]
\`\`\`

### 4. 输出逻辑：

* 根据用户输入的微量元素和其浓度信息，将元素添加到对应的字段中。
* 如果浓度为 \`0\`，则这些元素不需要出现在 JSON 输出中。
* 直接说明结果即可，不需要额外解释。

---

### 5. 配方输出生成规则：

* 根据用户提供的配方信息，生成符合上述结构的 JSON 输出。
* 自动填充每个字段，如 **氮钾比（n\\_k）**、**酸（acid）**、**微量元素（target）** 等，确保数据完整。
* 输出仅包含一个 JSON，格式严格遵守上述模板。

---

### 示例：

假设用户需要配方：

* 硝态氮与氨态氮比为 2:1 其中no3为2mmol/L，nh4为1mmol/L
* 氮钾比为 3:1，氮总量为 3 mmol/L ，K 为 1 mmol/L
* 需要添加磷元素，浓度为 0.5 mmol/L
* 使用 2 个 1000L 桶子
* 使用 H2SO4 酸，浓度 10，稀释比例 1000

则生成的 JSON 输出为：

\`\`\`json
{
    "n": {
        "n_k": [3.0, 1.0],
        "unit": "mmol/L",
        "weight": 3.0,
        "no3_nh4": [2.0, 1.0]
    },
    "acid": {
        "acid": "H2SO4",
        "weight": null,
        "size_type": "ratio",
        "bucket_size": null,
        "concentration": 10.0,
        "dilution_ratio": 1000.0
    },
    "unit": "mol",
    "target": [
        {
            "unit": "mmol/L",
            "count": 0.5,
            "is_ios": false,
            "weight": 0.5,
            "element": "P"
        }
    ],
    "bucket_limit": 2,
    "target_index": null,
    "bucket_config": [
        { "size": 1000.0 },
        { "size": 1000.0 }
    ],
    "strategy_type": "",
    "water_quality": [],
    "recommend_type": ""
}
\`\`\`
`,
        },
    },
    components: {
        ArrowDownIcon,
        SoundIcon,
        CopyIcon,
        RefreshIcon,
        StopCircleIcon,
    },
    data() {
        return {
            chatList: [],
            isShowToBottom: false,

            timer: null,
            currentText: "", // 当前正在渲染的文本
            charIndex: 0, // 当前渲染到的字符索引

            doc: "",
            docVisible: false,
            controller: null,

            // 播放参数
            isStopped: false,
            audioLoading: false, // 获取语音loading
            sse: null,
            playDisabled: false,
            abortController: null,
            queue: [], // 音频链接队列
            isPaused: false, // 暂停状态
            currentAudioUrl: "", // 当前播放的音频URL
            currentIndex: -1, // 当前播放的index
            audioElement: null, // Audio对象实例

            // 录音听写参数
            messageTextList: [],
            messageText: "",
            audioContext: null,
            socket: null,
            audioUrl: "",
            mediaStream: null,
            sampleRate: 16000, // 设置采样率为16000Hzv
            processor: null, // 用于处理音频数据
            // 录音开始时间戳
            recordStartTime: 0,
            dbKey: "", // 上一个用于存储音频数据的键
        };
    },
    computed: {
        loading() {
            return useChatStore().loading;
        },
        isDeepChecked() {
            // 深度思考 来控制流式传输
            return useChatStore().isDeepChecked;
        },
        isStreamLoad() {
            return useChatStore().isStreamLoad;
        },
        isPlaying() {
            // 播放状态标志
            return useChatStore().isPlaying;
        },
        isRecording() {
            // 正在录制
            return useChatStore().isRecording;
        },
        pageLoading() {
            return useChatStore().pageLoading;
        },
        isFer() {
            return this.type === "fer";
        },
    },
    beforeUnmount() {
        this.onStop();
        if (this.sse) {
            this.sse.disconnect();
        }
        if (this.audioElement) this.audioElement.pause();

        this.abortRequest();
        if (this.$refs.chatSender) {
            this.$refs.chatSender = null;
        }
        // 移除事件监听
        window.removeEventListener("beforeunload", this.handleBeforeUnload);
    },
    created() {
        useChatStore().initDb();
    },
    mounted() {
        // 监听 beforeunload 事件（页面关闭/刷新前触发）
        window.addEventListener("beforeunload", this.handleBeforeUnload);
    },
    methods: {
        $t: t,
        backBottom() {
            this.$nextTick(() => {
                this.$refs.chatRef?.scrollToBottom({ behavior: "smooth" });
            });
        },
        handleChatScroll({ e }) {
            const scrollTop = e.target.scrollTop;
            this.isShowToBottom = scrollTop < 0;
        },
        clearConfirm() {
            this.chatList = [];
            this.timer && clearTimeout(this.timer);
        },
        onStop() {
            this.cancelRequest();
            useChatStore().loading = false;
            useChatStore().isStreamLoad = false;
            this.timer && clearTimeout(this.timer);
        },
        mergeDocuments(documents) {
            const mergedMap = documents.reduce((map, doc) => {
                const key = doc.doc_id;
                const existing = map.get(key);

                if (existing) {
                    // 合并index_id
                    if (!existing.index_list.includes(doc.index_id)) {
                        existing.index_list.push(doc.index_id);
                    }
                } else {
                    map.set(key, {
                        ...doc,
                        index_list: [doc.index_id], // 创建新的index_list
                    });
                    // 删除原始index_id字段
                    delete map.get(key).index_id;
                }
                return map;
            }, new Map());
            return Array.from(mergedMap.values());
        },
        handleDocView(text) {
            this.doc = text;
            this.docVisible = true;
        },
        onClickOverlay() {
            this.doc = "";
            this.docVisible = false;
        },
        handleOperation(type, { e, index, content }) {
            // console.log("handleOperation", e, type, index);
            if (type === "replay") {
                const userQuery = this.chatList[index + 1].content;
                this.inputEnter(userQuery, { e: { code: "Enter" } });
            }
            if (type === "copy") {
                navigator.clipboard.writeText(content).then(() => {
                    MessagePlugin.success({
                        content: this.$t("ai.copy_success"),
                    });
                });
            }
            if (type === "play") {
                if (this.isRecording) return;
                if (this.isPaused) {
                    this.resume();
                } else {
                    if (this.isPlaying) {
                        // 其它正在播放
                        this.closePlay();
                        // return MessagePlugin.warning({
                        //     content: "请等待其它播放完成",
                        // });
                    }
                    this.isStopped = false;
                    // 同时发送文本生成新音频
                    if (index === -1) {
                        this.ssePost(content.trim().replace(/(<\/?[^>]+(>|$))|(&nbsp;)/g, ""), index);
                    } else {
                        const i = this.chatList.length - index;
                        this.sendText(content, i);
                    }
                }
            }
        },

        handleBeforeUnload() {
            // 刷新前正在播放，且有 dbKey时，意味着存入不完整，直接清除
            console.log(this.isPlaying, this.dbKey);
            if (this.isPlaying && this.dbKey) {
                useChatStore().removeDbItem(this.dbKey);
            }
        },
        async ssePost(text, index) {
            // 中止之前的请求
            if (this.abortController) {
                // 手动中断清除刚存的不完整的key
                if (this.dbKey) {
                    useChatStore().removeDbItem(this.dbKey);
                }
                this.abortController.abort();
            }
            const key = `audio_map_${this.id}_${index}`;
            this.dbKey = key;
            this.playDisabled = true;
            const url = fetchTtsUrl;
            const controller = new AbortController();
            this.abortController = controller;
            const signal = controller.signal;
            if (index !== -1) {
                const audioMap = await useChatStore().getDbItem(key);
                this.currentIndex = this.chatList.length - index;
                if (audioMap) {
                    this.playDisabled = false;
                    this.queue = JSON.parse(audioMap);
                    // 仅当既没有播放也没有暂停时自动播放
                    if (!this.isPlaying && !this.isPaused) {
                        this.playNext();
                    }
                    return;
                }
            }
            const that = this;
            const mapList = [];
            that.audioLoading = true;
            await fetchEventSource(`${url}`, {
                method: "POST",
                signal: signal,
                headers: {
                    "Content-Type": "application/json",
                    // token: localStorage.getItem("token"),
                },
                body: JSON.stringify({ text }),
                onmessage(msg) {
                    that.playDisabled = false;
                    that.audioLoading = false;
                    if (msg.event === "") {
                        var result = JSON.parse(msg.data);
                        // console.log(result, key);
                        if (result.status === "segment") {
                            const url = getCdnLink(result.url);
                            that.addToQueue(url);
                            if (index !== -1) {
                                mapList.push(url);
                                // 存入本地
                                useChatStore().setDbItem(key, JSON.stringify(mapList));
                            }
                        }
                    } else if (msg.event === "close") {
                        controller.abort();
                    }
                },
                onclose(err) {
                    that.playDisabled = false;
                    that.audioLoading = false;
                    useChatStore().isPlaying = false;

                    // throw err;
                },
                onerror(err) {
                    that.playDisabled = false;
                    that.audioLoading = false;
                    useChatStore().isPlaying = false;
                    // 只有error才能清除queue
                    that.queue = [];
                    // 意外中断清除已存的key
                    if (that.dbKey) {
                        useChatStore().removeDbItem(that.dbKey);
                    }
                    console.log("sse post error", err);
                    throw err; //必须throw才能停止
                },
            });
        },
        // tts abort
        abortRequest() {
            if (this.abortController) {
                this.abortController.abort();
                this.queue = []; // 清空播放队列
                useChatStore().isPlaying = false; // 重置播放状态
                this.playDisabled = false; // 恢复播放按钮

                console.log("Request and playback aborted");
            }
            if (this.audioElement) {
                this.audioElement.pause();
                this.audioElement.currentTime = 0;
            }
        },
        sendText: throttle(function (text, index) {
            if (!text.trim() || this.playDisabled) return;
            this.ssePost(text.trim().replace(/(<\/?[^>]+(>|$))|(&nbsp;)/g, ""), index);
        }, 500),
        addToQueue(url) {
            this.queue.push(url);
            // 仅当既没有播放也没有暂停时自动播放
            if (!this.isPlaying && !this.isPaused) {
                this.playNext();
            }
        },

        playNext() {
            if (this.isStopped) return; // 关键检查
            // 全部播放完毕
            if (this.queue.length === 0) {
                useChatStore().isPlaying = false;
                this.isPaused = false;
                this.currentIndex = -1;
                this.dbKey = "";
                return;
            }
            // console.log(this.queue);

            // 清理之前的音频对象
            if (this.audioElement) {
                this.audioElement.removeEventListener("ended", this.handleEnd);
                this.audioElement.removeEventListener("error", this.handleError);
            }

            useChatStore().isPlaying = true;
            this.isPaused = false;
            this.currentAudioUrl = this.queue.shift();

            this.audioElement = new Audio(this.currentAudioUrl);

            // 注册事件监听
            this.audioElement.addEventListener("ended", this.handleEnd);
            this.audioElement.addEventListener("error", this.handleError);

            this.audioElement.play().catch((error) => {
                console.error("播放失败:", error);
                this.playNext();
            });
        },
        handleEnd() {
            if (this.isStopped) return; // 已停止则不再处理
            this.currentAudioUrl = "";
            useChatStore().isPlaying = false;
            this.isPaused = false;
            this.playNext();
        },

        handleError() {
            if (this.isStopped) return; // 已停止则不再处理
            console.error("音频播放错误");
            this.playNext();
        },
        pause() {
            if (this.audioElement) {
                this.audioElement.pause();
                useChatStore().isPlaying = false;
                this.isPaused = true;
            }
        },

        async resume() {
            if (!this.audioElement || !this.isPaused) return;

            try {
                await this.audioElement.play();
                useChatStore().isPlaying = true;
                this.isPaused = false;
            } catch (error) {
                console.error("恢复播放失败:", error);
                this.playNext();
            }
        },

        closePlay() {
            // 暂停音频播放
            if (this.audioElement) {
                this.audioElement.pause();
                this.audioElement.currentTime = 0;
                // 移除事件监听器避免内存泄漏
                this.audioElement.removeEventListener("ended", this.handleEnd);
                this.audioElement.removeEventListener("error", this.handleError);
                this.audioElement = null; // 清理音频对象
            }
            // 重置状态
            useChatStore().isPlaying = false;
            this.isPaused = false;
            // 清空播放队列
            this.queue = [];
            this.currentIndex = -1;
        },
        handleStop() {
            // 标记已停止
            this.isStopped = true;
            this.closePlay();
        },

        async handleStreamData(inputValue, isVoice) {
            useChatStore().loading = true;
            useChatStore().isStreamLoad = true;
            const lastItem = this.chatList[0];

            // 每次发起新请求前，清理之前的控制器
            if (this.controller) {
                this.cancelRequest();
            }

            const requestData = {
                content: inputValue || `最终答案是${inputValue}`,
                stream: true,
            };

            try {
                await this.fetchSSE(() => this.startRequest(requestData), {
                    success: (result) => {
                        useChatStore().loading = false;

                        this.timer = setTimeout(() => {
                            lastItem.reasoning += result.output.text;
                            lastItem.content += result.output.text;
                        }, 20);

                        if (result.output?.doc_references?.length) {
                            lastItem.doc_references = lastItem.doc_references.concat(result.output.doc_references);
                        }

                        if (
                            result.output?.session_id &&
                            result.output?.session_id !== sessionStorage.getItem("session_id")
                        ) {
                            const { session_id } = result.output;
                            sessionStorage.setItem("session_id", session_id);
                        }
                    },
                    complete: (isOk, msg) => {
                        if (!isOk) {
                            // 设置为error不会展示actions
                            // lastItem.role = "error";
                            lastItem.content = msg;
                            lastItem.reasoning = msg;
                        }
                        lastItem.duration = 20;
                        useChatStore().isStreamLoad = false;
                        useChatStore().loading = false;
                        if (isVoice) {
                            this.handleOperation("play", {
                                content: this.chatList[0].content,
                                index: -1,
                            });
                        }
                    },
                    fail: (err) => {
                        console.log("请求失败:", err);
                    },
                });
            } catch (error) {
                console.error("SSE Error:", error);
                useChatStore().isStreamLoad = false;
                useChatStore().loading = false;
            }
        },

        async fetchSSE(fetchFn, { success, fail, complete }) {
            try {
                const response = await fetchFn();

                if (!response.ok) {
                    complete?.(false, response.statusText);
                    fail?.(new Error(response.statusText));
                    return;
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder("utf-8");
                let buffer = "";

                // 监听中止信号，主动取消流读取
                const signal = response.controller?.signal;
                signal?.addEventListener("abort", () => {
                    reader.cancel(); // 关键：主动释放流资源
                });

                const processChunk = async ({ done, value }) => {
                    if (done) {
                        complete?.(true);
                        return;
                    }

                    // 解析流数据
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split("\n");
                    buffer = lines.pop() || ""; // 保留未完成的行

                    for (const line of lines) {
                        if (line.startsWith("data:")) {
                            const raw = line.slice(5).trim();
                            if (!raw) continue;
                            try {
                                const json = JSON.parse(raw);
                                success(json);

                                if (json.output?.finish_reason === "stop") {
                                    this.timer && clearTimeout(this.timer);
                                    console.log("解析完成");
                                }
                            } catch (err) {
                                console.warn("JSON解析失败:", raw, err);
                            }
                        }
                    }

                    // 继续读取流（除非已中止）
                    if (!signal?.aborted) {
                        reader
                            .read()
                            .then(processChunk)
                            .catch((err) => {
                                if (err.name !== "AbortError") throw err;
                            });
                    }
                };

                reader
                    .read()
                    .then(processChunk)
                    .catch((err) => {
                        if (err.name === "AbortError") {
                            complete?.(false, "请求已取消");
                        } else {
                            complete?.(false, err.message);
                        }
                    });
            } catch (error) {
                // 明确捕获中止错误和其他错误
                if (error.name === "AbortError") {
                    complete?.(false, "请求已取消");
                } else {
                    complete?.(false, error.message);
                    fail?.(error);
                }
            }
        },

        startRequest(data) {
            this.controller = new AbortController();
            const signal = this.controller.signal;
            const responsePromise = this.getResponse(data, signal);

            // 将 controller 绑定到 response，供 fetchSSE 使用
            responsePromise.controller = this.controller;
            return responsePromise;
        },

        cancelRequest() {
            if (this.controller) {
                this.controller.abort();
                this.controller = null;
                console.log("请求已取消");
            }
        },
        encodeToken() {
            const token = localStorage.getItem("token");
            const encode = Base64.encode(`user:${token}`);
            return `Basic ${encode}`;
        },
        async getResponse(data, signal) {
            const fetchAskUrl = this.isFer ? fetchAskFerUrl : this.fetchAskUrl;
            const response = await fetch(fetchAskUrl, {
                method: "POST",
                headers: {
                    Accept: "text/event-stream",
                    "Content-Type": "application/json",
                    Authorization: this.encodeToken(),
                },
                body: JSON.stringify(data),
                signal: signal,
            });
            return response;
        },

        inputEnter(inputValue, { e, replyContent = "", isVoice = false } = {}) {
            inputValue = inputValue || useChatStore().inputValue;
            if (this.isStreamLoad || this.isRecording || !inputValue) return;
            useChatStore().inputValue = "";
            this.chatList.unshift(
                {
                    avatar: require("../../assets/img/common/logo.svg"),
                    name: "智能小莓",
                    datetime: new Date().toDateString(),
                    content: replyContent || "",
                    reasoning: "",
                    role: "assistant",
                    doc_references: [],
                },
                {
                    avatar: require("../../assets/img/common/user.svg"),
                    name: "自己",
                    datetime: new Date().toDateString(),
                    content: inputValue,
                    role: "user",
                }
            );

            if (this.isDeepChecked && !replyContent) {
                this.handleStreamData(inputValue, isVoice);
            } else {
                this.handleAsk(inputValue, replyContent, isVoice);
            }
        },
        handleAsk(inputValue, replyContent, isVoice) {
            if (replyContent) {
                this.handleData(replyContent);
                return;
            }
            const data = this.isFer
                ? {
                      content: inputValue,
                      prompt: this.prompt,
                  }
                : {
                      content: inputValue,
                      stream: false,
                  };
            useChatStore().loading = true;
            const fun = this.isFer ? askFer : this.askFun;
            return fun(data)
                .then((res) => {
                    let content = "";
                    let ref = null;
                    if (this.isFer) {
                        content = res.data.data?.data;
                        ref = null;
                    } else {
                        const commonData = res.data.data || {};
                        content = commonData.content;
                        ref = commonData.ref;
                    }

                    this.handleData(content, ref);

                    if (isVoice) {
                        this.handleOperation("play", {
                            content: content,
                            index: -1,
                        });
                    }
                })
                .finally(() => {
                    useChatStore().loading = false;
                });
        },
        handleData(content, ref) {
            if (this.isFer) {
                this.handleFerData(content, ref);
            } else {
                this.handleCommonData(content, ref);
            }
        },
        handleCommonData(content, ref) {
            this.currentText = "";
            this.charIndex = 0;
            useChatStore().isStreamLoad = true;
            this.renderFullChar(content, ref);
        },
        handleFerData(content, ref) {
            this.currentText = "";
            this.charIndex = 0;
            useChatStore().isStreamLoad = true;

            // 正则匹配```json内容```如果为json结果，则设置结果数据，输出一个desc即可
            const codeBlockMatch = content.match(/```json([\s\S]*?)```/);
            // codeBlockMatch[1] 为json内容则
            let ferRes = null;
            if (codeBlockMatch && codeBlockMatch[1]) {
                try {
                    const jsonString = codeBlockMatch[1].trim();
                    ferRes = { input: JSON.parse(jsonString) };
                    console.log("Parsed JSON data:", ferRes);
                    // 这里可以根据需要处理 parsedData
                    content = this.$t("ai.formula_success");
                } catch (err) {
                    console.error("JSON解析失败:", err, codeBlockMatch?.[1]);
                    content = this.$t("ai.formula_fail");
                }
            } else {
                content = this.$t("ai.formula_fail");
            }

            this.chatList[0].ferRes = ferRes;
            if (this.chatList[0].ferRes) {
                this.currentFerRes = this.chatList[0].ferRes;
            }

            this.renderFullChar(content, ref);
        },
        renderFullChar(fullText, ref) {
            if (this.charIndex >= fullText.length || !this.isStreamLoad) {
                useChatStore().isStreamLoad = false;
                this.chatList[0].doc_references = ref;
                return;
            }

            this.currentText += fullText[this.charIndex];
            this.charIndex++;

            // 更新DOM
            if (this.chatList[0]) {
                this.chatList[0].content = this.currentText;
            }

            // 设置随机间隔模拟真实效果
            const speed = Math.random() * 20 + 20;
            this.timer = setTimeout(() => {
                this.renderFullChar(fullText, ref);
            }, speed);
        },

        // 点击开始录制
        onRecord() {
            if (this.isStreamLoad || this.isPlaying) {
                return MessagePlugin.warning({
                    content: this.$t("ai.please_wait"),
                });
            }
            if (this.isRecording) return;

            // 记录开始时间
            this.recordStartTime = Date.now();
            this.pause();
            this.closePlay();

            useChatStore().isRecording = true;
            this.audioChunks = []; // 初始化音频数据存储

            navigator.mediaDevices
                .getUserMedia({ audio: true })
                .then((stream) => {
                    MessagePlugin.warning({
                        content: this.$t("ai.recording"),
                    });
                    this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                        sampleRate: this.sampleRate,
                    });
                    const source = this.audioContext.createMediaStreamSource(stream);

                    // 创建处理节点
                    this.processor = this.audioContext.createScriptProcessor(2048, 1, 1);
                    source.connect(this.processor);
                    this.processor.connect(this.audioContext.destination);

                    // 音频处理回调
                    this.processor.onaudioprocess = (e) => {
                        const inputBuffer = e.inputBuffer;
                        const channelData = inputBuffer.getChannelData(0);

                        // 转换为16位PCM并存储
                        const pcmData = new Int16Array(channelData.length);
                        for (let i = 0; i < channelData.length; i++) {
                            pcmData[i] = Math.min(1, Math.max(-1, channelData[i])) * 0x7fff;
                        }
                        this.audioChunks.push(pcmData);
                    };
                })
                .catch((error) => {
                    console.error("麦克风权限获取失败:", error);
                    MessagePlugin.warning({
                        content: this.$t("ai.mic_permission_fail"),
                    });
                });
        },

        async onStopRecord(isVoice) {
            useChatStore().isRecording = false;

            // 计算持续时间
            const duration = Date.now() - this.recordStartTime;
            if (duration < 2000) {
                this.cleanupRecording();
                return MessagePlugin.warning({
                    content: this.$t("ai.too_short"),
                });
            }

            // 关闭音频处理节点
            if (this.audioContext && this.processor) {
                this.processor.disconnect();
                this.audioContext.close();
            }
            // 生成语音文件
            if (this.audioChunks?.length > 0) {
                try {
                    // 合并音频数据
                    const mergedData = this.mergeArrays(this.audioChunks);

                    // 生成WAV文件
                    const wavBuffer = this.encodeWAV(mergedData, this.sampleRate);
                    const blob = new Blob([wavBuffer], { type: "audio/wav" });
                    const fileName = `voice_${Date.now()}.wav`;
                    const file = new File([blob], fileName, { type: "audio/wav" });

                    // 上传到OSS
                    try {
                        !isVoice && (useChatStore().pageLoading = true);
                        const fileRes = await uploadToOss(file);
                        if (fileRes?.url) {
                            this.getAudioText({ file: fileRes.url }, isVoice);
                        }
                    } catch {
                        useChatStore().pageLoading = false;
                    }
                } catch (err) {
                    console.error("文件处理失败:", err);
                    MessagePlugin.warning({
                        content: this.$t("ai.audio_file_fail"),
                    });
                }
            } else {
                MessagePlugin.warning({
                    content: this.$t("ai.no_audio"),
                });
            }
        },
        // 清理方法
        cleanupRecording() {
            // 状态重置
            useChatStore().isRecording = false;
            this.audioChunks = [];

            // 媒体资源释放
            if (this.mediaStream) {
                this.mediaStream.getTracks().forEach((track) => {
                    track.stop();
                    track.enabled = false;
                });
                this.mediaStream = null;
            }

            // 音频上下文清理
            if (this.audioContext && this.audioContext.state !== "closed") {
                this.audioContext.close().then(() => {
                    this.audioContext = null;
                });
            }

            // 处理器断开
            if (this.processor) {
                this.processor.disconnect();
                this.processor.onaudioprocess = null;
                this.processor = null;
            }
        },
        getAudioText(data, isVoice) {
            getASR(data)
                .then((res) => {
                    const url = res.data?.data?.[0]?.transcription_url;
                    if (url) {
                        fetch(url)
                            .then((response) => {
                                if (!response.ok) {
                                    throw new Error("网络错误");
                                }
                                return response.text();
                            })
                            .then((res) => {
                                try {
                                    const parsedData = JSON.parse(res);
                                    const message = parsedData?.transcripts?.[0]?.text || "";
                                    if (isVoice) {
                                        this.inputEnter(message, { isVoice });
                                    } else {
                                        useChatStore().inputValue += message + "";
                                    }
                                } catch (err) {
                                    console.error("解析文本失败:", err);
                                    MessagePlugin.warning({
                                        content: this.$t("ai.parse_text_fail"),
                                    });
                                }
                                // this.inputEnter(text, { isVoice: true });
                            })
                            .catch((error) => {
                                console.error("获取文本失败:", error);
                                MessagePlugin.warning({
                                    content: this.$t("ai.fetch_text_fail"),
                                });
                            });
                    }
                })
                .catch((err) => {
                    console.error("解析失败:", err);
                    MessagePlugin.warning({
                        content: this.$t("ai.too_short"),
                    });
                })
                .finally(() => {
                    useChatStore().pageLoading = false;
                });
        },

        // 合并音频数据数组
        mergeArrays(arrays) {
            let totalLength = arrays.reduce((acc, arr) => acc + arr.length, 0);
            let result = new Int16Array(totalLength);
            let offset = 0;
            arrays.forEach((arr) => {
                result.set(arr, offset);
                offset += arr.length;
            });
            return result;
        },

        // 生成WAV文件头
        encodeWAV(samples, sampleRate = 16000, numChannels = 1) {
            const buffer = new ArrayBuffer(44 + samples.length * 2);
            const view = new DataView(buffer);

            // WAV文件头写入函数
            const writeString = (view, offset, string) => {
                string.split("").forEach((char, i) => {
                    view.setUint8(offset + i, char.charCodeAt(0));
                });
            };

            // 写入文件头
            writeString(view, 0, "RIFF");
            view.setUint32(4, 36 + samples.length * 2, true);
            writeString(view, 8, "WAVE");
            writeString(view, 12, "fmt ");
            view.setUint32(16, 16, true);
            view.setUint16(20, 1, true); // PCM格式
            view.setUint16(22, numChannels, true);
            view.setUint32(24, sampleRate, true);
            view.setUint32(28, sampleRate * 2, true); // 字节率
            view.setUint16(32, numChannels * 2, true); // 块对齐
            view.setUint16(34, 16, true); // 位深度
            writeString(view, 36, "data");
            view.setUint32(40, samples.length * 2, true);

            // 写入音频数据
            const int16View = new Int16Array(buffer, 44);
            for (let i = 0; i < samples.length; i++) {
                int16View[i] = samples[i];
            }

            return buffer;
        },
        onClose() {
            this.closePlay();
            this.isStopped = true;
            this.messageTextList = [];
            useChatStore().isRecording = false;
            this.voiceVisible = false;
        },
    },
};
</script>

<style lang="less">
.m-chat-box {
    margin: 10px 0;
    flex: 1;
    position: relative;
    box-sizing: border-box;
    background-color: #f6f7fb;
    max-height: 500px;
    min-height: 400px;
    overflow-y: auto;

    &.isNull {
        .t-chat__list .place-holder {
            background: url("../../assets/img/common/logo.svg") no-repeat center center;
            background-size: 4rem 4rem;
            opacity: 0.05;
        }
    }

    .u-chat-loading {
        margin-left: 20px;
    }
    .m-chat {
        flex: 1;
        .r(10px);
        .t-chat__list {
            box-sizing: border-box;
            padding: 20px;
        }
        .t-chat__base {
            .fz(0.8rem);
            padding-top: 0.1rem;
        }
        .t-chat__avatar,
        .t-chat__avatar__box {
            padding-top: 0;
        }
        .t-chat__avatar-image {
            .size(1.8rem);
            border-radius: 50%;
            border: 1px solid #ddd;
            background-color: #eee;
        }
        .t-chat__text .t-chat__text--user pre,
        .t-chat__text__assistant {
            .fz(14px);
            color: #333;
        }
        .t-chat__text {
            background-color: #fff;
            .r(12px);
            border-top-left-radius: 0;
        }
        .t-chat__actions-margin {
            margin-left: 0;
        }
        .t-chat__actions {
            margin-top: 10px;
            visibility: hidden;
        }
        .t-chat__inner:hover {
            .t-chat__actions {
                visibility: visible;
            }
        }
        .t-chat__inner .t-chat__content--base {
            padding-top: 10px;
        }
        .t-chat__text--variant--base .t-chat__text {
            background-color: #e0dffc;
            border-top-right-radius: 0;
            border-top-left-radius: 12px;
        }
    }
    .m-links {
        .flex;
        flex-direction: column;
        gap: 2px;
        padding: 20px;
        .u-label {
            font-size: 12px;
            color: #999;
        }
        .t-link {
            align-items: flex-start;
            gap: 5px;
        }
        .u-title {
            word-break: break-all;
        }
    }
    // 跳转
    .m-skipbottom {
        position: absolute;
        left: 50%;
        margin-left: -20px;
        bottom: 210px;
        padding: 0;
        border: 0;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        box-shadow: 0px 8px 10px -5px rgba(0, 0, 0, 0.08), 0px 16px 24px 2px rgba(0, 0, 0, 0.04),
            0px 6px 30px 5px rgba(0, 0, 0, 0.05);
        .u-to-bottom {
            width: 40px;
            height: 40px;
            border: 1px solid #dcdcdc;
            box-sizing: border-box;
            background: var(--td-bg-color-container);
            border-radius: 50%;
            font-size: 24px;
            line-height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            .t-icon {
                font-size: 24px;
            }
            .u-btn {
                position: absolute;
                left: 50%;
                margin-left: -20px;
                bottom: 210px;
                padding: 0;
                border: 0;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                box-shadow: 0px 8px 10px -5px rgba(0, 0, 0, 0.08), 0px 16px 24px 2px rgba(0, 0, 0, 0.04),
                    0px 6px 30px 5px rgba(0, 0, 0, 0.05);
            }
        }
    }

    /deep/ .t-chat__list,
    /deep/ .t-chat__footer {
        padding: 10px;
        box-sizing: border-box;
    }

    .t-chat__text--variant--base .t-chat__text {
        border-top-right-radius: 0;
    }
    .t-dialog__header {
        height: 0;
    }
    .t-chat__content:hover {
        .t-chat__actions-margin .m-actions {
            visibility: visible;
        }
    }
    .m-actions {
        margin-top: var(--td-comp-margin-xs);
        display: flex;
        list-style: none;
        padding: 3px;
        background-color: var(--td-bg-color-secondarycontainer);
        border-radius: var(--td-radius-medium);
        border: 1px solid var(--td-border-level-2-color);
        overflow: hidden;
        visibility: hidden;
        .u-icon {
            padding: 4px 8px;
            cursor: pointer;
            font-size: 16px;
            &:hover {
                background-color: #eee;
            }
            &:not(:last-of-type) {
                border-right: 1px solid #eee;
            }
            &.u-stop {
                color: #f00;
            }
        }
    }
    .m-doc-container {
        height: 264px;
        overflow-y: auto;
        font-size: 12px;
        color: var(--td-font-gray-2);
        line-height: 24px;
        white-space: pre-line;
        text-align: left;

        &::-webkit-scrollbar {
            display: none;
            width: 0;
            height: 0;
        }
    }
}
</style>
