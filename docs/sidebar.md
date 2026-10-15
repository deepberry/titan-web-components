# 侧边栏说明

本文记录 titan-web-components 当前侧边栏实现及菜单约定。更新日期：2026-10-15。

## 职责边界与统一接入

整个侧边栏逻辑由公共库闭环维护。业务库直接引入 `CommonLayout`，不定义、复制或拼装侧边栏菜单，也不使用预览菜单替代真实用户菜单。

公共库统一负责菜单请求、路由骨架、身份与权限码过滤、扩展功能、排序、图标与翻译、线上隐藏配置、高亮与展开、折叠与移动端控制，以及切换组织后的重新加载。新增菜单规则应修改本库，不在 UC、AOMS 等业务库增加另一套过滤或兜底逻辑。

```vue
<template>
    <CommonLayout :title="title">
        <router-view />
    </CommonLayout>
</template>

<script>
import CommonLayout from "@deepberry/titan-web-components/src/components/Common/Layout.vue";

export default {
    components: { CommonLayout },
    computed: {
        title() {
            return this.$route.meta?.title || "";
        },
    },
};
</script>
```

业务库负责真实业务页面、路由与兼容别名、页面无权限占位及后端鉴权；菜单显示不代表接口授权。登录成功暂时直接跳转站点根路径 `/`，由业务库的登录流程落实，真实首页去向后续另行统一。

### 已确认的可见规则

| 菜单                      | 规则                                                                                                       |
| ------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 控制台 `/`                | 所有登录用户均可见，无额外业务权限码要求                                                                   |
| 系统设置 `/system`        | `is_founder = 1`、`is_super = 1` 或超级管理员角色，满足任一条件即可                                        |
| 开发配置 `/insights/conf` | 独立顶层菜单，仅 `is_dev = 1` 或 `is_super = 1` 可见；单独的 `is_founder` 不放行，不依赖 `nav_insights`    |
| 扩展功能                  | 对所有用户开放；有真实自定义项才显示，开发环境额外提供保底演示项                                           |
| 其它业务菜单              | 保留现有权限码过滤、禁用、占位和线上隐藏规则，权限码可能隐藏组或入口；业务页面另行处理访问鉴权和无权限占位 |

身份字段统一由本库解析：开发者读取 `user.token.is_dev`，缺失时读取 `user.is_dev`；超级身份读取 `user.token.is_super`，缺失时读取 `user.is_super`，也识别 `user.role.is_super` / `user.Role.is_super` 的超级管理员角色。标记按数值 1 判断，避免将字符串 `"0"` 当成已授权。

## 组件与配置入口

| 文件                                                   | 职责                                       |
| ------------------------------------------------------ | ------------------------------------------ |
| `src/components/Common/Layout.vue`                     | 应用外壳，统一提供用户资料与侧边栏刷新能力 |
| `src/components/Common/Sidebar/Index.vue`              | 获取菜单、计算高亮与展开、处理跳转及折叠   |
| `src/components/Common/Sidebar/MenuNode.vue`           | 递归渲染分组和菜单项，支持禁用及角标       |
| `src/components/Common/Sidebar/Brand.vue`              | 企业品牌展示                               |
| `src/constants/AomsSidebar.js`                         | 菜单规范化、图标和翻译、静态预览菜单       |
| `src/constants/aoms/routes.json`                       | 默认菜单的路由骨架、权限及显示元数据       |
| `src/constants/aoms/fallback-menus.js`                 | 静态预览和菜单补充配置                     |
| `src/constants/aoms/permission.js`                     | 生成菜单、排序、高亮及祖先展开             |
| `src/constants/aoms/route-access.js`、`user-access.js` | 权限和管理员身份判断                       |
| `src/constants/aoms/zh-cn.json`、`en-us.json`          | 菜单中英文文案                             |
| `src/router/index.ts`                                  | 组件库展示用路由，不加载业务页面           |

## 菜单来源和扩展方式

`CommonSidebar` 接收 `menuList`、`user`、`preview`、`mobileExpanded`。

-   传入非空值的 `menuList`：直接规范化并显示该列表，不执行默认菜单生成、权限过滤或排序。传入 `[]` 会显示空菜单。
-   `menuList` 为 `null`（默认）：请求 `getMenus()`，即 Titan 服务的 `system/menu`；将响应的 `data.data` 交给 `resolveSidebarMenus(remoteMenus, user)`。
-   请求失败时使用空接口菜单继续生成；不代表所有菜单都会显示，仍受路由权限控制。
-   默认生成以本地 `routes.json` 为骨架。接口菜单通过路径或权限码补充标题、顺序、禁用状态等，不能单凭接口数据增加本地未定义的路由。
-   `aomsPreviewMenus` 使用 `fallbackMenus` 和预览身份生成，仅用于本库展示与测试。业务库禁止将其传给 `menuList`，否则会绕过真实用户的身份与权限判断。
-   `preview` 主要控制预览相关行为，本身不绕过权限；不传 `menuList` 时仍会加载菜单。

### 侧边栏没有 slot

当前 `CommonSidebar` 没有菜单扩展 slot，`CommonLayout` 也没有转发侧边栏 slot。现有自定义菜单接口是 `menuList`，并且它替换整个菜单列表，而非自动追加。

`menuList` 是已有的整树覆盖能力，保留用于本库展示、测试等受控场景，不作为业务库的标准接入方式。它会绕过默认菜单生成和身份权限判断，因此 UC、AOMS 等业务库不应传入该属性，也不应自行调用 `resolveSidebarMenus` 维护第二份菜单状态。

业务扩展通过 Titan `system/menu` 接口维护，由公共侧边栏自动识别并放入“扩展功能”组。真实自定义项需包含 `user_id` 与 `organization_id`，支持 `id`、`slug`、`title` / `zh_name`、`link` / `path`、`icon`、`sort` / `order`、`is_blank` 等字段。自定义项不能授予内置业务权限或覆盖内置菜单元数据。

新增、编辑、删除或排序菜单后，菜单管理页面注入公共布局提供的 `refreshCustomMenus` 并调用；不另写菜单请求、缓存或组织切换逻辑：

```js
export default {
    inject: { refreshCustomMenus: { from: "refreshCustomMenus", default: () => {} } },
    methods: {
        async afterSave() {
            await this.refreshCustomMenus();
        },
    },
};
```

不得继续使用 UC 本地的 `refreshUcCustomMenus`。切换组织由公共侧边栏监听 `user.organization.id` 后重新请求；请求序号用于防止旧组织响应覆盖新组织菜单。

### 顶部工具栏的扩展 slot

`CommonLayout` 的 `#extend` 属于顶部工具栏，不会将内容放入侧边栏。转发链为：

`CommonLayout #extend` → `CommonHeader #extend` → `CommonHeaderTools #extend` → `HeaderExtend` 默认 slot。

```vue
<CommonLayout>
    <template #extend>
        <button type="button" @click="openCustomTool">扩展工具</button>
    </template>
    <router-view />
</CommonLayout>
```

`#right` 也用于顶部工具栏；`#header`、`#user`、`#banner` 均不是侧边栏插槽。未来若需要侧边栏 slot，应明确新增接口并在 Layout 中转发，不能直接使用 `#extend`。

## 当前顶层顺序

这是全量预览顺序，实际用户可能因权限而缺少部分分组。

| 顺序 | 菜单     | 路径或分组标识   | 状态                               |
| ---- | -------- | ---------------- | ---------------------------------- |
| 1    | 控制台   | `/`              | 可用                               |
| 2    | 生产管理 | `/production`    | 整组禁用，保留子菜单配置           |
| 3    | 环控管理 | `/environment`   | 可用                               |
| 4    | 作业管理 | `/tasks`         | 禁用占位，不展示子菜单             |
| 5    | 采收管理 | `/harvest`       | 可展开，子项分别控制禁用           |
| 6    | 物资管理 | `/materials`     | 禁用占位，不展示子菜单             |
| 7    | 园区管理 | `/uc/park`       | 按权限显示                         |
| 8    | 人员管理 | `/uc/staff`      | 按权限显示                         |
| 9    | 薪资管理 | `/uc/employment` | 按权限显示                         |
| 10   | 资源中心 | `/resources`     | 按权限显示                         |
| 11   | 系统设置 | `/system`        | 创始标记、超级身份或超级管理员角色 |
| 12   | 开发配置 | `/insights/conf` | `is_dev` 或 `is_super`             |

控制台保持最前；“生产管理第一个”指控制台后的第一组。“采收管理”紧随作业管理。有扩展功能时插入系统设置前；完整末尾顺序为资源中心、扩展功能、系统设置、开发配置。

默认生成按 `order` / `sort` 升序排列，同序时按标题排列；接口提供的顺序优先于路由元数据。直接传入 `menuList` 则保持宿主给定顺序。

## 特殊菜单约定

### 环控管理：子项不使用父路径前缀

| 子项     | 地址                      |
| -------- | ------------------------- |
| 设备管理 | `/greenhouse`             |
| 监控大盘 | `/monitor`                |
| 配肥助手 | `/lab/fertilization/form` |

`/environment` 是分组路径，其子项使用独立绝对地址。定位展开组时应按菜单树寻找祖先，不能按 URL 前缀推断。

### 采收管理：跨系统入口和未开放项

-   深莓轻采收：`/erp`，启用。
-   好易称：暂未配置地址，`disabled: true`。
-   通过 `mockChildren` 配置展示子项，规范化后成为渲染用 `children`。这里的 `mockChildren` 承载真实跨系统导航，不仅是演示数据。
-   `/erp` 在组件库预览路由中有隐藏的展示记录；正式业务页面由宿主系统提供。

### 禁用分组、占位分组、隐藏分组不同

-   生产管理：`meta.disabled: true`，保留子路由和子菜单；`el-sub-menu` 绑定 `disabled`，分组不能展开。禁用导航不会禁止直接访问业务 URL。
-   作业管理、物资管理：同时设置 `meta.placeholder: true` 和 `meta.disabled: true`。默认生成仍显示顶层分组，但跳过子菜单及 `mockChildren`，作为后续建设占位。
-   水印相机：父路由及所有子路由均设 `meta.menu: false`，整组不显示；路由保留。
-   仅隐藏父路由不够：默认生成遇到 `menu: false` 父节点时会将可见子节点提升到上一层，所以隐藏整组必须同时隐藏子项。
-   禁用由路由 `meta.disabled` 或补充菜单的 `disabled` 任一为真决定。

### UC 三组：同步 AOMS 元数据，地址增加 `/uc`

园区管理、人员管理、薪资管理以 AOMS PC 的 `park.js`、`staff.js`、`employment.js` 为参考，组件库不导入 AOMS 业务组件。

-   将 AOMS 原始地址加 `/uc`，例如 `/staff/workers` → `/uc/staff/workers`。
-   同步菜单名、图标、权限和显隐状态；详情页、绝对子路由、重定向及 `activeMenu` 同样加前缀。
-   园区管理：园区档案、空间结构、空间地图、空间预览、空间终端。
-   人员管理：人员档案、技能配置、班组配置、评级配置、安全培训。
-   薪资管理：当前仅显示薪酬结算（`/uc/employment/payroll-settlements`），其他页面路由保留但隐藏。
-   组件库 JSON 不能保存函数重定向；同步时需单独转换。当前薪资组入口为固定薪酬结算地址，旧安全培训入口指向 `/uc/staff/safety-training`；正式宿主应处理自己的动态权限跳转和 query 保留。

### 资源中心：仅三个可见子项

1. 知识库：`/resources/agent`，禁用。
2. 文件管理：`/resources/files/assets`，权限 `resource:file`。
3. 文档管理：`/resources/documents`，权限 `resource:document`。

父图标 `resource`，子图标依次为 `resource-ai`、`resource-file`、`resource-document`，与 AOMS PC 一致。不加入相册、水印等入口。

### 系统设置与开发配置

系统设置继承 `superAdmin: true`，由 `isSuperAdmin` 判断：允许 `is_founder`、超级身份或超级管理员角色。第一项是“全局设置”，地址 `/uc/system/setting`；其后依次为账号配置、角色配置、通知配置、公告管理、审计日志。业务库通过路由别名兼容公共路径，不改写菜单树。

开发配置是独立顶层末项，地址 `/insights/conf`，标记 `meta.developer: true`。菜单和共享路由权限函数都要求开发者或超级身份，不使用 `nav_insights` 授权，也不因单独的 `is_founder` 标记放行。它不属于系统设置组，不继承该组的身份规则。

## 权限、跳转和展示行为

-   身份判断集中于 `user-access.js`：`isSuperUser` 识别超级身份与超级管理员角色，`isSuperAdmin` 另允许 `is_founder`，`isDeveloper` 识别开发者。系统设置与开发配置按各自规则使用，不能混用。
-   组织管理员：另通过组织 `user_id` / `userId` 与用户 id 相等判断；组织管理员不会自动获得超级管理员菜单。
-   默认侧边栏权限来自接口菜单中的字符串、`code`、`permission`，并合并 `user.permissions`。数组形式的路由权限满足任意一项即可。
-   `public` 路由不进入默认菜单；无 `name` 的节点不生成自身菜单；`menu: false` 不显示自身。
-   `menuList` 绕过上述默认过滤；业务库不传入，以确保公共库的规则实际生效。
-   默认高亮先看 `activeMenu`，再按当前 URL 匹配最长可用菜单路径；展开组通过菜单树查找。
-   点击禁用项无效；`is_blank` 使用新窗口；宿主 Router 能匹配的内部地址使用 `router.push`，其他地址使用 `location.href`。
-   禁用或隐藏入口只控制导航，不代替宿主路由守卫及后端鉴权。`canAccessRoute` 和侧边栏的权限入参应由宿主保持一致。
-   中文默认；英语从 `en-us.json` 取 `titleKey` 文案。标题翻译优先于配置的 `title`。
-   图标优先使用 `src/assets/img/aoms` 中同名 SVG，找不到时使用默认图标；直接传入的本地或远程图标也有对应处理。
-   `badgeCount` / `badgeTone` 可用于角标；`decorateMenuBadgeCounts` 可按子项汇总。默认菜单生成不自动读取业务数量。如需业务角标，应在公共库增加统一的数据接入能力，业务库不通过覆盖整份菜单实现。
-   展开宽度 232px，折叠宽度 76px；折叠状态写入 `titan_sidebar_collapse`。移动端条件为宽度不超过 1023px，支持外壳的紧凑模式展开。

## 维护与验证

菜单变化通常需要同步 `routes.json`、`fallback-menus.js`、中英文文案和必要图标。接入验证须确认业务库未传 `menuList`、未引用 `aomsPreviewMenus`，且未自行请求或拼装侧边栏菜单。

运行现有检查：

```sh
node --test tests/aoms-sidebar.test.cjs
```

测试覆盖顶层顺序、权限、禁用占位、水印隐藏、UC 前缀、跨组展开及预览路由。静态测试通过不代表正式宿主的业务页面、鉴权或跨应用跳转已经验证。

## 菜单 slug 与隐藏标识清单

`slug` 是独立的小写英文单词，`sidebarKey` 是用于隐藏配置的完整标识，不替代权限 `code`、点击标识 `menuIndex` 或路径。标识维护在 `src/constants/aoms/sidebar-settings.js`，不要随显示文案修改。以下按菜单顺序列出，实际展示仍受权限及禁用占位规则控制。

### 一级菜单

| 名称     | slug / 隐藏标识 | 路径             |
| -------- | --------------- | ---------------- |
| 控制台   | `home`          | `/`              |
| 生产管理 | `production`    | `/production`    |
| 环控管理 | `environment`   | `/environment`   |
| 作业管理 | `tasks`         | `/tasks`         |
| 采收管理 | `harvest`       | `/harvest`       |
| 物资管理 | `materials`     | `/materials`     |
| 园区管理 | `parks`         | `/uc/park`       |
| 人员管理 | `staff`         | `/uc/staff`      |
| 薪资管理 | `payroll`       | `/uc/employment` |
| 资源中心 | `resources`     | `/resources`     |
| 扩展功能 | `extensions`    | 无，仅分组       |
| 系统设置 | `system`        | `/system`        |
| 开发配置 | `developer`     | `/insights/conf` |

### 子项

| 所属分组 | 名称       | slug            | 隐藏标识                 | 路径                                 | 说明                     |
| -------- | ---------- | --------------- | ------------------------ | ------------------------------------ | ------------------------ |
| 生产管理 | 作物配置   | `crops`         | `production.crops`       | `/production/crops`                  | —                        |
| 生产管理 | 种植计划   | `plans`         | `production.plans`       | `/production/cycles`                 | —                        |
| 生产管理 | 产量预测   | `forecast`      | `production.forecast`    | `/production/yield-forecast`         | —                        |
| 生产管理 | 生产核算   | `accounting`    | `production.accounting`  | `/production/accounting`             | —                        |
| 环控管理 | 设备管理   | `devices`       | `environment.devices`    | `/greenhouse`                        | —                        |
| 环控管理 | 监控大盘   | `monitor`       | `environment.monitor`    | `/monitor`                           | —                        |
| 环控管理 | 配肥助手   | `fertilizer`    | `environment.fertilizer` | `/lab/fertilization/form`            | —                        |
| 作业管理 | 作业标准   | `standards`     | `tasks.standards`        | `/tasks/work-standards`              | 预留，当前父组为禁用占位 |
| 作业管理 | 任务指派   | `assignments`   | `tasks.assignments`      | `/tasks/task-assignment`             | 预留，当前父组为禁用占位 |
| 作业管理 | 作业看板   | `board`         | `tasks.board`            | `/tasks/work-board`                  | 预留，当前父组为禁用占位 |
| 作业管理 | 作业异常   | `exceptions`    | `tasks.exceptions`       | `/tasks/work-exceptions`             | 预留，当前父组为禁用占位 |
| 作业管理 | 质量验收   | `quality`       | `tasks.quality`          | `/tasks/quality-acceptance`          | 预留，当前父组为禁用占位 |
| 采收管理 | 深莓轻采收 | `erp`           | `harvest.erp`            | `/erp`                               | —                        |
| 采收管理 | 好易称     | `weighing`      | `harvest.weighing`       | 无                                   | 禁用                     |
| 物资管理 | 业务办理   | `workbench`     | `materials.workbench`    | `/materials/workbench`               | 预留，当前父组为禁用占位 |
| 物资管理 | 经营看板   | `overview`      | `materials.overview`     | `/materials/overview`                | 预留，当前父组为禁用占位 |
| 物资管理 | 库存管理   | `inventory`     | `materials.inventory`    | `/materials/inventory`               | 预留，当前父组为禁用占位 |
| 物资管理 | 物资溯源   | `trace`         | `materials.trace`        | `/materials/trace`                   | 预留，当前父组为禁用占位 |
| 物资管理 | 基础资料   | `catalog`       | `materials.catalog`      | `/materials/master-data`             | 预留，当前父组为禁用占位 |
| 园区管理 | 园区档案   | `profiles`      | `parks.profiles`         | `/uc/park/profiles`                  | —                        |
| 园区管理 | 空间结构   | `structure`     | `parks.structure`        | `/uc/park/space-config`              | —                        |
| 园区管理 | 空间地图   | `map`           | `parks.map`              | `/uc/park/space-map`                 | —                        |
| 园区管理 | 空间预览   | `preview`       | `parks.preview`          | `/uc/park/space-qr`                  | —                        |
| 园区管理 | 空间终端   | `terminal`      | `parks.terminal`         | `/uc/park/space-terminal`            | —                        |
| 人员管理 | 人员档案   | `workers`       | `staff.workers`          | `/uc/staff/workers`                  | —                        |
| 人员管理 | 技能配置   | `skills`        | `staff.skills`           | `/uc/staff/job-types`                | —                        |
| 人员管理 | 班组配置   | `teams`         | `staff.teams`            | `/uc/staff/teams`                    | —                        |
| 人员管理 | 评级配置   | `ratings`       | `staff.ratings`          | `/uc/staff/rating-config`            | —                        |
| 人员管理 | 安全培训   | `training`      | `staff.training`         | `/uc/staff/safety-training`          | —                        |
| 薪资管理 | 薪酬结算   | `settlements`   | `payroll.settlements`    | `/uc/employment/payroll-settlements` | —                        |
| 资源中心 | 知识库     | `knowledge`     | `resources.knowledge`    | `/resources/agent`                   | 禁用                     |
| 资源中心 | 文件管理   | `files`         | `resources.files`        | `/resources/files/assets`            | —                        |
| 资源中心 | 文档管理   | `documents`     | `resources.documents`    | `/resources/documents`               | —                        |
| 扩展功能 | 自定义项   | `demo`          | `extensions.demo`        | `https://deepberry.cn`               | 仅 dev 环境              |
| 系统设置 | 全局设置   | `settings`      | `system.settings`        | `/uc/system/setting`                 | —                        |
| 系统设置 | 账号配置   | `accounts`      | `system.accounts`        | `/system/accounts`                   | —                        |
| 系统设置 | 角色配置   | `roles`         | `system.roles`           | `/system/roles`                      | —                        |
| 系统设置 | 通知配置   | `notifications` | `system.notifications`   | `/system/webhook`                    | —                        |
| 系统设置 | 公告管理   | `announcements` | `system.announcements`   | `/system/notice`                     | —                        |
| 系统设置 | 审计日志   | `logs`          | `system.logs`            | `/system/audit-logs`                 | —                        |

### 使用方式

```json
{
    "sidebar": {
        "hidden": ["harvest", "environment.monitor", "system.announcements"]
    }
}
```

公共布局 CommonLayout 和 CommonSidebar 接受响应式 `sidebarSettings` 配置：

```vue
<CommonLayout :sidebar-settings="globalSettings.sidebar" />
```

`harvest` 隐藏整组；`environment.monitor` 和 `system.announcements` 分别隐藏监控大盘及公告管理。子项全部隐藏后自动移除空组；本来没有子项的占位菜单保留。配置缺失、`hidden` 非数组或未知标识不会影响其他菜单，配置变化会重新计算菜单。显式传入 `menuList` 时同样应用过滤。隐藏只控制导航展示，不替代鉴权。

纯函数入口：`resolveSidebarMenus(menus, user, { hidden })` 或 `applySidebarSettings(menuTree, { hidden })`。返回新菜单树，不修改输入，也不修改原有权限和路由。

扩展功能组标识为 `extensions`。真实自定义菜单可提供稳定的单词 `slug`，完整标识为 `extensions.<slug>`；未提供 slug 时可以通过 `extensions` 隐藏整组。dev 演示项为 `extensions.demo`，新窗口打开 `https://deepberry.cn`。

公共侧边栏挂载时统一请求 `https://cdn.deepberry.cn/common/system/conf/titan_default.json`，读取 `sidebar_menu_forbidden` 字符串并按英文逗号拆分、去除空格和重复项。例如 `production,task` 隐藏生产管理和作业管理；`task` 兼容为 `tasks`。支持子项完整标识，例如 `environment.monitor`。dev 预览和显式 menuList 也应用此配置。线上隐藏列表与 sidebarSettings.hidden 合并；请求失败或超时不阻塞导航。
