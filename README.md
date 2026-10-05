# 拾光自习室

2027 备考网站：总览、每日学习计划、学习进度、书单、关键时间节点、错题本、模拟考试。

- 网站：https://niko-kang.github.io/shiguang-study/
- 原网站与共享接口：https://mpa-study-2027.nikolakang.chatgpt.site

## 数据存在哪里

GitHub Pages 负责页面展示。打卡、错题、模拟成绩和复盘仍保存在原网站的 Cloudflare D1 数据库，两个网址读取同一份数据。本站不需要账号，访问者共享学习记录。仓库不包含用户记录、数据库文件或密钥。模拟考试倒计时保存在当前浏览器标签页的 sessionStorage 中，不跨设备同步。

原网站的接口服务必须保持运行；GitHub Pages 本身不能运行数据库或服务端接口。原服务已允许本站的 GitHub Pages 来源跨域访问。

## 本地开发与发布

需要 Node.js 22.13 或以上。

```sh
npm ci
npm run dev
npm run build
npm run publish
```

`npm run publish` 将构建结果发布到同仓库 `gh-pages` 分支，GitHub Pages 再自动上线。发布要求已有该仓库的 Git 推送权限。源码在 `main` 分支；修改后先提交并推送源码，再执行发布。Pages 设置使用 `gh-pages` 分支根目录。

主要内容位于 `app/plan.json`、`app/plan-content.ts` 和 `app/overview/page.tsx`，公共样式为 `app/globals.css` 与 `app/unified.css`。接口地址由 `lib/urls.ts` 管理，也可用公开的构建变量 `VITE_API_ORIGIN` 覆盖。该变量只能放接口地址，不可放密钥。

所有子页面输出独立入口，支持直接访问与刷新。导航链接已适配 GitHub 项目路径 `/shiguang-study/`。

## 发布核验

GitHub Pages 构建与部署成功，类型检查、七个子页面入口和本地页面渲染通过。原接口跨域允许来源与预检逻辑已部署并通过本地测试；当前测试环境的线上请求被 Cloudflare 拦截，尚未完成 GitHub 新域名下的真实同步验证。如页面无法连接，会显示错误和“打开原站记录”入口，不会把未保存的记录当成已同步。

## 独立云端迁移（待账号就绪）

已准备在你自己的 Cloudflare 账号部署数据库与同步接口的代码，见 [部署与迁移步骤](cloud/README.md)。尚未切换线上数据源，现有数据不会因此被覆盖。
