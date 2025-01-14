# RobotLive 模块组

## 控制器

-   [x] 控制器是一套简单的 UI，固定了根据不同的按钮，发送对应的动作执行事件
-   [x] mac 下图标异常，点击区域优化
-   [x] **接口错误返回包格式待确认以修改 camera/robot.vue 中的错误 err.message**

## 相机控制器

-   [x] 建立连接，并向服务器发送`CommandCamera`指令与动作值。

## 机器人控制器

-   [x] 建立连接，并向服务器发送`CommandRobot`指令与动作值。
-   [x] **当前服务端接口实现的动作与产品有缺少**

## 视频直播

-   [ ] 可增加一个封面动画。`cover`。
-   [ ] 增加直播连接状态 log 增强用户体验。
-   [ ] 选项式改写，方便暴露与 ref。

## 预览与测试

-   [ ] mdx 兼容问题 https://github.com/storybookjs/storybook/issues
-   [ ] 真实有效参数模拟

## 其它

-   [ ] beacon 上报中心
