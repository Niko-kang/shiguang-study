# 小翁自习室

2027 备考网站：首页封面、总览、每日学习计划、学习进度、书单、关键时间节点、错题本、模拟考试。

首页采用奶油色与深绿色的书桌插画封面，鼓励文字与入口兼顾电脑、手机阅读。点击内页左上角“小翁自习室”返回封面；原有子页面地址保留。插画为本地 SVG，不依赖外部图片或字体服务。

- 网站：https://niko-kang.github.io/shiguang-study/
- 云端同步：腾讯云 CloudBase（上海），环境 `test-d0giyte5vc61eca7e`

## 数据存在哪里

GitHub Pages 负责页面展示。学习进度、错题、模拟成绩和复盘保存在网站所有者自己的腾讯云 CloudBase 上海环境，文档集合为 `study_progress` 和 `study_entries`，同步函数为 `shiguang-study-api`。浏览器使用匿名会话调用云函数，无需手动登录；数据库禁止浏览器直接读写。网站运行不依赖 ChatGPT Sites 或 Cloudflare 数据服务。

本站无需登录，知道网址的访问者可查看、修改同一份学习记录；匿名会话和安全域名限制不提供私人访问隔离。网页每 30 秒及重新获得焦点时同步，也可以手动同步。仓库不包含用户记录、数据库文件或密钥。模拟考试倒计时仍保存在当前浏览器标签页的 sessionStorage 中，不跨设备同步。

## 本地开发与发布

需要 Node.js 22.13 或以上。

```sh
npm ci
npm run dev
npm run build
npm run publish
```

`npm run publish` 将构建结果发布到同仓库 `gh-pages` 分支，GitHub Pages 再自动上线。发布要求已有该仓库的 Git 推送权限。源码在 `main` 分支；修改后先提交并推送源码，再执行发布。Pages 设置使用 `gh-pages` 分支根目录。

主要内容位于 `app/plan.json`、`app/plan-content.ts` 和 `app/overview/page.tsx`，公共样式为 `app/globals.css` 与 `app/unified.css`。生产环境的公开配置在 `.env.production`，同步适配位于 `lib/tencent.ts`。该文件只包含环境 ID 和地域，不可放管理员密钥。开发时可以使用相同的 VITE 配置，开发来源需加入 CloudBase 安全域名。

所有子页面输出独立入口，支持直接访问与刷新。导航链接已适配 GitHub 项目路径 `/shiguang-study/`。

## 云端维护

见 [腾讯云部署与迁移说明](cloud/tencent/README.md)。腾讯云函数更新前运行类型检查和测试，再构建部署；仅修改网页不必更新函数。`cloud/` 根目录下的 Cloudflare 实现作为迁移前备份保留，旧接口已禁止写入，避免旧标签页产生分叉记录。

## 迁移与验证

2026-10-05 将原 Cloudflare 的 1 条学习进度迁移到腾讯云，逐字段核对日期、状态、版本和更新时间；原站没有错题和模拟考试记录。备份保存在本地忽略的 `backups/tencent-cutover-20261005/`。旧库保留为只读，不与新库双向同步。

本地构建、接口测试、腾讯云函数健康检查和实际成绩读写/冲突/归档恢复已通过；匿名浏览器已验证进度保存和成绩显示。上线后仍需按真实访问网络验证，GitHub Pages 在国内的可达性独立于数据库所在地。

个人版当前有效期至 2026-11-05 23:59:59（北京时间），自动续费和超额按量计费关闭。到期前需手动续费以继续同步。
