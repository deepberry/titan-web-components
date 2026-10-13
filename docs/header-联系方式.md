# 公共头部：联系方式

头像菜单点击“联系方式”打开 `QuickSupport.vue` 弹窗，展示售前咨询电话、售后支持邮箱、技术支持邮箱及企业微信客服二维码。

## 后台配置

内容维护入口：[后台公告与配置](https://admin.deepberry.cn/cms/misc/announcement)。联系方式对应以下 key：

-   `support_before`：售前咨询电话，多条用空格分隔。
-   `support_after`：售后支持邮箱，多条用空格分隔。
-   `support_tech`：技术支持邮箱，多条用空格分隔。

后台维护入口由业务负责人确认；字段名称和空格分隔规则已与 `QuickSupport.vue` 核对。前端最终读取正式 CDN 配置文件，后台修改如何同步到该文件及同步时效尚未核验。

企业微信二维码当前使用固定图片地址，不由上述三个 key 控制。

## 数据来源

联系方式固定请求正式配置：

`GET https://cdn.deepberry.cn/common/system/conf/titan_default.json`

不使用 `VUE_APP_*` 环境地址，也不读取 `titan_default_conf` 会话缓存。因此开发、预览及正式构建均读取相同的正式配置。

| 配置字段         | 用途         |
| ---------------- | ------------ |
| `support_before` | 售前咨询电话 |
| `support_after`  | 售后支持邮箱 |
| `support_tech`   | 技术支持邮箱 |

字段按空格拆分为多条展示，不在组件中写死电话和邮箱。2026-10-13 核对正式配置：售前电话为 0731-85313833、0731-85866833，售后邮箱为 aries@deepberry.cn，技术支持邮箱为 jimifish@deepberry.cn；后续以正式配置实时内容为准。

二维码固定使用 `https://cdn.deepberry.cn/titan/qrcode/db_kf_qrcode.png`。

## 请求时机与异常

组件挂载时获取正式配置，使用独立 Axios 请求，不主动附加用户 token 或跨域凭证。请求失败时记录错误，不回退到开发环境缓存；联系信息初始为空，二维码仍可显示。

弹窗关闭后再次打开是否重新请求取决于组件是否重新挂载；目前弹窗没有 `destroy-on-close`，已挂载后通常保留数据，不会每次打开都刷新。

## 实现位置

-   `src/components/Common/Header/User2.vue`：菜单入口与弹窗显示状态。
-   `src/components/Common/Header/QuickSupport.vue`：正式配置获取、联系方式展示和二维码。

本次只调整联系方式弹窗的数据来源，不修改其他功能读取默认配置的方式。
