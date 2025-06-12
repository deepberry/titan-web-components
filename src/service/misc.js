import { $service } from "../utils/api";

// 加载公告
export async function getAc(key) {
    const res = await $service().get(`/misc/announcement`, { params: { key } });
    return res.data?.data || {};
}
