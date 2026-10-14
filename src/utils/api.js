import { createApiClient } from "@deepberry/common/js/api";
import { ElMessage, ElMessageBox, ElNotification } from "element-plus";
import User from "./user";

const client = createApiClient({
    getToken: (version) => User.getToken({ version }),
    // 保留组件库原有语义：业务 code 由组件处理，只统一提示 HTTP/网络错误。
    validateResponse: false,
    onError(message, popType) {
        if (popType === "alert") ElMessageBox.alert(message, "错误");
        else if (popType === "notify") ElNotification({ title: "错误", message, duration: 3000 });
        else ElMessage({ message, type: "error" });
    },
});

export const { $uc, $titan, $cms, $admin, $erp, resolveServiceUrl } = client;
// 兼容现有应用的公开导入，新代码使用服务名。
export { $titan as $titan2, $cms as $service };
