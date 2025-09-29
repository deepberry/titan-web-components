import { $erp, $service } from "../utils/api";
// 用户提问
export function ask(data) {
    return $service().post(`/intelligence/ask`, data);
}

// 配肥助手提问
export function askFer(data) {
    return $erp().post(`erp/fertilizer/ai/ask`, data);
}

// 语音识别asr
export function getASR(data) {
    return $service().post(`/voice/asr`, data);
}

export const fetchAskFerUrl = `${process.env.VUE_APP_SERVICE_API}api/erp/erp/fertilizer/ai/ask`;

export const fetchAskUrl = `${process.env.VUE_APP_SERVICE_API}api/cms/intelligence/ask`;

export const fetchTtsUrl = `${process.env.VUE_APP_SERVICE_API}api/cms/open/tts/ali/stream`;
