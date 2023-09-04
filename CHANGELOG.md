# 更改日志 | CHANGE LOG

## 2023-09-04

- 修复无法同时连接到同一个会话的问题 | Fix the issue that cannot connect to the same session at the same time.
- 裁剪 Jupyter 服务管理类 `ServiceManager` | Trim Jupyter service management class `ServiceManager`.
- 添加使用原生窗口编辑器打开思源块的功能 | Add the function of opening SiYuan block with native window editor.
- 修复自动换行功能失效问题 | Fix the issue that the automatic line break function is invalid.

## 2023-09-03

- 完善设置面板 | Improve settings panel.
- 修复在新窗口打开的页面无法获取 Jupyter 资源列表问题 | Fix the issue that the Jupyter resource list cannot be obtained on the page opened in a new window.

## 2023-09-02

- 实现输出流解析功能 | Implement output stream parsing function.
- 修复颜色解析错误问题 | Fix color parsing error.
- 添加命令 `运行所选代码块` | Add command `Run selected cells`.
- 添加命令 `插入新的代码单元格` | Add command `Insert new cell`.
- 添加命令 `跳转到下一个代码单元格` | Add command `Goto to next cell`.

## 2023-09-01

- 实现代码执行功能 | Implement code execution function.
- 实现错误输出功能 | Implement error output function.
- 实现解析 `display_data`, `update_display_data` 与 `execute_result` 消息的功能 | Implement the function of parsing `display_data`, `update_display_data` and `execute_result` messages.
- 修复侧边面板初始化时无数据问题 | Fix the issue of no data when the side panel is initialized.
- 实现输入请求功能 | Implement input request function.

## 2023-08-31

- 添加 `client` 与 `fs` 属性 | Add `client` and `fs` properties.

## 2023-08-30

- 使用 `browser-fs-access` 重构文件/文件夹上传功能 | Refactor files/folder upload function with `browser-fs-access`.

## 2023-08-29

- 监听 `loaded-protyle-dynamic` 与 `destroy-protyle` 事件 | Listen for `loaded-protyle-dynamic` and `destroy-protyle` events.

## 2023-08-28

- 添加内核状态提示 | Add kernel status prompt.

## 2023-08-27

- 添加会话管理面板 | Add session management panel.
- 实现新建会话与连接会话功能 | Implement the function of creating a new session and connecting to a session.
- 优化插件卸载时对 Worker 的处理 | Optimize the processing of Worker when the plugin is unloading.
- 完善会话管理功能 | Improve session management function.
- 添加内核管理菜单项 | Add kernel management menu items.
- 添加打开文档菜单项 | Add open document menu items.

## 2023-08-26

- 添加 `运行`, `会话` 与 `内核` 菜单项 | Add `Run`, `Session` and `Kernel` menu items.
- 添加会话与内核信息显示菜单项 | Add session and kernel information display menu items.

## 2023-08-25

- 添加 `*.ipynb` 文件类型定义 | Add `*.ipynb` file type definition.

## 2023-08-24

- 使用 `BroadcastChannel` 重构与 Worker 的通讯 | Refactor communication with Worker using `BroadcastChannel`.
- 使用 `worker` 重构 | Refactor with `worker`.

## 2023-08-23

- 重构 Worker 通讯桥 | Refactor Worker communication bridge.

## 2023-08-22

- 使用 `worker` 重构 | Refactor with `worker`.
- 更新依赖项 | Update dependencies.
- 添加设置项 `User-Agent` | Add setting item `User-Agent`.
- 重新添加附属仓库 `wakatime` | Re-add sub-repository `wakatime`.

## 2023-08-21

- 添加 jupyter 资源列表 | Add jupyter resource list.
- 添加导入 `*.ipynb` 文件功能 | Add import `*.ipynb` file function.

## 2023-08-20

- 重新添加附属仓库 `custom-fonts` | Re-add sub-repository `custom-fonts`.
- 添加折叠/展开列表功能 | Add fold/unfold list function.
- 添加侧边栏菜单 | Add dock menu.

## 2023-08-19

- 添加离线缓存功能 | Add offline cache function.
- 初始化 `jupyter-client` 项目 | Initialize `jupyter-client` project.
- 添加 Jupyter 状态面板 | Add Jupyter status panel.

## 2023-08-17

- 修复无法正确解析子标题块问题 | Fix the issue that the subheading block cannot be parsed correctly.
- 捕获删除块导致的异常 | Catch exceptions caused by deleted blocks.
- 添加中文转换菜单 | Add Chinese conversion menu.
- 添加设置面板 | Add settings panel.
- 添加转换文档标题功能 | Add the function of converting document title.

## 2023-08-16

- 添加文件/文件夹更新时间 | Add file/folder update time.
- 添加 `复制导出超链接` 菜单项 | Add `Copy export hyperlink` menu item.
- 添加附属仓库 `template` 的管理脚本 | Add management scripts for sub-repository `template`.
- 完善插件模板 | Improve plugin template.
- 重新添加附属仓库 `template` | Re-add sub-repository `template`.
- 添加附属仓库 `openCC` 的管理脚本 | Add management scripts for sub-repository `openCC`.
- 调整附属仓库 `openCC` 的管理脚本 | Adjust the management scripts for sub-repository `openCC`.
- 初始化附属仓库 `openCC` | Initialize sub-repository `openCC`.
- 重新添加附属仓库 `opencc` | Re-add sub-repository `opencc`.
- 封装 `opencc-js` 转换器构造函数 | Encapsulate the `opencc-js` converter constructor.

## 2023-08-15

- 实现 `wakatime` 插件基础功能 | Implement the basic functions of the `wakatime` plugin.
- 调整打开 `siyuan://plugins` 链接事件的名称 | Adjust the name of the event to open the `siyuan://plugins` link.
- 调整心跳活动推送策略 | Adjust the heartbeat activity push strategy.
- 添加 `hostname` 设置项 | Add `hostname` setting item.
- 重新添加附属仓库 `wakatime` | Re-add sub-repository `wakatime`.
- 实现包含列表与排除列表功能 | Implement include list and exclude list function.
- 添加包含列表与排除列表设置项 | Add include list and exclude list setting items.

## 2023-08-14

- 添加附属仓库 `wakatime` 的管理脚本 | Add management scripts for sub-repository `wakatime`.

## 2023-08-13

- 为面包屑添加激活状态 | Add active state to breadcrumb.

## 2023-08-11

- 添加 KaTeX 自动补全功能 | Add KaTeX auto-completion function.
- 添加 KaTeX 自动补全中的描述与详情信息 | Add description and details information in KaTeX auto-completion.

## 2023-08-10

- 添加格式化 Markdown 文本功能 | Add function of formatting Markdown text.

## 2023-08-08

- 添加复制超链接菜单项 | Add copy hyperlink menu item.
- 添加文档文件/文件夹鼠标悬浮预览功能 | Add document file/folder mouse hover preview function.
- 添加拖拽文件至文件夹时自动展开文件夹功能 | Add the function of automatically expanding the folder when dragging files to the folder.

## 2023-08-07

- 支持使用 `siyuan://plugins/monaco-editor/workspace/path/to/file` URL 打开文件 | Support opening files using the `siyuan://plugins/monaco-editor/workspace/path/to/file` URL.

## 2023-08-03

- 使用块菜单设置块字体 | Set block font using block menu.

## 2023-08-02

- 修复 `#` 链接无法跳转问题 | Fix the issue that `#` link cannot jump.
- [#11](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-webview/issues/11) 添加在屏幕中间显示新窗口功能 | Add the function of displaying new windows in the middle of the screen.
- 调整菜单文本 | Adjust menu text.
- 修复挂件中 API 请求 `baseURL` 初始化错误问题 | Fix the issue of incorrect initialization of `baseURL` in API request in widget.
- 优化字体列表样式 | Optimize font list style.

## 2023-08-01

- 添加拖拽上传文件/文件夹功能 | Add drag and drop upload file/folder function.
- 添加静态资源文件拖拽至编辑器时生成超链接的功能 | Add the function of generating hyperlinks when dragging static resource files to the editor.
- 添加拖拽资源至窗口外时的下载功能 | Add download function when dragging resources out of the window.
- 添加拖拽资源移动其位置的功能 | Add the function of dragging resources to move their positions.
- 添加设置面板 | Add settings panel.
- 完善说明文档 | Improve documentation.

## 2023-07-29

- 添加文件/文件夹上传菜单 | Add file/folder upload menu.
- 添加文件/文件夹下载菜单 | Add file/folder download menu.

## 2023-07-28

- 添加文件历史差异对比菜单 | Add file history diff menu.
- 添加快照文件差异对比菜单 | Add snapshot file diff menu.
- 支持使用设置项控制上下文菜单 | Support using setting items to control context menus.

## 2023-07-26

- 添加代码片段编辑菜单 | Add code snippet edit menu.
- 添加收集箱编辑菜单 | Add inbox edit menu.

## 2023-07-25

- 添加文件预览菜单项 | Add file preview menu item.
- 新增添加/另存为菜单项 | Add add/save as menu item.

## 2023-07-24

- 添加打开与复制菜单项 | Add open and copy menu items.
- 添加刷新菜单项 | Add refresh menu item.
- 添加新建文件/文件夹菜单项 | Add new file/folder menu item.
- 添加重命名文件/文件夹菜单项 | Add rename file/folder menu item.
- 添加删除文件/文件夹菜单项 | Add delete file/folder menu item.

## 2023-07-23

- 文件资源管理器支持打开文件 | File explorer supports opening files.
- 调整文件资源管理器图标与提示文本 | Adjust the icon and prompt text of the file explorer.
- 为编辑器添加更改语言模式命令 | Add change model language command to editor.
- 添加工作区目录与文件的提示文本 | Add prompt text for workspace directories and files.
- 添加 material 图标集 | Add material icon set.
- 修复拖动页签分栏时编辑器无法重新加载问题 | Fix the issue that the editor cannot be reloaded when dragging the tab to split the screen.
- 为文件资源管理器添加列表辅助线 | Add list guides lines to the file explorer.

## 2023-07-22

- 添加文件资源管理面板 | Add file resource management panel.
- 文件资源管理支持解析符号链接 | File resource management supports parsing symbolic links.

## 2023-07-21

- 鼠标事件触发编辑器打开 | Mouse event triggers editor open.

## 2023-07-20

- 优化编辑器另存为选项 | Optimize editor save as option.
- 编辑器中思源字段支持悬浮预览域点击跳转 | SiYuan tokens in the editor support hover preview area click to jump.
- 修复列表导图视图滚动条异常问题 | Fix the issue of abnormal scroll bar in list mind-map view.
- 优化 CD 配置 | Optimize CD configuration.
- 支持设置列表视图中每一项的最大宽度 | Support setting the maximum width of each item in the list view.

## 2023-07-19

- 在新页签/新窗口中打开编辑器 | Open editor in new tab/new window.
- 编辑资源文件 | Edit asset files.
- 编辑本地文件 | Edit local files.
- 查看网络文件 | View network files.

## 2023-07-18

- 重构侧边栏组件 | Refactor sidebar component.
- 优化开发者工具 | Optimize developer tools.
- 优化 BlockIcon 组件 | Optimize BlockIcon component.
- 差异编辑器支持单独配置 | Diff editor supports separate configuration.
- 超链接添加 `在新页签中打开` 菜单项 | Hyperlinks add `Open in new tab` menu item.
- 在操作受保护的资源时进行二次确认 | Double confirmation when operating protected resources.

## 2023-07-17

- 实现块处理器 | Implement block handler.
- 添加面包屑组件 | Add breadcrumb component.
- 添加标签页组件 | Add tab component.
- 移除重复组件 | Remove duplicate components.
- 调整 Webview 组件结构 | Adjust the structure of the Webview component.

## 2023-07-16

- 实现 iframe 编辑器 | Implement iframe editor.

## 2023-07-15

- 实现侧边栏编辑器 | Implement sidebar editor.

## 2023-07-12

- 添加块引用菜单 | Add block reference menu.
- 添加超链接菜单 | Add hyperlink menu.
- 优化思源静态文件服务的判断 | Optimize the judgment of siyuan static file service.

## 2023-07-11

- 实现 monaco 编辑器初始化 | Implement monaco editor initialization.
- 优化列表导图视图 | Optimize list mind-map view.
- 更新依赖项 | Update dependencies.
- 添加重置设置选项提示对话框 | Add reset settings option prompt dialog.

## 2023-07-10

- 添加附属仓库 `monaco-editor` 的管理脚本 | Add management scripts for sub-repository `monaco-editor`.
- 初始化仓库 | Initialize repository.
- 在 `README.md` 中添加常见问题 | Add Q&A in `README.md`.

## 2023-07-09

- 新增快捷键与命令 | Add keyboard shortcuts and commands.
- 新增设置面板 | Add settings panel.
- 添加预览图 | Add preview image.
- 添加 CD 脚本 | Add CD scripts.

## 2023-07-08

- 新增列表看板视图 | Add list kanban view.
- 完善文档 | Improve documentation.

## 2023-07-07

- 新增列表表格视图 | Add list table view.
- 新增列表脑图视图 | Add list mind-map view.

## 2023-07-06

- 新增显示块轮廓功能 | Add display block outline function.
- 新增全宽显示功能 | Add full-width display function.
- 新增全屏显示功能 | Add full-screen display function.
- 新增文本排版模式功能 | Add text layout mode function.
- 新增表格单元格宽度模式 | Add table cell width mode.

## 2023-07-05

- 新增显示块 ID 功能 | Add display block ID function.
- 新增显示块内容功能 | Add display block content function.
- 新增显示块序号功能 | Add display block index function.

## 2023-07-04

- 新增弹幕功能 | Add bullet-screen function.
- 修复在非安全上下文中无法使用 `crypto.randomUUID` 的问题 | Fix the issue that `crypto.randomUUID` cannot be used in an insecure context.
  - REF: https://github.com/Zuoqiu-Yingyi/siyuan-plugin-webview/issues/7
- 新增网页背景设置项介绍 | Add web page background setting item introduction.
- 设置面板组件兼容 `v2.9.4` | Settings panel component compatible with `v2.9.4`.
- 新增滚动显示功能 | Add scrolling display function.

## 2023-07-03

- 实现使用块菜单编辑块 `style` 属性功能 | Implement the function of using block menu to edit block `style` attribute.

## 2023-07-02

- 更新依赖项 | Update dependencies.
- 网页视图支持自定义网页背景颜色 | Web view supports custom web page background color.
- 添加附属仓库 `custom-block` 的管理脚本 | Add management scripts for sub-repository `custom-block`.
- 初始化仓库 | Initialize repository.

## 2023-06-21

- 重构 `apis.siyuan` | Refactor `apis.siyuan`.
- 添加 CD 配置 | Add CD configuration.
- 添加附属仓库 `chinese-convert` 的管理脚本 | Add management scripts for sub-repository `chinese-convert`.
- 初始化仓库 | Initialize repository.

## 2023-06-20

- 添加 `icon.png` | Add `icon.png`.

## 2023-06-19

- 完善 `README*.md` | Improve `README*.md`.

## 2023-06-18

- 完善 `metadata` 的配置清单 | Improve the manifest of `metadata`.

## 2023-06-17

- 新增 `json-schema` 相关依赖 | Add `json-schema` related dependencies.

## 2023-06-16

- 迁移仓库 `siyuan-api-interface` 至 `workspace/packages` 目录 | Migrate repository `siyuan-api-interface` to `workspace/packages` directory.

## 2023-06-14

- 更新第三方依赖 | Update third-party dependencies.

## 2023-06-08

- 将推特表情符号字体由 `Twitter Color Emoji` 替换为 `Twemoji Mozilla` | Replace the Twitter emoji font from `Twitter Color Emoji` to `Twemoji Mozilla`.
  - [13rac1/twemoji-color-font: Twitter Unicode emoji color OpenType-SVG font for Linux/MacOS/Windows](https://github.com/13rac1/twemoji-color-font)
  - [mozilla/twemoji-colr: Twemoji font in COLR/CPAL layered format](https://github.com/mozilla/twemoji-colr)
- 实现自定义字体列表功能 | Implement custom font list feature.
- 添加 CD 配置 | Add CD configuration.
- 改进设置对话框标题内容 | Improve the title content of the settings dialog.

## 2023-06-07

- 添加附属仓库 `custom-fonts` 的管理脚本 | Add management scripts for sub-repository `custom-fonts`.
- 支持嵌入 `Twitter Color Emoji` 字体 | Support embedding `Twitter Color Emoji` font.

## 2023-06-06

- 更新依赖 | Update dependencies.

## 2023-06-04

- 添加附属仓库 `metadata` 的管理脚本 | Add management scripts for sub-repository `metadata`.
- 添加附属仓库 `metadata` | Add sub-repository `metadata`.
- 添加顶部工具栏菜单项 | Add top toolbar menu items.
- 改进顶部工具栏菜单项隐藏时的菜单位置 | Improve the menu position when the top toolbar menu item is hidden.

## 2023-06-02

- 新增块菜单菜单项 `在新窗口打开` 用 `在新窗口打开并聚焦` | Add block menu item `Open in new window` with `Open in new window and focus`.

## 2023-06-01

- 设置页签图标为网页图标 | Set the tab icon to the web icon.
- 修复页签图标未显示问题 | Fix the issue of tab icon not displayed.
- 新增超链接地址提示功能 | Add hyperlink address prompt function.

## 2023-05-31

- 清单新增字段 `backends` 与 `frontends` | Manifest adds fields `backends` and `frontends`.
- 使用思源提供的类型定义文件 | Use the type definition file provided by SiYuan.

## 2023-05-28

- 添加 CD 配置 | Add CD configuration.

## 2023-05-27

- 实现在新窗口打开功能 | Implement open in new window function.
- 完善新窗口打开功能的设置界面 | Improve the settings interface of the open in new window function.
- 添加 `使用新窗口打开` 按钮 | Add `Open with a new window` button.
- 修复菜单栏状态设置失效问题 | Fix the issue that the menu bar status setting is invalid.
- 修复设置面板无法完全填充问题 | Fix the issue that the settings panel cannot be fully filled.
- 添加 `使用新窗口打开思源编辑器` 功能 | Add `Open SiYuan Editor in a new window` function.
- 在新窗口打开的思源编辑器中添加 `Electron` 上下文 | Add `Electron` context to SiYuan Editor opened in a new window.
- 调整桌面端与移动端窗口的默认设置 | Adjust the default settings of desktop and mobile windows.
- 调整在新窗口打开触发策略 | Adjust the trigger strategy for opening in a new window.
- 优化思源超链接解析 | Optimize SiYuan hyperlinks parsing.
- 完善用户文档 | Improve user documentation.

## 2023-05-26

- 修复提示框方向异常问题 | Fix the issue of abnormal direction of prompt box.
- `webview` 添加在新标签页打开功能 | Add open in new tab function to `webview`.
- 添加自定义 `User-Agent` 功能 | Add custom `User-Agent` function.

## 2023-05-25

- 完善插件设置界面 | Improve the plugin settings interface.
- `webview` 地址栏添加`使用默认程序打开`按钮 | Add `Open with default program` button to `webview` address bar.
- 使用封装后的 `Svg.svelte` 组件 | Use the encapsulated `Svg.svelte` component.

## 2023-05-24

- 优化设置面板组件 | Optimize the settings panel component.
- `webview` 插件支持使用配置控制选项其行为 | The `webview` plugin supports using configuration to control its behavior.

## 2023-05-24

- 优化设置面板组件 | Optimize the settings panel component.
- 修复拖拽分屏失效问题 | Fix the issue that drag and drop split screen is invalid.
- 新增日志记录工具 | Added log recording tool.
- 新增交互事件工具 | Added interactive event tool.

## 2023-05-23

- 添加附属仓库 `siyuan-plugin-webview` | Add sub-repository `siyuan-plugin-webview`.
- 添加附属仓库 `webview` 的管理脚本 | Add management scripts for sub-repository `webview`.
- 使用 `svelte` 重构 `webview` | Refactor `webview` with `svelte`.
- 在 `<webview>` 外进行交互时设置 `<webview>` 的 `pointer-events` 为 `nont` | Set the `pointer-events` of `<webview>` to `nont` when interacting outside `<webview>`.

## 2023-05-20

- 添加 `build.yml` CD 配置 | Add `build.yml` CD configuration.
- 添加 `release-distribution.yml` CD 配置 | Add `release-distribution.yml` CD configuration.
- 新增发行步骤 | Added release steps.
- 添加 `package.json` | Add `package.json`.
- CD `release-please.yml` 支持触发其他 CD 工作流 | CD `release-please.yml` supports triggering other CD workflows.
  - REF: [GitHub credentials](https://github.com/marketplace/actions/release-please-action#github-credentials)
- 更新 `README.md` | Update `README.md`.
- 更新 `release-please.yml` CD 配置 | Update `release-please.yml` CD configuration.
- 添加 `split.ps1` 脚本 | Add `split.ps1` script.
- 修复 `build.yml` CD 配置 | Fix `build.yml` CD configuration.
- 修复 `release-distribution.yml` CD 配置 | Fix `release-distribution.yml` CD configuration.
- CI/CD 支持手动触发 | CI/CD supports manual triggering.
- 修复 `split.ps1` 脚本 | Fix `split.ps1` script.
- 更新依赖 | Update dependencies.
- 更新 `release-please.yml` CD 配置使其生成 pre-release | Update `release-please.yml` CD configuration to generate pre-release.
- 更新 `README*.md` | Update `README*.md`.
- 运行 `build.yml` 完成后调用 `release-distribution.yml` | Call `release-distribution.yml` after `build.yml` is completed.
- 修复 `release-distribution.yml` 打包时目标分支错误问题 | Fix the issue of wrong target branch when `release-distribution.yml` is packaged.
- 修复 `release-distribution.yml` 发布时标签关联分支错误问题 | Fix the issue of wrong branch associated with tag when `release-distribution.yml` is released.
- 修复清单文件中 `readme` 项文件名称错误 | Fix the file name error of the `readme` item in the manifest file.

## 2023-05-19

- 新增附属仓库的的 `CHANGELOG.md` | Added `CHANGELOG.md` for sub-repository.
- 调整更改日志格式 | Adjust the format of the change log.
- 添加 `release-please.yml` CD 配置 | Add `release-please.yml` CD configuration.
- 更新依赖 | Update dependencies.
- 更新 subtree 管理脚本 | Update subtree management scripts.
- 更新 `open-api` 插件描述信息 | Update `open-api` plugin description.
- 更新 `release-please.yml` CD 配置 | Update `release-please.yml` CD configuration.
- 更新思源插件 API 定义文件 | Update SiYuan plugin API definition file.

## 2023-05-18

- 为 `jupyter-client` 插件提供 `svelte-i18n` 支持 | Provides `svelte-i18n` support for `jupyter-client` plugin.
- 添加附属仓库 `siyuan-plugin-open-api` | Add sub-repository `siyuan-plugin-open-api`.
- `open-api` 插件实现将插件 API 暴露至全局变量的功能 | The 'open-api' plugin implement the function exposes the plugin API to global variables.

## 2023-05-17
- 添加捐助方案 | Added donation method.
- 项目初始化 | Project initialization.
- 添加附属仓库 `siyuan-plugin-jupyter-client` | Add sub-repository `siyuan-plugin-jupyter-client`.
- 调整构建工具 | Adjust the build tools.
- 初始化 `jupyter-client` 插件 | Initialize `jupyter-client` plugin.
