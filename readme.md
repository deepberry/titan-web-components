# Titan web components

泰坦业务公共组件模块  
范围：用于 titan PC Web、小程序、客户端

## Get Started

### Install

私有包安装请先参考此[设置](https://github.com/deepberry/docs/blob/master/packages/install.md)

```shell
npm install @deepberry/titan-web-components
```

### Import

#### 全部引入

```js
import TitanUI from "@deepberry/titan-web-components";
app.use(TitanUI);
```

#### 部分引入

```js
import RobotLive from "@deepberry/titan-web-components/src/components/RobotLive/Index.vue";
```

### International

```html
<TitanConfigProvider locale="enUs">
    <!-- components -->
</TitanConfigProvider>
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
