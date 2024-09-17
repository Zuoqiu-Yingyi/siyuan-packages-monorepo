<div align="center">
<img alt="图标" src="https://cdn.jsdelivr.net/gh/Zuoqiu-Yingyi/siyuan-plugin-opencc/public/icon.png" style="width: 8em; height: 8em;">

---
[![GitHub 最新发行版本 (最新一次发行/预发行)](https://img.shields.io/github/v/release/Zuoqiu-Yingyi/siyuan-plugin-opencc?include_prereleases&style=flat-square)](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-opencc/releases/latest)
[![GitHub 最新发行时间](https://img.shields.io/github/release-date/Zuoqiu-Yingyi/siyuan-plugin-opencc?style=flat-square)](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-opencc/releases/latest)
[![GitHub 许可证](https://img.shields.io/github/license/Zuoqiu-Yingyi/siyuan-plugin-opencc?style=flat-square)](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-opencc/blob/main/LICENSE)
[![GitHub 最后一次提交时间](https://img.shields.io/github/last-commit/Zuoqiu-Yingyi/siyuan-plugin-opencc?style=flat-square)](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-opencc/commits/main)
![GitHub 仓库大小](https://img.shields.io/github/repo-size/Zuoqiu-Yingyi/siyuan-plugin-opencc?style=flat-square)
![查看次数](https://hits.b3log.org/Zuoqiu-Yingyi/siyuan-plugin-opencc.svg)
<!-- ![jsDelivr 查看次數 (GitHub)](https://img.shields.io/jsdelivr/gh/hy/Zuoqiu-Yingyi/siyuan-packages-opencc?style=flat-square) -->
[![GitHub 发行版本下载次数](https://img.shields.io/github/downloads/Zuoqiu-Yingyi/siyuan-plugin-opencc/total?style=flat-square)](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-opencc/releases)
---

简体中文 \| [繁体中文](./README_zh_CHT.md) \| [English](./README.md)

---

</div>

# 思源中文转换插件

这是一款使用 [OpenCC](https://github.com/BYVoid/OpenCC) 与 [opencc-js](https://github.com/nk2028/opencc-js) 项目进行离线中文转换的[思源笔记](https://github.com/siyuan-note/siyuan)插件。

## 预览

![预览图片](https://cdn.jsdelivr.net/gh/Zuoqiu-Yingyi/siyuan-plugin-opencc/public/preview.png)

## 常见问题

## 介绍

### 功能介绍

- 支持的文本类型

  - `zh-Hans-CN` 简体中文
  - `zh-Hant` 繁体中文（OpenCC 标准）
  - `zh-Hant-HK` 繁体中文（香港繁体）
  - `zh-Hant-TW` 繁体中文（台湾正体）
  - `zh-Hant-TW` 繁体中文（台湾正体常用词）
  - `ja-Hani-JP` 日文新字体
  - 详情请参考 [OpenCC 预设配置文件](https://github.com/BYVoid/OpenCC#預設配置文件)
- 使用 <kbd>右键菜单</kbd>/<kbd>块菜单</kbd> > <kbd>插件</kbd> > <kbd>中文转换</kbd> 菜单项调用本插件功能

  - `简 → 繁`

    - 简体类型与繁体类型可在 `插件设置 > 转换设置 > 简→繁` 页面中设置
  - `繁 → 简`

    - 简体类型与繁体类型可在 `插件设置 > 转换设置 > 繁→简` 页面中设置
  - `自定义转换`

    - 原始文本类型与目标文本类型可在 `插件设置 > 转换设置 > 自定义转换` 页面中设置
  - `其他转换`

    - 临时调用一次指定类型的转换
- 菜单项介绍

  - `复制转换结果`

    - 将所选内容转换结果写入剪贴板
  - `在上方插入转换结果`

    - 将转换结果插入所选内容的上方
  - `在每个块的上方插入转换结果`

    - 在所选块中每一个叶子块的上方插入对应块的转换结果
  - `转换结果替换原文本`

    - 使用转换结果替换所选的内容
  - `在每个块的下方插入转换结果`

    - 在所选块中每一个叶子块的下方插入对应块的转换结果
  - `在下方插入转换结果`

    - 将转换结果插入所选内容的下方
  - `转换文档标题`

    - 使用转换后的文档标题重命名文档

### 设置项介绍

- `常规设置`

  - `重置设置选项`

    - 重置所有设置选项为默认选项
    - 点击该按钮后会弹出确认对话框

      - 点击对话框确认按钮后会重置本插件所有选项为默认选项, 之后会自动刷新当前界面
- `转换设置`

  - `全局设置`

    - `全局扩展字典`

      - 全局生效的用户自定义字典, 在 `简 → 繁`, `繁 → 简`, `自定义转换` 与 `其他转换` 操作中都生效
      - 字典格式

        - 每一个词条中使用空格分隔原始词汇与目标词汇，词条之间使用 `|` 字符或换行符分割, 如下所示
        - ```plaintext
          原始词汇1 目标词汇1|原始词汇2 目标词汇2|原始词汇3 目标词汇3
          原始词汇4 目标词汇4|原始词汇5 目标词汇5|原始词汇6 目标词汇6
          ```
  - `简 → 繁`

    - `原始文本类型`

      - 使用菜单项 `简 → 繁` 操作时所选内容的文本类型, 可选择如下文本类型

        - `zh-Hans-CN` 简体中文
        - `ja-Hani-JP` 日文新字体
    - `目标文本类型`

      - 使用菜单项 `简 → 繁` 操作时转换目标的文本类型, 可选择如下文本类型

        - `zh-Hant` 繁体中文（OpenCC 标准）
        - `zh-Hant-HK` 繁体中文（香港繁体）
        - `zh-Hant-TW` 繁体中文（台湾正体）
        - `zh-Hant-TW` 繁体中文（台湾正体常用词）
        - `ja-Hani-JP` 日文新字体
    - `扩展字典`

      - 仅在使用菜单项 `简 → 繁` 操作时生效的用户自定义字典, 字典格式与 `全局扩展字典` 一致
  - `繁 → 简`

    - `原始文本类型`

      - 使用菜单项 `繁 → 简` 操作时所选内容的文本类型, 可选择如下文本类型

        - `zh-Hant` 繁体中文（OpenCC 标准）
        - `zh-Hant-HK` 繁体中文（香港繁体）
        - `zh-Hant-TW` 繁体中文（台湾正体）
        - `zh-Hant-TW` 繁体中文（台湾正体常用词）
        - `ja-Hani-JP` 日文新字体
    - `目标文本类型`

      - 使用菜单项 `繁 → 简` 操作时转换目标的文本类型, 可选择如下文本类型

        - `zh-Hans-CN` 简体中文
        - `ja-Hani-JP` 日文新字体
    - `扩展字典`

      - 仅在使用菜单项 `繁 → 简` 操作时生效的用户自定义字典, 字典格式与 `全局扩展字典` 一致
  - `自定义转换`

    - `原始文本类型`

      - 使用菜单项 `自定义转换` 操作时所选内容的文本类型, 支持选择所有文本类型
    - `目标文本类型`

      - 使用菜单项 `自定义转换` 操作时转换目标的文本类型, 支持选择所有文本类型
    - `扩展字典`

      - 仅在使用菜单项 `自定义转换` 操作时生效的用户自定义字典, 字典格式与 `全局扩展字典` 一致

## 更改日志

[CHANGELOG.md](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-opencc/blob/main/CHANGELOG.md)
