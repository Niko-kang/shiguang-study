# 自己账号里的云端数据库

此目录是独立 Cloudflare Worker 接口，数据库创建在网站所有者自己的 Cloudflare 账号。它不调用 ChatGPT Sites、OpenAI API 或原数据库。网页继续托管在 GitHub Pages。

## 当前状态

2026-10-05 已部署到网站所有者的 Cloudflare 账号：

- Worker：`shiguang-study-api`
- 接口：`https://shiguang-study-api.niko-kang.workers.dev`
- 健康检查：`https://shiguang-study-api.niko-kang.workers.dev/health`
- D1：`shiguang-study-records`，绑定名称 `DB`
- 已迁移 1 条学习进度；原站错题、模拟考试记录均为 0 条。

根目录 `wrangler.jsonc` 已填写当前账号与数据库 ID。这些 ID 不是密钥；授权凭证由 Wrangler 保存在本机，不提交仓库。现有数据库无需重新创建。

## 更新接口

1. 安装依赖：`npm ci`。
2. 授权到当前数据库所属账号：`npx wrangler login`。需要账号读取、Workers 脚本部署和 D1 权限。
3. 检查与部署：`npm run check:api`，再运行 `npm run deploy:api`。
4. 确认上述健康检查返回 `ok: true`，并验证网页读取与保存。

前端默认指向此 Worker，可用构建变量 `VITE_API_ORIGIN` 覆盖。更换接口域名后需重新构建并发布 GitHub Pages。当前通过 Wrangler 手动部署 Worker，GitHub 提交本身不会自动更新接口。

数据库的绑定和账号授权留在 Cloudflare。GitHub 仓库不保存密钥或学习记录。当前沿用用户要求的免登录共享访问：知道网站地址的人可以查看、修改记录；CORS 来源限制不是身份验证。

## 备份与迁移记录

执行 `node scripts/export-records.mjs https://shiguang-study-api.niko-kang.workers.dev`，将三类学习记录（包括归档）写入忽略的 `backups/` 文件夹。若任一接口失败，脚本报错退出，不会用空数组冒充已导出。需要能够访问该接口的网络环境。

本次迁移快照位于本地 `backups/sites-migration-2026-10-05/`，未提交 GitHub。原平台数据库仍保留，但网站之后只使用新库，两者不会继续同步。

恢复备份前先另做当前库备份并核对条数。生成的 `import.sql` 仅适合导入空库，使用 INSERT、遇冲突中止；不要直接在当前生产库重复执行，也不要将备份提交到 GitHub。

免费额度及平台行为以 Cloudflare 官方说明为准：https://developers.cloudflare.com/workers/platform/pricing/

## 验证

本地及线上接口的三类记录读写、进度顺延、版本冲突、错题/成绩归档与恢复、无效日期及分数拒绝、GitHub 来源跨域预检均通过。云端历史记录已核对；临时测试数据已清理。线上接口测试使用本机配置的网络代理，尚未验证所有设备和网络的直接可达性。
