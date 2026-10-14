# 侧边栏说明

本文记录 titan-web-components 当前侧边栏实现及菜单约定。更新日期：2026-10-14。

## 组件与配置入口

| 文件                                                   | 职责                                        |
| ------------------------------------------------------ | ------------------------------------------- |
| `src/components/Common/Layout.vue`                     | 应用外壳，将 `menuList`、用户资料传给侧边栏 |
| `src/components/Common/Sidebar/Index.vue`              | 获取菜单、计算高亮与展开、处理跳转及折叠    |
| `src/components/Common/Sidebar/MenuNode.vue`           | 递归渲染分组和菜单项，支持禁用及角标        |
| `src/components/Common/Sidebar/Brand.vue`              | 企业品牌展示                                |
| `src/constants/AomsSidebar.js`                         | 菜单规范化、图标和翻译、静态预览菜单        |
| `src/constants/aoms/routes.json`                       | 默认菜单的路由骨架、权限及显示元数据        |
| `src/constants/aoms/fallback-menus.js`                 | 静态预览和菜单补充配置                      |
| `src/constants/aoms/permission.js`                     | 生成菜单、排序、高亮及祖先展开              |
| `src/constants/aoms/route-access.js`、`user-access.js` | 权限和管理员身份判断                        |
| `src/constants/aoms/zh-cn.json`、`en-us.json`          | 菜单中英文文案                              |
| `src/router/index.ts`                                  | 组件库展示用路由，不加载业务页面            |

## 菜单来源和扩展方式

`CommonSidebar` 接收 `menuList`、`user`、`preview`、`mobileExpanded`。

-   传入非空值的 `menuList`：直接规范化并显示该列表，不执行默认菜单生成、权限过滤或排序。传入 `[]` 会显示空菜单。
-   `menuList` 为 `null`（默认）：请求 `getMenus()`，即 Titan 服务的 `system/menu`；将响应的 `data.data` 交给 `resolveSidebarMenus(remoteMenus, user)`。
-   请求失败时使用空接口菜单继续生成；不代表所有菜单都会显示，仍受路由权限控制。
-   默认生成以本地 `routes.json` 为骨架。接口菜单通过路径或权限码补充标题、顺序、禁用状态等，不能单凭接口数据增加本地未定义的路由。
-   `aomsPreviewMenus` 使用 `fallbackMenus` 和超级管理员身份生成，用于静态展示。不能将这份全量预览菜单直接当作普通用户的授权菜单。
-   `preview` 主要控制预览相关行为，本身不绕过权限；不传 `menuList` 时仍会加载菜单。

### 侧边栏没有 slot

当前 `CommonSidebar` 没有菜单扩展 slot，`CommonLayout` 也没有转发侧边栏 slot。现有自定义菜单接口是 `menuList`，并且它替换整个菜单列表，而非自动追加。

宿主要追加菜单时，先准备已完成权限过滤的完整列表，再合并自定义项并传入：

```vue
<CommonLayout :menu-list="sidebarMenus">
    <router-view />
</CommonLayout>
```

`sidebarMenus` 应包含原菜单与扩展菜单，并由宿主按最终顺序排列。侧边栏支持 `path` 或 `link`、`title` 或 `zh_name`、`children` 等字段；建议使用统一的 `path`、`title`、`menuIndex`、`icon`、`disabled` 格式。

### 顶部工具栏的扩展 slot

`CommonLayout` 的 `#extend` 属于顶部工具栏，不会将内容放入侧边栏。转发链为：

`CommonLayout #extend` → `CommonHeader #extend` → `CommonHeaderTools #extend` → `HeaderExtend` 默认 slot。

```vue
<CommonLayout :menu-list="sidebarMenus">
    <template #extend>
        <button type="button" @click="openCustomTool">扩展工具</button>
    </template>
    <router-view />
</CommonLayout>
```

`#right` 也用于顶部工具栏；`#header`、`#user`、`#banner` 均不是侧边栏插槽。未来若需要侧边栏 slot，应明确新增接口并在 Layout 中转发，不能直接使用 `#extend`。

## 当前顶层顺序

这是全量预览顺序，实际用户可能因权限而缺少部分分组。

| 顺序 | 菜单     | 路径或分组标识   | 状态                             |
| ---- | -------- | ---------------- | -------------------------------- |
| 1    | 控制台   | `/`              | 可用                             |
| 2    | 生产管理 | `/production`    | 整组禁用，保留子菜单配置         |
| 3    | 环控管理 | `/environment`   | 可用                             |
| 4    | 作业管理 | `/tasks`         | 禁用占位，不展示子菜单           |
| 5    | 采收管理 | `/harvest`       | 可展开，子项分别控制禁用         |
| 6    | 物资管理 | `/materials`     | 禁用占位，不展示子菜单           |
| 7    | 园区管理 | `/uc/park`       | 按权限显示                       |
| 8    | 人员管理 | `/uc/staff`      | 按权限显示                       |
| 9    | 薪资管理 | `/uc/employment` | 按权限显示                       |
| 10   | 资源中心 | `/resources`     | 按权限显示                       |
| 11   | 系统设置 | `/system`        | 仅超级管理员                     |
| 12   | 开发配置 | `/insights/conf` | 超级管理员或 `nav_insights` 权限 |

控制台保持最前；“生产管理第一个”指控制台后的第一组。“采收管理”紧随作业管理。全量菜单末尾依次为资源中心、系统设置、开发配置。

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

系统设置继承 `superAdmin: true`，仅超级管理员显示。第一项是“全局设置”，地址 `/uc/system/setting`；AOMS PC 的 `/system/settings` 不要求与这里一致。其后依次为账号配置、角色配置、通知配置、公告管理、审计日志。

开发配置是顶层末项，地址 `/insights/conf`，权限码 `nav_insights`。不要设置 `superAdmin: true`，否则单独拥有该权限的普通用户也会被排除。

旧 Insights 路由声明过 `requiredAuth: true` 和 `slug: nav_insights`，但参考项目中的旧菜单权限过滤已被注释。这里使用当前组件库的 `meta.permission` 实现可见规则。

## 权限、跳转和展示行为

-   超级管理员：`user.is_founder` 为 `true` 或数值 1，或 `user.role.is_super` / `user.Role.is_super` 为数值 1。
-   组织管理员：另通过组织 `user_id` / `userId` 与用户 id 相等判断；组织管理员不会自动获得超级管理员菜单。
-   默认侧边栏权限来自接口菜单中的字符串、`code`、`permission`，并合并 `user.permissions`。数组形式的路由权限满足任意一项即可。
-   `public` 路由不进入默认菜单；无 `name` 的节点不生成自身菜单；`menu: false` 不显示自身。
-   `menuList` 绕过上述默认过滤，宿主必须自行处理权限及禁用占位规则。
-   默认高亮先看 `activeMenu`，再按当前 URL 匹配最长可用菜单路径；展开组通过菜单树查找。
-   点击禁用项无效；`is_blank` 使用新窗口；宿主 Router 能匹配的内部地址使用 `router.push`，其他地址使用 `location.href`。
-   禁用或隐藏入口只控制导航，不代替宿主路由守卫及后端鉴权。`canAccessRoute` 和侧边栏的权限入参应由宿主保持一致。
-   中文默认；英语从 `en-us.json` 取 `titleKey` 文案。标题翻译优先于配置的 `title`。
-   图标优先使用 `src/assets/img/aoms` 中同名 SVG，找不到时使用默认图标；直接传入的本地或远程图标也有对应处理。
-   `badgeCount` / `badgeTone` 可用于角标；`decorateMenuBadgeCounts` 可按子项汇总。默认菜单生成不自动读取业务数量，宿主应在生成菜单后装饰并通过 `menuList` 传入。
-   展开宽度 232px，折叠宽度 76px；折叠状态写入 `titan_sidebar_collapse`。移动端条件为宽度不超过 1023px，支持外壳的紧凑模式展开。

## 维护与验证

菜单变化通常需要同步 `routes.json`、`fallback-menus.js`、中英文文案和必要图标。修改 `menuList` 接入时，同时核对宿主是否绕过默认权限过滤。

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
