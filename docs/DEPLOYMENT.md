# 部署到 GitHub Pages

仓库已包含 `.github/workflows/deploy-pages.yml`。在 GitHub 仓库中打开 **Settings → Pages**，将 Source 设为 **GitHub Actions**。之后每次推送到 `main`，部署工作流会构建并发布网站。

默认地址为：`https://spectator66.github.io/FocusBoard/`。

本地开发不受部署路径影响：运行 `npm run dev` 后打开终端显示的地址即可。
