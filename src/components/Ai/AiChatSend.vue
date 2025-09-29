<template>
    <div class="m-ai-chat-sender" v-loading="pageLoading">
        <t-chat-sender
            ref="chatSender"
            :stop-disabled="isStreamLoad"
            :textarea-props="{
                placeholder: $t('ai.input_placeholder'),
            }"
            v-model="messageText"
            @stop="onStop"
            @send="(value, { e }) => inputEnter(value, { e })"
        >
            <template #suffix>
                <t-button v-if="isStreamLoad" theme="primary" variant="text" class="u-sender-btn" @click="onStop">
                    {{ $t("ai.interrupt") }}
                </t-button>
                <t-button
                    v-else
                    theme="default"
                    variant="text"
                    class="u-sender-btn"
                    :class="{ active: !!messageText }"
                    :disabled="loading || isStreamLoad || isRecording || !messageText"
                    @click="inputEnter(messageText, { e: { code: 'Enter' } })"
                >
                    {{ $t("ai.send") }}
                </t-button>
            </template>
            <template #prefix>
                <div class="m-prefix-action">
                    <div class="u-deepthink" v-if="showDeep">
                        <t-button
                            class="u-check-box"
                            :class="{ 'is-active': isDeepChecked }"
                            variant="text"
                            :disabled="loading || isStreamLoad"
                            @click="deepClick"
                        >
                            <SystemSumIcon />
                            <span>
                                {{ $t("ai.deep_think") }}
                            </span>
                        </t-button>
                    </div>
                    <div class="u-record">
                        <t-button v-if="!isRecording" theme="primary" variant="outline" class="u-btn" @click="onRecord">
                            <Microphone1Icon></Microphone1Icon>
                            <span>
                                {{ $t("ai.dictation") }}
                            </span>
                        </t-button>
                        <t-button
                            v-else
                            class="u-btn u-stop-btn"
                            theme="danger"
                            variant="outline"
                            @click="onStopRecord"
                        >
                            <StopCircleIcon></StopCircleIcon>
                            <span>
                                {{ $t("ai.stop") }}
                            </span>
                        </t-button>
                    </div>
                </div>
            </template>
        </t-chat-sender>
    </div>
</template>

<script>
import { useLocale } from "../../hooks/index";
import { SystemSumIcon, StopCircleIcon, Microphone1Icon } from "tdesign-icons-vue-next";
import { MessagePlugin } from "tdesign-vue-next";
const { t } = useLocale();
import { useChatStore } from "../../store/aibotStore";
export default {
    name: "AiChatSend",
    props: {
        showDeep: {
            type: Boolean,
            default: true,
        },
    },
    emits: ["send", "stop", "record", "stopRecord"],
    components: {
        SystemSumIcon,
        StopCircleIcon,
        Microphone1Icon,
    },
    data() {
        return {
            messageText: "",
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
        isPlaying() {
            return useChatStore().isPlaying;
        },
        isStreamLoad() {
            return useChatStore().isStreamLoad;
        },
        isRecording() {
            return useChatStore().isRecording;
        },
        pageLoading() {
            return useChatStore().pageLoading;
        },
        inputValue() {
            return useChatStore().inputValue;
        },
    },
    watch: {
        inputValue(inputValue) {
            this.messageText += inputValue;
        },
        showDeep: {
            immediate: true,
            handler(bol) {
                useChatStore().isDeepChecked = bol;
            },
        },
    },
    methods: {
        $t: t,
        deepClick() {
            useChatStore().isDeepChecked = !this.isDeepChecked;
        },
        onStop() {
            this.$emit("stop");
        },
        inputEnter(inputValue) {
            if (this.isStreamLoad || this.isRecording || !inputValue) return;
            this.messageText = "";
            useChatStore().inputValue = inputValue;
            this.$emit("send");
        },
        // 点击开始录制
        onRecord() {
            if (this.isStreamLoad || this.isPlaying) {
                return MessagePlugin.warning({
                    content: this.$t("ai.please_wait"),
                });
            }
            if (this.isRecording) return;
            this.$emit("record");
        },
        async onStopRecord() {
            this.$emit("stopRecord");
        },
    },
};
</script>

<style lang="less">
.m-ai-chat-sender {
    .u-sender-btn {
        padding: 0 10px !important;
        &:not(.t-button.t-is-disabled) {
            background-color: #0052d9;
            color: #fff;
        }
    }
    .u-sender-btn.t-button {
        height: var(--td-comp-size-m);
        padding: 0;
        background-color: #eee;
    }
    .t-chat-sender__textarea {
        // box-shadow: 0 0 0 2px var(--td-brand-color-focus);
        transition: all 0.05s ease-in;
        .r(8px);
        background-color: #fafbfc;
    }
    .t-chat-sender__textarea:hover {
        // box-shadow: none;
        box-shadow: 0 0 0 2px var(--td-brand-color-focus);
    }
    .t-textarea {
        background-color: transparent;
    }
    .t-button__content {
        .flex;
        align-items: center;
    }
    .m-prefix-action {
        .flex;
        align-items: center;
        gap: 10px;
        .u-btn {
            border: 1px solid #d9e1ff;
            background-color: #f2f3ff;
            color: var(--td-brand-color);
            padding: 0 10px;
            height: 32px;
            border-radius: 32px;
        }
        .u-stop-btn {
            background-color: #d54941;
            border-color: #d54941;
            color: #fff;
        }
        .t-button__text {
            display: flex;
            align-items: center;
        }
    }
    .u-deepthink {
        display: flex;
        align-items: center;
        .u-check-box {
            width: 112px;
            height: 32px;
            border-radius: 32px;
            border: 0;
            background: #e7e7e7;
            color: rgba(0, 0, 0, 0.9);
            box-sizing: border-box;
            flex: 0 0 auto;
            .t-button__text {
                .t-icon {
                    padding-top: 2px;
                }
                span {
                    margin-left: 4px;
                }
            }
            &.t-is-disabled {
                opacity: 0.5;
            }
        }
        .u-check-box.is-active {
            border: 1px solid #d9e1ff;
            background: #f2f3ff;
            color: var(--td-brand-color);
        }
    }
    .t-chat-sender__button .t-chat-sender__button__default {
        border-radius: 4px !important;
        &::after {
            border-style: solid;
        }
    }

    .t-button::after {
        border-style: none;
    }
}
</style>
