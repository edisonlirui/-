# Vercel 部署指南

## 部署步骤

### 方法1：通过 Vercel CLI（推荐）

1. **安装 Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **进入 admin 目录**
   ```bash
   cd admin
   ```

4. **部署**
   ```bash
   vercel
   ```
   
   按提示操作：
   - Set up and deploy? Yes
   - Which scope? 选择你的账号
   - Link to existing project? No
   - What's your project's name? 输入项目名（如：taobao-admin）
   - In which directory is your code located? ./

5. **完成**
   - 部署成功后会显示一个 URL
   - 格式：https://taobao-admin.vercel.app

### 方法2：通过 GitHub（推荐用于持续更新）

1. **创建 GitHub 仓库**
   - 访问 https://github.com/new
   - 创建新仓库（如：taobao-admin）
   - 不要初始化 README

2. **上传代码到 GitHub**
   ```bash
   cd admin
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/你的用户名/taobao-admin.git
   git push -u origin main
   ```

3. **在 Vercel 导入项目**
   - 登录 https://vercel.com/dashboard
   - 点击「Add New Project」
   - 选择 GitHub 仓库
   - 点击「Import」

4. **配置项目**
   - Framework Preset: Other
   - Root Directory: ./ (保持默认）
   - Build Command: (留空）
   - Output Directory: (留空）
   - 点击「Deploy」

5. **自动部署**
   - 每次推送到 GitHub，Vercel 自动重新部署
   - 非常方便

### 方法3：通过 Vercel 网页界面（最简单）

1. **打包 admin 目录**
   - 在 Windows：右键 admin 文件夹 → 发送到压缩包
   - 在 Mac/Linux：`zip -r admin.zip admin/`

2. **登录 Vercel**
   - 访问 https://vercel.com/dashboard
   - 点击「Add New Project」

3. **上传项目**
   - 选择「Upload」选项
   - 上传 zip 文件
   - 填写项目信息：
     - Project Name: taobao-admin
     - Framework: Other
   - 点击「Deploy」

## 部署后配置

1. **获取部署 URL**
   - 在 Vercel 项目页面可以看到
   - 格式：https://your-project.vercel.app

2. **访问后台**
   - 在浏览器中输入：https://your-project.vercel.app/admin.html
   - 例如：https://taobao-admin.vercel.app/admin.html

3. **配置淘宝 API**
   - 在后台管理页面填写淘宝联盟 AppKey 和 AppSecret
   - 保存配置

## 注意事项

1. **数据存储**
   - Vercel 是无服务器环境，不支持持久化文件存储
   - `admin/data/` 目录的数据在部署后不会持久化
   - 建议改造为连接微信云数据库

2. **环境变量**
   - 如果需要配置环境变量，在 Vercel 项目设置中添加
   - Settings → Environment Variables

3. **自定义域名（可选）**
   - 在 Vercel 项目设置中添加自定义域名
   - 需要配置 DNS

4. **更新部署**
   - 使用 GitHub 方法：推送代码自动部署
   - 使用 CLI 方法：运行 `vercel --prod`
   - 使用上传方法：重新上传 zip 文件

## 常见问题

### 部署后数据丢失
- Vercel 每次部署会重置文件系统
- 解决方案：改造为使用微信云数据库

### 端口问题
- Vercel 自动处理端口，无需修改代码
- 默认使用 3000 端口

### 访问 404
- 检查 URL 是否正确
- 确认 admin.html 文件存在

## 推荐方案

**使用方法2（GitHub）最推荐**，因为：
- 部署自动化
- 版本管理方便
- 完全免费
- 支持持续部署
- 可以回滚到历史版本