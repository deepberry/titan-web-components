# 公共头部：组织切换

本文按 2026-10-14 本地代码核对，覆盖本组件库、`service-uc`、`service-titan` 和 `titan-greenhouse` 的相关实现；未验证线上部署、实际账号或接口返回。

## 权限与切换范围

**平台超管可以切换任意组织，不要求先加入目标组织。** 公共头部以 `profile.token.is_super` 判断平台超管，使用独立的组织选择弹窗和指定组织 token 接口。

这里的平台超管与组织创始人、组织内 `level = 99` 管理员，以及 AOMS 业务角色中的 `role.is_super` 是不同概念。不能用组织管理员或业务角色替代头部的判断字段。

| 账号类型                                  | 头部入口                 | 组织列表                 | 切换方式                          |
| ----------------------------------------- | ------------------------ | ------------------------ | --------------------------------- |
| 平台超管（`profile.token.is_super` 为真） | 点击组织名称打开弹窗     | Titan 全部组织列表       | 为当前账号领取目标组织的 V2 token |
| 非平台超管                                | 点击组织名称打开下拉菜单 | 当前账号已加入的正常组织 | 修改账号的激活组织，再刷新 token  |

普通下拉菜单中，当前组织显示勾选和“当前”标记，并禁止重复选择；`item.disabled` 为真的条目也禁止选择。UC 的组织列表查询关联 `organization.disabled = 0`，因此被禁用的组织不进入普通用户列表。

超管弹窗的 `GET /api/titan/organization` 在当前后端实现中没有传入过滤条件，也没有分页；前端不按成员关系或 `disabled` 再过滤。列表显示 `组织名称(ID:组织ID)`，支持 Element Plus 的本地筛选，不是远程搜索。不能把该列表描述为“仅正常组织”。

## 普通用户流程

1. `Index.vue` 请求 `GET /api/uc/user/info` 获取个人资料；存在 `profile.id` 时，再请求 `GET /api/uc/user/organization` 获取组织列表。
2. `Org.vue` 选择目标组织，调用 `PUT /api/uc/user/organization`，请求体为 `{ organization_id }`。
3. UC 校验账号是否属于目标组织；不属于时返回业务错误 `20005`。成功后将该账号原激活组织设为非激活，将目标组织设为激活。
4. 前端触发 `changeOrg`，随后 `User.refreshToken()` 调用 `POST /api/titan/account/token/refresh`，保存返回的 token 并执行 `location.reload()`。

这条路径修改账号的激活组织关系。组织列表的筛选与后端切换时的校验应分别理解：当前切换控制器检查成员关系，不能仅凭列表过滤推断接口也单独校验了组织禁用状态。

## 平台超管流程

1. `Org.vue` 打开 `OrgSwitchPop.vue`。每次 `modelValue` 变为真，弹窗请求 `GET /api/titan/organization`，读取 `res.data.data`。
2. 选择组织后点击“确认”；尚未选择（`value === ''`）时确认按钮禁用。“取消”和右上角关闭按钮只关闭弹窗，不调用切换接口。
3. 调用 `POST /api/uc/account/token/super`，请求体为 `{ organization_id: value }`。
4. UC 使用当前账号 `uid` 和指定组织 `oid` 签发 V2 token，并保留规范化后的登录 `mode`。控制器不检查目标组织成员关系；这不是登录为目标组织创始人，也不是给账号添加组织成员关系。
5. 返回 `{ v2_token, created_at }`，前端写入 `sessionStorage.old_org_id`、触发 `changeOrg`，然后 `User.update()` 保存 token 并刷新整页。

该接口没有返回新的 V1 token，原 V1 token 不会在本次超管切换中被替换。超管组织信息由 UC 根据 token 的 `oid` 读取；没有目标组织成员记录时，资料中的 `level` 回退为 `99`。

超管切换没有修改成员关系中的激活组织。后续重新登录或走未显式保留目标 `oid` 的 token 刷新流程时，不能假定仍停留在该临时组织。

## 事件与宿主页面

组织切换事件沿 `Org.vue → Tools.vue → Index.vue` 传递，公共头部最终发出 `change`，内容为 `{ type: 'org' }`。该事件发生在切换接口成功之后、token 更新和整页刷新之前，不代表新的身份信息已加载完毕。宿主不应在这个事件中假定所有后续请求已经使用新 token。

`old_org_id` 虽然名字包含“old”，实际保存的是**选中的目标组织 ID**，只在超管弹窗流程写入。`titan-greenhouse` 的 `NodeIndex.vue` 检测该标记后清理原组织的节点查询参数，只保留当前 tab，并删除标记；`OrgSwitchPop.vue` 挂载时也会清理残留标记。该机制依赖宿主读取与组件挂载的时序，不是公共头部通用的路由清理保证；普通用户切换不会写入这个标记。

## 移动端与预览

常规组织按钮通过 `Org.vue` 区分两类账号。`compactMobile` 在宽度不超过 1023px 时将工具区放入头像弹层。

当前 `User2.vue` 另有手机菜单“切换组织”入口（初始化宽度小于 768px 且非 compact），该入口经 `Index.vue.changeOrg()` 直接调用 `showOrgSwitch()`，没有再次判断平台超管。因此它会打开超管弹窗，不能当作普通用户下拉切换的等价入口；这是现有实现的注意项，本次文档未修改逻辑。

`preview` 仅让头部使用 `previewProfile` 和 `previewOrganizations`，跳过初始化个人资料与组织列表请求。组织切换组件没有独立的预览请求拦截：打开超管弹窗或确认切换仍可能调用实际接口，预览并非完整的无副作用模式。

## 维护时需注意

-   **后端授权边界**：UC 的 super token 路由声明 `user_authorization.super_mode = true`，Titan 的全部组织路由声明 `authorization.super_mode = true`。但当前两个授权插件在处理该配置之前，已允许平台超管、组织创始人和 `level = 99` 管理员通过。因此不能把 `super_mode` 配置描述为已严格限制“只有平台超管”。前端按钮判断也不能替代后端鉴权；如需收紧接口，应单独修正和验证后端。
-   **目标合法性**：当前 UC super token 控制器未显式查询目标组织是否存在或禁用，路由仅校验组织 ID 为必填整数。正常 UI 从组织列表选择，不代表接口本身具备完整的目标有效性校验。
-   **token 来源优先级**：`User.update()` 写入 localStorage 的 `TOKEN_TITAN_V2`、`created_at`；`User.getToken()` 优先读取 URL 临时 token，其次 sessionStorage，最后 localStorage。宿主存在 URL 或会话 token 时，不能仅凭本地写入成功判断请求已经切到新组织。
-   **失败与重复提交**：当前没有切换专用 loading、重复提交锁或失败后回滚；错误提示依赖请求拦截器。只有 token 更新成功才执行整页刷新。普通路径存在“激活组织已改但 token 刷新失败”，超管路径存在“切换事件已发出但 token 保存失败”的中间状态。
-   **再次打开**：超管弹窗会重新获取列表，但没有清空上次的 `value`；当前组织也未被排除或禁选。因此重新打开时可能保留已选组织，也允许再次领取同一组织 token。
-   **关闭按钮样式**：`.el-dialog.m-org-switch .el-dialog__headerbtn` 使用 32×32px 点击区域，通过 flex 水平、垂直居中图标；hover 背景仍使用原样式。

## 实现位置

-   本库 `src/components/Common/Header/Index.vue`：资料加载、组织列表、公共事件和手机入口转发。
-   本库 `src/components/Common/Header/Org.vue`：账号分流与普通用户切换。
-   本库 `src/components/Common/Header/OrgSwitchPop.vue`：超管组织弹窗、领取 token 和刷新。
-   本库 `src/components/Common/Header/Tools.vue`、`User2.vue`：工具区和头像菜单入口。
-   本库 `src/service/account.js`、`src/utils/api.js`、`src/utils/user.js`：接口路径、请求 token 和本地保存。
-   `service-uc/app/routes/account/token.js`、`app/controllers/account/token.js`：super token 接口。
-   `service-uc/app/controllers/user/user.js`、`app/service/user/user_organization.js`：普通组织列表、成员关系与激活组织。
-   `service-uc/vendors/sdk-rxs/auth/jwt_user/service.js`、`plugins/user_authorization/index.js`：token 签发与授权。
-   `service-titan/app/routes/enterprise/organization.js`、`app/controllers/enterprise/organization.js`、`app/service/enterprise/organization.js`、`app/plugins/authorization.js`：全部组织列表与授权。
-   `titan-greenhouse/src/views/insights/node/NodeIndex.vue`：组织切换后的节点查询参数清理。
