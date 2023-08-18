<div align="center">
<img alt="icon" src="https://cdn.jsdelivr.net/gh/Zuoqiu-Yingyi/siyuan-plugin-opencc/public/icon.png" style="width: 8em; height: 8em;">

---
[![GitHub release (latest by date including pre-releases)](https://img.shields.io/github/v/release/Zuoqiu-Yingyi/siyuan-plugin-opencc?include_prereleases&style=flat-square)](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-opencc/releases/latest)
[![GitHub Release Date](https://img.shields.io/github/release-date/Zuoqiu-Yingyi/siyuan-plugin-opencc?style=flat-square)](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-opencc/releases/latest)
[![GitHub License](https://img.shields.io/github/license/Zuoqiu-Yingyi/siyuan-plugin-opencc?style=flat-square)](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-opencc/blob/main/LICENSE)
[![GitHub last commit](https://img.shields.io/github/last-commit/Zuoqiu-Yingyi/siyuan-plugin-opencc?style=flat-square)](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-opencc/commits/main)
![GitHub repo size](https://img.shields.io/github/repo-size/Zuoqiu-Yingyi/siyuan-plugin-opencc?style=flat-square)
![hits](https://hits.b3log.org/Zuoqiu-Yingyi/siyuan-plugin-opencc.svg)
<!-- ![jsDelivr hits (GitHub)](https://img.shields.io/jsdelivr/gh/hy/Zuoqiu-Yingyi/siyuan-packages-opencc?style=flat-square) -->
[![GitHub all releases](https://img.shields.io/github/downloads/Zuoqiu-Yingyi/siyuan-plugin-opencc/total?style=flat-square)](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-opencc/releases)

---
[简体中文](./README_zh_CN.md) \| [繁体中文](./README_zh_CHT.md) \| English

---
</div>

# SiYuan Plugin for Chinese Convert

This is a plugin for [Siyuan Note](https://github.com/siyuan-note/siyuan) that performs offline Chinese conversion using the [OpenCC](https://github.com/BYVoid/OpenCC) and [opencc-js](https://github.com/nk2028/opencc-js) projects.

## PREVIEW

![Preview image](https://cdn.jsdelivr.net/gh/Zuoqiu-Yingyi/siyuan-plugin-opencc/public/preview.png)

## Q & A

## INTRODUCTION

### Function Introduction

* Supported text types

  * `zh-Hans-CN` Simplified Chinese
  * `zh-Hant` Traditional Chinese (OpenCC standard)
  * `zh-Hant-HK` Traditional Chinese (Hong Kong)
  * `zh-Hant-TW` Traditional Chinese (Taiwan)
  * `zh-Hant-TW` Traditional Chinese (Taiwan Common Words)
  * `ja-Hani-JP` Japanese New Font
  * For more details, please refer to the [OpenCC preset configuration file](https://github.com/BYVoid/OpenCC#%E9%A0%90%E8%A8%AD%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6)
* Use the <kbd>Right-click menu</kbd>/<kbd>Block menu</kbd> > <kbd>Plugin</kbd> > <kbd>Chinese Convert</kbd> menu item to invoke this plugin's functions.

  * `Simplified → Traditional`

    * The types of simplified and traditional characters can be set in the `Plugin Settings > Conversion Settings > Simplified→Traditional` page.
  * `Traditional → Simplified`

    * The types of simplified and traditional characters can be set in the `Plugin Settings > Conversion Settings > Traditional→Simplified` page.
  * `Custom Conversion`

    * The types of original and target text can be set in the `Plugin Settings > Conversion Settings > Custom Conversion` page.
  * `Other Conversions`

    * Temporarily call a specific type of conversion.
* Menu Item Introduction

  * `Copy Conversion Result`

    * Copy the conversion result of the selected content to the clipboard.
  * `Insert Conversion Result Above`

    * Insert the conversion result above the selected content.
  * `Insert Conversion Result Above Each Block`

    * Insert the conversion result of each leaf block above the corresponding block in the selected block.
  * `Replace Original Text with Conversion Result`

    * Replace the selected content with the conversion result.
  * `Insert Conversion Result Below Each Block`

    * Insert the conversion result of each leaf block below the corresponding block in the selected block.
  * `Insert Conversion Result Below`

    * Insert the conversion result below the selected content.
  * `Convert Document Title`

    * Rename the document using the converted document title.

### Setting Item Introduction

* `General Settings`

  * `Reset Settings Options`

    * Reset all settings options to their default values.
    * After clicking this button, a confirmation dialog will pop up.

      * After clicking the confirmation button in the dialog, all options of this plugin will be reset to their default values, and the current interface will be automatically refreshed.
* `Conversion Settings`

  * `Global Settings`

    * `Global Extension Dictionary`

      * A user-defined dictionary that takes effect globally. It works in operations such as Simplified → Traditional, Traditional → Simplified, Custom Conversion, and Other Conversions.
      * Dictionary format

        * The original words and target words are separated by spaces in each entry, and the entries are separated by the | character or newline character, as shown below
        * ```plaintext
          原始词汇1 目标词汇1|原始词汇2 目标词汇2|原始词汇3 目标词汇3
          原始词汇4 目标词汇4|原始词汇5 目标词汇5|原始词汇6 目标词汇6
          ```
  * `Simplified → Traditional`

    * `Original Text Type`

      * The text type of the selected content when using the Simplified → Traditional menu item. The following text types can be selected.

        * zh-Hans-CN Simplified Chinese
        * ja-Hani-JP Japanese New Font
    * `Target Text Type`

      * The text type to convert to when using the Simplified → Traditional menu item. The following text types can be selected.

        * zh-Hant Traditional Chinese (OpenCC standard)
        * zh-Hant-HK Traditional Chinese (Hong Kong)
        * zh-Hant-TW Traditional Chinese (Taiwan)
        * zh-Hant-TW Traditional Chinese (Taiwan Common Words)
        * ja-Hani-JP Japanese New Font
    * `Extension Dictionary`

      * A user-defined dictionary that only takes effect when using the Simplified → Traditional menu item. The dictionary format is the same as the Global Extension Dictionary.
  * `Traditional → Simplified`

    * `Original Text Type`

      * The text type of the selected content when using the Traditional → Simplified menu item. The following text types can be selected.

        * zh-Hant Traditional Chinese (OpenCC standard)
        * zh-Hant-HK Traditional Chinese (Hong Kong)
        * zh-Hant-TW Traditional Chinese (Taiwan)
        * zh-Hant-TW Traditional Chinese (Taiwan Common Words)
        * ja-Hani-JP Japanese New Font
    * `Target Text Type`

      * The text type to convert to when using the Traditional → Simplified menu item. The following text types can be selected.

        * zh-Hans-CN Simplified Chinese
        * ja-Hani-JP Japanese New Font
    * `Extension Dictionary`

      * A user-defined dictionary that only takes effect when using the Traditional → Simplified menu item. The dictionary format is the same as the Global Extension Dictionary.
  * `Custom Conversion`

    * `Original Text Type`

      * The text type of the selected content when using the Custom Conversion menu item. All text types are supported.
    * `Target Text Type`

      * The text type to convert to when using the Custom Conversion menu item. All text types are supported.
    * `Extension Dictionary`

      * A user-defined dictionary that only takes effect when using the Custom Conversion menu item. The dictionary format is the same as the Global Extension Dictionary.

## CHANGELOG

[CHANGELOG.md](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-opencc/blob/main/CHANGELOG.md)
