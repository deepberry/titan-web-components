import { $uc, $titan2 } from "../utils/api";

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
    return $titan2().get(`organization`);
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
