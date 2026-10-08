# 仓库协作规则

-   默认使用中文沟通。
-   编写 Vue 组件时，除非用户另有要求，使用 Vue 3 Options API。

## 样式文件命名

-   样式文件及 `src/assets/css` 下的目录统一使用小写 kebab-case，单词之间用 `-` 连接，例如 `robot-live/controller.less`、`common/pay-pop.less`。
-   此规则适用于 `.css`、`.less`、`.scss`、`.sass`、`.styl`；不修改第三方依赖或生成产物的命名。
-   重命名时同步更新组件、样式导入、Storybook、构建配置和文档中的引用，并检查大小写是否精确匹配，避免 Linux 构建失败。

-   组件库共享样式 token 使用 `titan-` 前缀及小写 kebab-case，例如 `@titan-navy`、`@titan-primary-dark`；不要使用业务应用名作为共享 token 前缀。重命名须同步定义、引用和文档，保持取值不变。

## Less 与样式维护

新增或修改 `.less` 和 Vue 的 `<style lang="less">` 时，遵循 [Less 样式规范](docs/less-style-guide.md)。

-   用组件命名空间和 Less 嵌套组织样式，提取公共父选择器，避免逐条重复完整选择器链。
-   同一元素的状态、伪类和伪元素用 `&.is-active`、`&:hover`、`&::before`；子元素保留后代或 `>` 关系。
-   区分 `&__element`（拼接类名）与 `.component__element`（后代选择器），不能为了缩短代码改变选择器含义或优先级。
-   Teleport / Popper 弹层使用独立的组件专属入口；共享样式可用并列父选择器包装，不依赖原组件的 DOM 祖先。
-   纯样式重构保持规则顺序、优先级和行为不变，验证 Less 编译结果；涉及视觉变化时检查相关交互状态。
-   按当前任务范围逐步整理存量样式，不附带全仓库重写。

## CodeGraph

如果仓库根目录存在 `.codegraph/`，理解或定位代码时，先使用 `codegraph_explore`（可用时）或 `codegraph explore "问题或符号"`，再进行文本搜索和文件阅读。没有 `.codegraph/` 时跳过，不自行建立索引。
