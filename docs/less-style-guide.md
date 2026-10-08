# Less 样式规范

本规范适用于仓库中的 `.less` 文件和 Vue 单文件组件的 `<style lang="less">`。新增样式和修改附近的相关规则时采用嵌套写法，减少重复前缀，并保持 DOM 关系与 CSS 层叠行为清晰。

## 文件与目录命名

样式文件及 `src/assets/css` 内的目录使用全小写 kebab-case，多个单词用 `-` 连接。此规则同样适用于 CSS、SCSS、Sass 和 Stylus 文件。

-   `Common/Panel/Index.less` → `common/panel/index.less`
-   `RobotLive/Controller.less` → `robot-live/controller.less`
-   `paypop.less` → `pay-pop.less`

新文件不使用 PascalCase、camelCase 或下划线。保持组件文件原有命名；第三方依赖和构建产物不手动重命名。文件移动时同步更新所有导入、Storybook、构建配置和文档引用，确认路径大小写与磁盘一致。macOS 上仅大小写不同的重命名应经过临时路径，确保 Git 可以记录，且 Linux 可以正常解析。

## 公共父选择器只写一次

将同一作用域内的规则放在公共父选择器下。基础声明直接写在块中，不额外包一层 `& {}`。通常保持 2 ～ 4 层嵌套；必要时保留简短的组合选择器，避免机械映射每一层 DOM。

```less
.c-titan-sidebar .c-titan-sidebar__menu {
    .el-menu-item {
        border-radius: 8px;

        &.is-active {
            color: @titan-accent;
        }

        &:hover {
            background: rgba(255, 255, 255, 0.08);
        }
    }

    .el-sub-menu.is-opened {
        > .el-sub-menu__title {
            .el-sub-menu__icon-arrow {
                transform: rotateZ(180deg);
            }
        }
    }
}
```

相邻且共享作用域的规则优先合并。若合并会改变覆盖顺序，可以保留分开的作用域块；不要为了只出现一次父选择器而改变层叠结果。

## 正确使用 `&`

-   `&.is-active`、`&:hover`、`&::before` 表示当前元素的状态或伪元素。
-   `.child` 表示后代；`> .child` 表示直接子元素。保持原来的空格与子代关系。
-   `&__title` 只拼接类名，不建立父子关系。

```less
.c-card {
    &__title {
        // 编译为 .c-card__title，优先级为一个类。
        font-weight: 600;
    }

    .c-card__title {
        // 编译为 .c-card .c-card__title，优先级为两个类。
        min-width: 0;
    }

    &.is-collapsed {
        .c-card__title {
            display: none;
        }
    }
}
```

不要把已有的 `.c-card .c-card__title` 直接改成 `&__title`，两者的匹配范围和优先级不同。状态块里的 `&` 包含当前完整选择器，也不要在 `&.is-collapsed` 内用 `&__title` 拼接子元素类名。

## 弹层与共享样式

Element Plus Popper、Dialog 或其他 Teleport 内容可能挂载到 `body`。它们的样式需要组件专属的 `popper-class` 等入口，不能只嵌套在原组件根节点下，也不能无作用域地覆盖全局 `.el-menu-item`。

```less
.c-titan-sidebar,
.c-titan-sidebar__popper {
    .c-titan-sidebar__menu-entry {
        display: inline-flex;
        align-items: center;
        gap: 12px;
    }
}

.c-titan-sidebar__popper {
    &.el-popper {
        border: 1px solid #dbe3ee;
        border-radius: 12px;
        box-shadow: 0 14px 36px rgba(15, 23, 42, 0.12);
    }

    .el-menu--popup {
        border: 0;
        border-radius: 12px;
        box-shadow: none;
    }
}
```

检查组件库实际 DOM：同一节点的多个类用 `&.class`，内部节点用 `.class`。弹层边框和阴影由一层负责，避免内外容器叠加。共享声明优先使用并列父选择器；只有存在真正可复用的声明组合时才抽取 mixin，避免不必要的 `:extend` 和选择器扩张。

## 变量命名

组件库共享 Less token 使用 `@titan-` 前缀，后接小写短横线名称，例如 `@titan-navy`、`@titan-primary-dark`、`@titan-page-bg`。共享 CSS 自定义属性若需要命名空间，也使用 `--titan-`。不要在组件库共享 token 中使用业务应用名作为前缀；第三方变量（如 `--el-*`）保留原名。

变量重命名应同时修改定义、所有引用与文档示例，保持颜色等实际取值不变，并比较编译结果。

## 变量、格式与验证

-   优先复用现有 Less tokens 和 CSS 自定义属性；仅引用变量或 mixin 时可用 `@import (reference)`。
-   使用仓库 Prettier 配置（4 空格缩进）。不要为覆盖样式随意增加 `!important` 或祖先层级；已有依赖在纯重构中保持不变。
-   纯嵌套重构：修改前后分别编译 Less，比较输出中的选择器、声明和顺序，确保一致。保留之前已经完成的功能修复。
-   可独立编译的文件使用 `node_modules/.bin/lessc 文件路径 输出路径`；依赖构建注入变量或 Vue 作用域转换的样式，使用对应项目构建验证。
-   实际改变视觉样式时，检查默认、hover、active、focus、展开、折叠和弹层状态；未做浏览器验证时如实说明。

现有示例见 `src/assets/css/common/sidebar/index.less` 和 `src/assets/css/common/sidebar/menu.less`。
