# FluLink 页面级提示词（联调整体使用）

以下提示词均遵循《FluLink项目导航系统规范》（见 `navigation-spec.md`），用于为每个核心页面生成带有正确顶部栏和底部栏的一致风格高保真原型。统一暗色主题（#0a0a1a）与关键高亮（#ffd700），新拟态与渐变高光风格为基准。

## 1. 病毒库（首页）
提示词：

根据【FluLink项目导航系统规范】，生成“病毒库”首页的高保真界面。
- 顶部导航栏：标题为“病毒库”，右侧有“消息”图标和“筛选”图标。
- 主内容区：垂直滚动的信息流，包含多个“毒株卡片”。每张卡片有用户头像、内容文本/图片、互动按钮（点赞、评论、传播）以及“已感染XX人”的标签。按“传播热度”排序。
- 底部导航栏：“病毒库”图标应为选中状态（高亮）。
- 整体暗色主题，采用毛玻璃和渐变色彩。--v 6.0

## 2. 传播图谱页
提示词：

根据【FluLink项目导航系统规范】，生成“传播图谱”页的高保真界面。
- 顶部导航栏：标题为“传播图谱”，右侧有“图层”图标（切换热力图/传播路径）和“定位”图标。
- 主内容区：一张抽象化地图，以用户当前位置为中心。显示不同区域的颜色深浅（感染热力），并有光带/轨迹显示毒株从A地传播到B地的动画效果。点击某个区域可弹出该区域的活跃毒株列表。
- 底部导航栏：“图谱”图标应为选中状态（高亮）。
- 风格偏向数据可视化，充满科技感。--v 6.0

## 3. 发布中心页
提示词：

根据【FluLink项目导航系统规范】，生成“发布中心”页的高保真界面。
- 顶部导航栏：标题为“创造毒株”，左侧可有返回按钮。
- 主内容区：突出“创作区域”。包含：内容输入框（支持文字、图片上传）、传播范围选择器（滑动选择：小区/街道/城市/全球）、易感标签选择器。底部有显眼“发射”按钮。
- 底部导航栏：“发布”图标为选中状态（高亮），此页底部栏可略小以突出发布按钮。
- 整体具有“实验室/培养皿”仪式感。--v 6.0

## 4. 免疫档案（个人中心）页
提示词：

根据【FluLink项目导航系统规范】，生成“免疫档案”页的高保真界面。
- 顶部导航栏：标题“我的免疫档案”，右侧“设置”图标。
- 主内容区：个人头像、昵称、等级徽章（如“区域传播者”）。下方为数据面板（已发布毒株数、总感染人数）、我的传播图谱、成就徽章墙、免疫清单（不感兴趣标签）。
- 底部导航栏：“档案”图标为选中状态（高亮）。
- 风格如个人化数据报告。--v 6.0

## 5. 用户流程故事板（多屏联动）
提示词：

请生成一个包含3个屏幕的连贯故事板，展示以下用户流程：
- 屏幕1（病毒库首页）：用户点击底部导航“发布”。
- 屏幕2（发布中心）：用户输入“发现一家超赞的咖啡馆！”，选择传播范围“本街道”，并点击“发射”。
- 屏幕3（传播图谱）：自动切换到“图谱”Tab，地图显示光点从用户小区向周边街道辐射，并标注“预计5分钟后覆盖临江街道”。
请确保三个屏幕的顶部栏和底部栏根据操作流程连贯且正确变化。--v 6.0

## 6. 核心体验页：毒株传播可视化页面（进阶）
提示词（英文）：

Generate a high-fidelity UI mockup for the "Virus Spread Map" screen of the FluLink app. The scene is a dark theme map interface. The center is the user's current neighborhood, with a glowing pulse animation. From this center, several light trails radiate outwards, connecting to other glowing nodes representing nearby streets and districts. Each trail has a small label showing the delay time (e.g., "8 mins delay"). One prominent trail is highlighted, showing the progress of a specific "Virus Strain" the user just posted, with a small card attached that reads "Your 'Coffee Shop Discovery' has reached Green Tree Street, infected 23 people". Use neumorphism for the map controls and gradient glowing effects for the connections. Style: clean, modern, data visualization aesthetic. --v 6.0

## 7. 内容创作页：发布毒株页面（进阶）
提示词（英文）：

Generate a UI mockup for the "Create a Strain" screen in the FluLink app. Dark theme. The main area is a card with a pulsating border, resembling a petri dish. At the top are tabs for content type: "Text", "Image", "Form". The selected "Text" tab is active. There's a text area with placeholder text "Cultivate your virus strain here...". Below are "Transmission Settings": a toggle for "Super Strain" and a slider for "Infection Radius" (from "My Building" to "Global"). At the bottom, a glowing "Release Strain" button. The overall feel is like a laboratory interface. Use subtle gradients and neumorphic form elements. --v 6.0

## 8. 社交核心页：星团/49人圈子页面（进阶）
提示词（英文）：

Generate a UI mockup for the "Star Cluster" screen in FluLink. Dark space-themed background. The center shows a large, glowing avatar representing the user. Surrounding it in a circular formation are 48 smaller, glowing avatars of other cluster members, some with tiny notification badges. Tapping on one avatar brings up a small profile card overlay with options: "View Constellation", "Send Private Spark". The layout feels like a star system. Use deep blues and purples with gradient glows. The style should be cosmic and intimate. --v 6.0

## 9. 个人中心页：免疫档案页面（进阶）
提示词（英文）：

Generate a UI mockup for the "Immunity Profile" screen. Dark theme, styled like a scientific dossier. The top section shows the user's avatar, level, and title ("Neighborhood Carrier"). The main area is a vertical timeline/log of their activity: "Strains Created", "Strains Infected By", "Immunities Developed". Each log entry is a small card (e.g., "Oct 5 - Infected by 'Best Hiking Trail' strain"). A circular "Immunity Chart" on the side visualizes the types of content the user interacts with most. Use a mix of neumorphic cards and clean data visualization elements. --v 6.0

## 10. 独特交互页：发牌手会话页面（进阶）
提示词（英文）：

Generate a UI mockup for a chat interface with the "Dealer" AI in FluLink. The conversation bubble from the Dealer has a distinct lab-glass style. It's analyzing a "Strain" the user sent: showing a "Toxicity Score: 7.2/10", a map preview with a predicted spread path, and a "Time to First Infection: ~2 mins" estimate. The user's input bar at the bottom has options to attach Location, Image, or a Form. The overall aesthetic is a mix of a chat app and a scientific dashboard. --v 6.0

## 11. 发现页：区域感染热力图页面（进阶）
提示词（英文）：

Generate a UI mockup for the "Local Infection Heatmap" screen. It shows a simplified map of the user's current city or district. Different neighborhoods are colored with a red-to-blue gradient, indicating "infection heat" (activity level). The user's neighborhood is highlighted. Tapping on a neighborhood brings up a stats card: "Active Strains: 23", "Top Strain: 'Park Cleanup Initiative'". The design should be a clean, abstracted map with a strong focus on the heat visualization. Dark theme with glowing heat effects. --v 6.0

---

### 风格锚定（Style Anchor Prompt）
Please maintain consistent design language with the previously generated FluLink homepage: specifically the use of #0a0a1a as the primary dark background, #ffd700 for key accents, neumorphic buttons, and gradient glows. All new screens should feel like part of the same app.
