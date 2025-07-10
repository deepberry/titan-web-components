import { $uc, $titan, $service } from "../utils/api";

// 获取个人信息
export function getProfile() {
    return $uc().get(`user/info`);
}

// 领取super token
export function getSuperToken(data) {
    return $uc().post(`account/token/super`, data);
}

// 获取用户所有组织
export function getAllOrganization() {
    return $titan().get(`organization`);
}

// 获取当前用户组织
export function getCurrentOrganization() {
    return $uc().get(`user/organization`);
}

// 切换组织
export function switchOrg(id) {
    return $uc().put(`user/organization`, {
        organization_id: id,
    });
}

// 更新偏好设置
export function updatePreference(data) {
    return $titan().put(`/user/preference`, data);
}

// 获取时区
export function getTimeZoneList(params) {
    return $titan().get("/conf/timezone", { params });
}

// 消息中心 获取用户未读消息
export function getMessageUnRead() {
    return $titan().get(`/user/message/count`);
}

// 联系客服提交quote
export const addQuotation = (data) => {
    return $service().post("/www/quotation", data);
};

// 获取菜单栏
export const getMenus = (params) => {
    return $titan().get(`/system/menu`, { params });
};

// 获取用户调查记录
export const getSurveys = () => {
    return $titan().get(`/user/survey`);
};

// 用户提交调查
export const submitSurvey = (id, data) => {
    return $titan().post(`/user/survey/${id}`, data);
};
