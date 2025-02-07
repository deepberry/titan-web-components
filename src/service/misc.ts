import { $cms } from "../utils/api";

// 加载公告
export async function getAc(key: string) {
    const res = await $cms().get(`/misc/announcement`, { params: { key } });
    return res.data?.data || {};
}
