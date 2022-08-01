# Titan web components

泰坦业务公共组件模块  
范围：用于 titan 项目和小程序

## Get Started

### Install

```shell
npm install @deepberry/titan-web-components
```

### Import

#### A.局部引入单个组件

```javascript
import { RobotLive } from "@deepberry/titan-web-components";
export {components : RobotLive}
```

#### B.全局引入单个组件

```javascript
import { RobotLive } from "@deepberry/titan-web-components";
app.component("RobotLive", RobotLive);
```

#### C.全局引入全部组件

```javascript
import TitanUI from "@deepberry/titan-web-components";
app.use(TitanUI);
```

### API Reference

查看对应组件属性与事件等  
https://admin.deepberry.cn/titan-web-components

## Dev

### 新增组件

1. src/components/下创建
2. src/stories 下编写 story
3. index.js 添加 export

### 本地调试

```shell
npm install
npm run serve
npm run storybook
```

## Todo

-   [ ] 测试模块
