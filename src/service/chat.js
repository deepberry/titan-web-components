import { $erp, $cms, resolveServiceUrl } from "../utils/api";
// 用户提问
export function ask(data) {
    return $cms().post(`/intelligence/ask`, data);
}

// 配肥助手提问
export function askFer(data) {
    return $erp().post(`erp/fertilizer/ai/ask`, data);
}

// 语音识别asr
export function getASR(data) {
    return $cms().post(`/voice/asr`, data);
}

export const fetchAskFerUrl = resolveServiceUrl("erp", "/api/erp/erp/fertilizer/ai/ask");

export const fetchAskUrl = resolveServiceUrl("cms", "/api/cms/intelligence/ask");

export const fetchTtsUrl = resolveServiceUrl("cms", "/api/cms/open/tts/ali/stream");
