# smallyuan.dev 個人主頁設計

- 日期：2026-10-05
- 狀態：待審閱
- 視覺樣稿：[`2026-10-05-homepage-mockup.html`](./2026-10-05-homepage-mockup.html)（Artifact：https://claude.ai/artifact/VBQ32tbCiEos9rUkRYRSQm ，Version 3）

## 1. 目的

`smallyuan.dev` 是 SmallYuan 這個人的主頁，不是作品集或專案入口。

訪客看完要記得兩件事：

1. 他把生活裡的麻煩事做成好玩的東西。
2. 他很會用 AI agent（Claude Code、Codex）寫程式、做東西。

受眾依優先順序：招募者或客戶（求職、接案）→ 想認識他的人（名片）→ 對作品或 skills 有興趣的人 → 讀筆記的人。

### 範圍

**這次要做**：單頁主頁、中英雙語、部署到 `smallyuan.dev`。

**這次不做**（之後各自另開設計）：
- Skills 目錄頁與公開 skills repo（專案 2，含「skill 轉譯器」）
- 筆記／部落格頁
- 履歷頁

主頁上不放尚未完成的頁面連結，不出現「Coming soon」。

## 2. 內容

### 2.1 段落結構（由上往下）

| # | 段落 | 內容 |
|---|---|---|
| ① | 導覽列 | `SmallYuan`；中 / EN 切換 |
| ② | 開場 | 身分一行、主標、我怎麼做事 |
| ③ | 麻煩事展示 | 左：示範對話卡；右：「麻煩事 → 做成的東西」清單 |
| ④ | 連結 | GitHub（之後加 Feiyu skills） |
| ⑤ | 聯絡 | `yuan@smallyuan.dev`（附複製按鈕） |

### 2.2 文案

- 身分：全端與軟體工程師 · Full-stack & software engineer
- 主標：我把生活裡的麻煩事，一件一件做成好玩的東西。／ I turn everyday chores into things that are fun to build.
- 我怎麼做事（初稿）：我寫程式的方式，是跟 Claude Code、Codex 這些 agent 一起寫。想到什麼麻煩，就讓 agent 幫我把它變成一個會自己動的小系統。

正式文案在實作時由 Claude 起草、SmallYuan 挑選修改。

### 2.3 露出範圍

- 可以出現：飛予（以「我做的個人 AI 助理」角度）、自架 Minecraft 伺服器等遊戲相關作品（以工程角度）。
- 不出現：貓、作息、吃藥、記帳金額、住址或所在區域、Home Assistant 實體 ID、任何私人帳號資訊。
- 示範對話中的數字與地點一律使用不洩漏實際生活的內容。

### 2.4 聯絡方式

- GitHub：https://github.com/SmallYuanSY
- Email：`yuan@smallyuan.dev`（Cloudflare Email Routing 轉寄至個人 Gmail，2026-10-05 已確認可轉寄）。網站上不出現個人 Gmail 地址。

## 3. 視覺

- 深色為主（單一深色主題，刻意不做淺色）。
- Apple Liquid Glass 風格：背景三團緩慢飄動的柔光（藍、橘、紫），其上為半透明毛玻璃面板（`backdrop-filter: blur() saturate()`），面板上緣一道高光。
- 主標的「好玩的東西」用暖色漸層文字強調，全頁只有這一處強調。
- 字體：中文 Noto Sans TC；英文 Inter Tight；程式風格的小字用 IBM Plex Mono。
- 不支援 `backdrop-filter` 的瀏覽器：顯示為半透明深色面板，版面不變。
- `prefers-reduced-motion`：背景柔光停止飄動。
- 手機寬度（約 400px）：兩張卡片改為上下堆疊。

## 4. 架構

### 4.1 技術

- **Astro**（靜態輸出，預設不送 JavaScript 到瀏覽器）。
- **Cloudflare Pages** 部署：GitHub repo 推上 `main` 後自動建置上線。網域 `smallyuan.dev` 已在 Cloudflare。
- 瀏覽器端 JavaScript 只用在三處：中英切換的記憶、麻煩事清單與對話卡的連動、複製 email。

### 4.2 專案結構

```
smallyuan.dev/
  src/
    content/
      chores/            # 每件麻煩事一個 .md（見 4.3）
    content.config.ts    # chores 集合的 schema
    i18n/
      zh.ts  en.ts       # 介面文字與段落文案
    components/
      Nav.astro
      Hero.astro
      ChoreShowcase.astro   # 對話卡 + 清單
      Contact.astro
    layouts/Base.astro
    pages/
      index.astro        # 中文 /
      en/index.astro     # 英文 /en/
    styles/tokens.css    # 色彩、字體、玻璃效果 tokens
  public/                # favicon、OG 圖
  docs/superpowers/specs/
```

### 4.3 「麻煩事」資料格式

每件麻煩事是 `src/content/chores/<slug>.md`，只有 frontmatter：

```yaml
order: 1                      # 清單順序，數字小的在前
skill: presence               # 對應 skill 名稱；非 skill 作品填 project；可省略
link: https://github.com/...  # 可省略；之後 skills repo 上線可由 skill 名稱自動產生
from: { zh: 出門回家要開關冷氣燈光, en: Turning the AC and lights on and off }
to:   { zh: 說「我出門了」就全部處理好, en: Say "heading out" and it's handled }
chat:                         # 示範對話，2～4 則
  - { who: me,    zh: 我要出門了, en: Heading out }
  - { who: tool,  items: { zh: [冷氣 82°F, 關燈, 記錄出門], en: [AC 82°F, Lights off, Logged departure] } }
  - { who: agent, zh: 好～路上小心，下午會下雨，記得帶傘喔, en: Have a good one — rain this afternoon, take an umbrella }
```

- 對話是挑選過、寫死的示範，網站不會連線到飛予或任何個人資料。
- schema 由 `content.config.ts` 以 zod 驗證：`from`、`to` 的 `zh`/`en` 必填；`chat` 至少 2 則；`who` 只能是 `me`、`tool`、`agent`。格式錯誤時建置失敗，不會上線壞掉的頁面。
- 新增一則例子：新增一個檔案即可。

首批 4 則：出門回家（presence）、天氣（macos-weather）、記帳（finance）、Minecraft 伺服器（project）。

### 4.4 雙語

- 中文為 `/`，英文為 `/en/`，兩者都是完整靜態頁（利於搜尋引擎與分享預覽）。
- 第一次造訪 `/` 時，若瀏覽器語言不是中文，顯示一個「English?」的小提示讓使用者切換；不自動跳轉。
- 使用者選過的語言存在 `localStorage`，讀寫失敗時忽略。
- 每頁有 `<html lang>`、`hreflang` 互相指向。

### 4.5 互動

- **清單 ↔ 對話卡**：預設選中第 1 則。點清單某一列或對話卡下方的圓點，切換對話卡內容。所有對話都在建置時輸出到 HTML，切換只是顯示或隱藏，沒有 JavaScript 時顯示第 1 則對話與完整清單。
- 鍵盤：清單每列可聚焦，Enter／Space 切換；焦點有明顯外框。
- **複製 email**：按鈕呼叫 `navigator.clipboard.writeText`，失敗時改為選取文字。

## 5. 部署

1. GitHub 建立 `SmallYuanSY/smallyuan.dev`（公開）。
2. Cloudflare Pages 連接該 repo：建置指令 `npm run build`，輸出 `dist/`。
3. 綁定自訂網域 `smallyuan.dev`（apex）與 `www.smallyuan.dev`（轉址到 apex）。
4. 不影響既有的 `feiyu.smallyuan.dev`（Cloudflare Access）與 `legal.smallyuan.dev`（GitHub Pages）。

需要 SmallYuan 本人操作：Cloudflare Pages 連接 GitHub 的授權。

## 6. 驗證

- `npm run build` 成功（含 chores schema 驗證）。
- `astro check` 無型別錯誤。
- 本機預覽檢查：中英兩頁、手機與桌面寬度、無 JavaScript 時的顯示、鍵盤操作清單、`prefers-reduced-motion`。
- 上線後：`https://smallyuan.dev/`、`/en/` 回 200，憑證有效；Lighthouse 無障礙與效能分數各 ≥ 90。
- 內容檢查：頁面原始碼中搜尋不到個人 Gmail、住址、實體 ID 等 2.3 列出的私人資訊。

## 7. 已知待定

- 正式文案（實作時一起定稿）。
- OG 分享圖：先用文字版（名字 + 主標），之後可換。
- Feiyu skills 連結：skills repo 上線後再加到 ④。
