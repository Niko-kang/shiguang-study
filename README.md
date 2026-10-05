# 小翁自习室

2027 备考网站：首页封面、总览、每日学习计划、学习进度、书单、关键时间节点、错题本、模拟考试。

首页采用奶油色与深绿色的书桌插画封面，鼓励文字与入口兼顾电脑、手机阅读。点击内页左上角“小翁自习室”返回封面；原有子页面地址保留。插画为本地 SVG，不依赖外部图片或字体服务。

- 网站：https://niko-kang.github.io/shiguang-study/
- 云端同步接口：https://shiguang-study-api.niko-kang.workers.dev

## 数据存在哪里

GitHub Pages 负责页面展示。打卡、错题、模拟成绩和复盘保存在网站所有者自己的 Cloudflare 账号内，数据库为 `shiguang-study-records`（D1），同步接口为 `shiguang-study-api`（Worker）。网站运行不再依赖 ChatGPT Sites 的接口或数据库。

本站无需登录，知道网址的访问者可查看、修改同一份学习记录；CORS 来源限制不是身份验证。网页每 30 秒及重新获得焦点时同步，也可以手动同步。仓库不包含用户记录、数据库文件或密钥。模拟考试倒计时仍保存在当前浏览器标签页的 sessionStorage 中，不跨设备同步。

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

## 云端维护

见 [云端部署与备份说明](cloud/README.md)。修改接口后运行 `npm run check:api` 和 `npm run deploy:api`；仅修改页面不需要重新部署接口。

## 迁移与验证

2026-10-05 已将原站的 1 条学习进度迁移并核对，原站当时没有错题或模拟考试记录。原数据库保留，后续修改以本网站的新云端数据为准，不与旧站双向同步。迁移备份保存在本地忽略的 `backups/` 目录。

新接口已通过线上健康检查、三类记录读写、顺延、归档与恢复、版本冲突、无效日期与分数拒绝，以及 GitHub 来源的 CORS 预检验证。临时测试记录已清理。接口请求测试使用本机已配置的网络代理；其他设备和网络的实际可达性尚未逐一验证。同步失败时页面会提示重试，不会将失败的保存显示为成功。
