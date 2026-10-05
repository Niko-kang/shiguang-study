# 自己账号里的云端数据库

此目录是独立 Cloudflare Worker 接口，数据库创建在网站所有者自己的 Cloudflare 账号。它不调用 ChatGPT Sites、OpenAI API 或原数据库。网页继续托管在 GitHub Pages。

## 当前状态

代码与建表脚本已准备。尚未创建云端账号、实际数据库，也未迁移历史记录或切换在线网页。

## 部署

1. 在 https://dash.cloudflare.com/sign-up 注册个人账号并验证邮箱，选择免费方案。
2. 在 Workers & Pages 导入 GitHub 仓库 `Niko-kang/shiguang-study`，根目录选择 `/`，构建命令 `npm run check:api`，部署命令 `npm run deploy:api`。
3. 创建 D1 数据库 `shiguang-study-records`，将数据库 ID 填入根目录 `wrangler.jsonc` 的 `d1_databases[0].database_id`；不要填旧平台的数据库 ID。若部署向导已自动创建、绑定 D1，则使用它生成的配置。
4. 部署后检查 `https://实际的Worker域名/health` 返回 `ok: true`。
5. 导出旧站的三类记录，核对条数后导入新库，再核对读取结果；导入仅使用 INSERT，遇到冲突中止，绝不覆盖已有记录。
6. 将前端构建变量 `VITE_API_ORIGIN` 改为实际 Worker 地址，移除原站错误提示入口，再构建并发布 GitHub Pages。
7. 在新网址实测打卡、错题、成绩的新增、修改、刷新和跨设备同步；全部通过后才停止使用旧记录入口。

也可以本地部署：`npx wrangler login` → `npx wrangler d1 create shiguang-study-records` → 将返回 ID 填入配置 → `npm run deploy:api`。

数据库的绑定和账号授权留在 Cloudflare。GitHub 仓库不保存密钥或学习记录。当前沿用用户要求的免登录共享访问：知道网站地址的人可以查看、修改记录；CORS 来源限制不是身份验证。

## 迁移记录

执行 `node scripts/export-records.mjs https://旧站域名`，将原站全部公开学习记录（包括归档）写入忽略的 `backups/` 文件夹。若任一接口失败，脚本报错退出，不会用空数组冒充已导出。

确认快照条数后，在空的新库执行 `npx wrangler d1 execute DB --remote --file=backups/导出时间/import.sql`。导入前检查数据；不要将备份提交到 GitHub。迁移期间暂停在旧站编辑，导入后逐项核对。

免费额度及平台行为以 Cloudflare 官方说明为准：https://developers.cloudflare.com/workers/platform/pricing/

## 已完成的本地验证

独立 D1 初始化、三类记录读写、进度顺延、版本冲突、错题/成绩归档与恢复、无效日期及分数拒绝、GitHub 来源跨域预检均通过。本地测试数据已清除。类型检查、前端构建和 Worker 部署打包检查通过；尚未进行云端部署和历史数据迁移。
