<div align="center">
<img alt="图标" src="https://cdn.jsdelivr.net/gh/Zuoqiu-Yingyi/siyuan-plugin-keepass/public/icon.png" style="width: 8em; height: 8em;">

---
[![GitHub 最新发行版本 (最新一次发行/预发行)](https://img.shields.io/github/v/release/Zuoqiu-Yingyi/siyuan-plugin-keepass?include_prereleases&style=flat-square)](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-keepass/releases/latest)
[![GitHub 最新发行时间](https://img.shields.io/github/release-date/Zuoqiu-Yingyi/siyuan-plugin-keepass?style=flat-square)](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-keepass/releases/latest)
[![GitHub 许可证](https://img.shields.io/github/license/Zuoqiu-Yingyi/siyuan-plugin-keepass?style=flat-square)](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-keepass/blob/main/LICENSE)
[![GitHub 最后一次提交时间](https://img.shields.io/github/last-commit/Zuoqiu-Yingyi/siyuan-plugin-keepass?style=flat-square)](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-keepass/commits/main)
![GitHub 仓库大小](https://img.shields.io/github/repo-size/Zuoqiu-Yingyi/siyuan-plugin-keepass?style=flat-square)
![GitHub 代码大小](https://img.shields.io/github/languages/code-size/Zuoqiu-Yingyi/siyuan-plugin-keepass.svg?style=flat-square)
![查看次数](https://hits.b3log.org/Zuoqiu-Yingyi/siyuan-plugin-keepass.svg)
<!-- ![jsDelivr 查看次數 (GitHub)](https://img.shields.io/jsdelivr/gh/hy/Zuoqiu-Yingyi/siyuan-packages-keepass?style=flat-square) -->
[![GitHub 发行版本下载次数](https://img.shields.io/github/downloads/Zuoqiu-Yingyi/siyuan-plugin-keepass/total?style=flat-square)](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-keepass/releases)

---
简体中文 \| [English](./README.md)

---
</div>

# 思源 KeePass 密码管理器插件

这是一款在 [KeeWeb](https://github.com/keeweb/keeweb) 项目的基础上进行二次开发的[思源笔记](https://github.com/siyuan-note/siyuan)插件, 提供完全离线且完善的密码管理功能, 支持读写 3.x 与 4.x 版本的 [KeePass](https://keepass.info/) 数据库文件 `*.kdbx`, 并内置一个可以用于连接思源服务的 [KeeWeb](https://github.com/keeweb/keeweb) 插件。

## 预览

![预览图片](https://cdn.jsdelivr.net/gh/Zuoqiu-Yingyi/siyuan-plugin-keepass/public/preview.png)

## 常见问题

* 本项目是否开源?

  * 本项目使用 [AGPL-3.0-or-later](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-keepass/blob/main/LICENSE) 协议完整开源, 有多个组成部分

    * 项目 monorepo 仓库: [Zuoqiu-Yingyi/siyuan-packages-monorepo](https://github.com/Zuoqiu-Yingyi/siyuan-packages-monorepo)

      * 项目主仓库是 monorepo 的一部分, 主要开发活动位于 monorepo 仓库
      * 项目主仓库在 monorepo 仓库的路径: [siyuan-packages-monorepo/workspace/plugins/keepass](https://github.com/Zuoqiu-Yingyi/siyuan-packages-monorepo/tree/main/workspace/plugins/keepass)
    * 项目主仓库: [Zuoqiu-Yingyi/siyuan-plugin-keepass](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-keepass)

      * 本仓库包含两个插件
      * 思源笔记插件 (插件名称: `keepass`)

        * 在思源笔记中部署 KeeWeb 服务
        * 内置了所有 KeeWeb 官方市场提供的插件, 使得 KeeWeb 相关服务可以完全离线使用
        * 在多个浏览器之间同步 KeeWeb 用户配置信息
        * 其他实用的功能, 详情请参考 `功能介绍` 一节
      * KeeWeb 插件 (插件名称 `siyuan`)

        * 连接思源笔记服务
        * 读写在思源笔记工作空间目录下的 `*.kdbx` 数据库文件
    * 进行 KeeWeb 二次开发的分支仓库: [Zuoqiu-Yingyi/keeweb](https://github.com/Zuoqiu-Yingyi/keeweb)

      * 优化打包过程, 关闭构建时的压缩功能
      * 优化 CSP 签名策略
      * 添加对思源扩展的信任
      * 添加离线加载社区扩展插件功能
* KeeWeb 页面中无法读取思源工作空间下的数据库

  * 请检查插件设置中的思源服务 URL 与 Token 是否正确设置, 或者在思源内的页签中打开 KeeWeb 页面
* 如何在其他 KeeWeb 应用中安装 KeeWeb 插件 `siyuan`?

  * KeeWeb 插件 `siyuan` 已经内置在思源插件 `keepass` 中, 可以使用如下地址安装

    * `http(s)://<思源服务地址>/plugins/keepass/keeweb/plugins/siyuan`
  * 或者从本项目的构建分支安装

    * [https://raw.githubusercontent.com/Zuoqiu-Yingyi/siyuan-plugin-keepass/publish/keeweb/plugins/siyuan](https://raw.githubusercontent.com/Zuoqiu-Yingyi/siyuan-plugin-keepass/publish/keeweb/plugins/siyuan)

## 介绍

### 思源笔记插件 `keepass`

#### 功能介绍

* 内置 KeeWeb 应用

  * 安装本插件后访问 `http(s)://<思源服务地址>/plugins/keepass/keeweb/app/`
  * 可完全离线访问
  * 可完全离线加载 KeeWeb 社区插件
* 同步 KeeWeb 的用户配置

  * 仅支持同步内置 KeeWeb 应用的用户配置
* `在新页签中打开 KeeWeb`

  * 功能调用方案

    * 点击思源右上角工具栏按钮 `KeePass 密码管理器`→`在新页签中打开 KeeWeb`
    * 使用命令 `KeePass 密码管理器: 在新页签中打开 KeeWeb`
    * 设置自定义快捷键
* `在浏览器中打开 KeeWeb`

  * 功能调用方案

    * 点击思源右上角工具栏按钮 `KeePass 密码管理器`→`在浏览器中打开 KeeWeb`
    * 使用命令 `KeePass 密码管理器: 在浏览器中打开 KeeWeb`
    * 设置自定义快捷键
* `在新窗口中打开 KeeWeb`

  * 功能调用方案

    * 点击思源右上角工具栏按钮 `KeePass 密码管理器`→`在新窗口中打开 KeeWeb`
    * 使用命令 `KeePass 密码管理器: 在新窗口中打开 KeeWeb`
    * 设置自定义快捷键

      * 该快捷键为在桌面端思源笔记中为全局快捷键

#### 设置项介绍

* `常规设置`

  * `重置设置选项`

    * 重置所有设置选项为默认选项
    * 重置后将刷新页面
* `KeeWeb 设置`

  * `插件设置`

    * `KeeWeb 插件：siyuan`

      * 这是一个开关
      * 默认状态: `开启`
      * 开启后将在内置的 KeeWeb 应用中安装 `siyuan` 插件
      * 关闭后将在内置的 KeeWeb 应用中卸载 `siyuan` 插件
      * 更改后需要刷新 KeeWeb 应用页面才能生效
      * 在 KeeWeb 应用中安装/卸载 `siyuan` 插件后会同步更新本开关的状态
  * `窗口设置`

    * `窗口宽度`

      * 这是一个数字输入框
      * 默认值: `800`
      * 单位: 像素 `px`
      * 设置 `在新窗口中打开 KeeWeb` 功能打开窗口的初始宽度
    * `窗口高度`

      * 这是一个数字输入框
      * 默认值: `600`
      * 单位: 像素 `px`
      * 设置 `在新窗口中打开 KeeWeb` 功能打开窗口的初始高度
    * `窗口居中`

      * 这是一个开关
      * 默认值: `关闭`
      * 设置 `在新窗口中打开 KeeWeb` 功能打开的新窗口的位置

        * 开启后在屏幕中间显示新窗口
        * 关闭后在当前鼠标位置显示新窗口
    * `窗口置顶`

      * 这是一个开关
      * 默认值: `开启`
      * 设置 `在新窗口中打开 KeeWeb` 功能打开的新窗口是否默认置顶显示

        * 开启后新窗口默认置顶显示
        * 关闭后新窗口默认不置顶
      * 窗口置顶功能仅在桌面端中生效

        * 桌面端打开的新窗口可使用快捷键 <kbd>Ctrl + Shift + 空格</kbd> 或窗口工具栏菜单项 <kbd>View</kbd>→<kbd>Toggle On Top</kbd> 切换置顶状态

### KeeWeb 插件 `siyuan`

#### 功能介绍

* 在 KeeWeb 主界面添加 <kbd>思源笔记</kbd> 按钮

  * 可从思源工作空间目录下选择并加载 KeePass 数据库文件 `*.kdbx`
  * 文件选择器的初始目录受插件设置项 `默认的文件打开目录` 影响

    * 默认的初始目录为 `/data/storage/petal/keepass/`
* 保存 KeePass 数据库文件 `*.kdbx` 到思源笔记工作空间

  * 从思源工作空间打开的 KeePass 数据库文件 `*.kdbx` 会保存至原位置
  * 新建的 KeePass 数据库文件 `*.kdbx` 会保存在设置项 `默认 *.kdbx 文件存放目录` 指定的目录

    * 默认保存在 `/data/storage/petal/keepass/` 目录下

#### 设置项介绍

* `思源服务 URL 地址`

  * 这是一个文本输入框
  * 默认为空
  * 设置想要连接的思源笔记服务的 URL

    * 为空时连接至当前思源笔记服务
    * 可以连接其他的思源笔记服务
* `思源服务 Token`

  * 这是一个文本输入框
  * 默认为空
  * 设置想要连接的思源笔记服务的 Token

    * 连接至当前思源笔记服务时可为空

      * 需要通过当前思源笔记的登录认证
    * 连接至其他的思源笔记服务时需要设置对应的 Token
* `默认 *.kdbx 文件存放目录`

  * 这是一个文本输入框
  * 默认为 `/data/storage/petal/keepass/`
  * 指定新建的 KeePass 数据库文件 `*.kdbx` 的存放目录

    * 该路径的根目录为思源笔记的工作空间目录
* `默认的文件打开目录`

  * 这是一个下拉选项框
  * 默认为 `默认 *.kdbx 文件存放目录`
  * 设置 KeeWeb 主界面中 `思源笔记` 按钮打开的文件选择器的默认目录
  * 选项列表

    * `默认 *.kdbx 文件存放目录`

      * 默认打开 <kbd>默认 *.kdbx 文件存放目录</kbd> 设置项指定的目录
    * `思源笔记工作空间的根目录`

      * 默认打开思源笔记工作空间的根目录

## 更改日志

[CHANGELOG.md](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-keepass/blob/main/CHANGELOG.md)
