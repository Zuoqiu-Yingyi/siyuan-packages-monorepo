<div align="center">
<img alt="圖標" src="https://cdn.jsdelivr.net/gh/Zuoqiu-Yingyi/siyuan-plugin-opencc/public/icon.png" style="width: 8em; height: 8em;">

---
[![GitHub 最新發行版本 (最新一次發行/預發行)](https://img.shields.io/github/v/release/Zuoqiu-Yingyi/siyuan-plugin-opencc?include_prereleases&style=flat-square)](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-opencc/releases/latest)
[![GitHub 最新發行時間](https://img.shields.io/github/release-date/Zuoqiu-Yingyi/siyuan-plugin-opencc?style=flat-square)](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-opencc/releases/latest)
[![GitHub 許可證](https://img.shields.io/github/license/Zuoqiu-Yingyi/siyuan-plugin-opencc?style=flat-square)](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-opencc/blob/main/LICENSE)
[![GitHub 最後一次提交時間](https://img.shields.io/github/last-commit/Zuoqiu-Yingyi/siyuan-plugin-opencc?style=flat-square)](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-opencc/commits/main)
![GitHub 倉庫大小](https://img.shields.io/github/repo-size/Zuoqiu-Yingyi/siyuan-plugin-opencc?style=flat-square)
![查看次數](https://hits.b3log.org/Zuoqiu-Yingyi/siyuan-plugin-opencc.svg)
<!-- ![jsDelivr 查看次數 (GitHub)](https://img.shields.io/jsdelivr/gh/hy/Zuoqiu-Yingyi/siyuan-packages-opencc?style=flat-square) -->
[![GitHub 發行版本下載次數](https://img.shields.io/github/downloads/Zuoqiu-Yingyi/siyuan-plugin-opencc/total?style=flat-square)](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-opencc/releases)

---
[簡體中文](./README_zh_CN.md) \| 繁體中文 \| [English](./README.md)

---
</div>

# 思源中文轉換插件

這是一款使用 [OpenCC](https://github.com/BYVoid/OpenCC) 與 [opencc-js](https://github.com/nk2028/opencc-js) 項目進行離線中文轉換的[思源筆記](https://github.com/siyuan-note/siyuan)插件。

## 預覽

![預覽圖片](https://cdn.jsdelivr.net/gh/Zuoqiu-Yingyi/siyuan-plugin-opencc/public/preview.png)

## 常見問題

## 介紹

### 功能介紹

* 支持的文本類型

  * `zh-Hans-CN` 簡體中文
  * `zh-Hant` 繁體中文（OpenCC 標準）
  * `zh-Hant-HK` 繁體中文（香港繁體）
  * `zh-Hant-TW` 繁體中文（臺灣正體）
  * `zh-Hant-TW` 繁體中文（臺灣正體常用詞）
  * `ja-Hani-JP` 日文新字體
  * 詳情請參考 [OpenCC 預設配置文件](https://github.com/BYVoid/OpenCC#預設配置文件)
* 使用 <kbd>右鍵菜單</kbd>/<kbd>塊菜單</kbd> > <kbd>插件</kbd> > <kbd>中文轉換</kbd> 菜單項調用本插件功能

  * `簡 → 繁`

    * 簡體類型與繁體類型可在 `插件設置 > 轉換設置 > 簡→繁` 頁面中設置
  * `繁 → 簡`

    * 簡體類型與繁體類型可在 `插件設置 > 轉換設置 > 繁→簡` 頁面中設置
  * `自定義轉換`

    * 原始文本類型與目標文本類型可在 `插件設置 > 轉換設置 > 自定義轉換` 頁面中設置
  * `其他轉換`

    * 臨時調用一次指定類型的轉換
* 菜單項介紹

  * `複製轉換結果`

    * 將所選內容轉換結果寫入剪貼板
  * `在上方插入轉換結果`

    * 將轉換結果插入所選內容的上方
  * `在每個塊的上方插入轉換結果`

    * 在所選塊中每一個葉子塊的上方插入對應塊的轉換結果
  * `轉換結果替換原文本`

    * 使用轉換結果替換所選的內容
  * `在每個塊的下方插入轉換結果`

    * 在所選塊中每一個葉子塊的下方插入對應塊的轉換結果
  * `在下方插入轉換結果`

    * 將轉換結果插入所選內容的下方
  * `轉換文檔標題`

    * 使用轉換後的文檔標題重命名文檔

### 設置項介紹

* `常規設置`

  * `重置設置選項`

    * 重置所有設置選項為默認選項
    * 點擊該按鈕後會彈出確認對話框

      * 點擊對話框確認按鈕後會重置本插件所有選項為默認選項, 之後會自動刷新當前界面
* `轉換設置`

  * `全局設置`

    * `全局擴展字典`

      * 全局生效的用戶自定義字典, 在 `簡 → 繁`, `繁 → 簡`, `自定義轉換` 與 `其他轉換` 操作中都生效
      * 字典格式

        * 每一個詞條中使用空格分隔原始詞彙與目標詞彙，詞條之間使用 `|` 字符或換行符分割, 如下所示
        * ```plaintext
          原始詞彙1 目標詞彙1|原始詞彙2 目標詞彙2|原始詞彙3 目標詞彙3
          原始詞彙4 目標詞彙4|原始詞彙5 目標詞彙5|原始詞彙6 目標詞彙6
          ```
  * `簡 → 繁`

    * `原始文本類型`

      * 使用菜單項 `簡 → 繁` 操作時所選內容的文本類型, 可選擇如下文本類型

        * `zh-Hans-CN` 簡體中文
        * `ja-Hani-JP` 日文新字體
    * `目標文本類型`

      * 使用菜單項 `簡 → 繁` 操作時轉換目標的文本類型, 可選擇如下文本類型

        * `zh-Hant` 繁體中文（OpenCC 標準）
        * `zh-Hant-HK` 繁體中文（香港繁體）
        * `zh-Hant-TW` 繁體中文（臺灣正體）
        * `zh-Hant-TW` 繁體中文（臺灣正體常用詞）
        * `ja-Hani-JP` 日文新字體
    * `擴展字典`

      * 僅在使用菜單項 `簡 → 繁` 操作時生效的用戶自定義字典, 字典格式與 `全局擴展字典` 一致
  * `繁 → 簡`

    * `原始文本類型`

      * 使用菜單項 `繁 → 簡` 操作時所選內容的文本類型, 可選擇如下文本類型

        * `zh-Hant` 繁體中文（OpenCC 標準）
        * `zh-Hant-HK` 繁體中文（香港繁體）
        * `zh-Hant-TW` 繁體中文（臺灣正體）
        * `zh-Hant-TW` 繁體中文（臺灣正體常用詞）
        * `ja-Hani-JP` 日文新字體
    * `目標文本類型`

      * 使用菜單項 `繁 → 簡` 操作時轉換目標的文本類型, 可選擇如下文本類型

        * `zh-Hans-CN` 簡體中文
        * `ja-Hani-JP` 日文新字體
    * `擴展字典`

      * 僅在使用菜單項 `繁 → 簡` 操作時生效的用戶自定義字典, 字典格式與 `全局擴展字典` 一致
  * `自定義轉換`

    * `原始文本類型`

      * 使用菜單項 `自定義轉換` 操作時所選內容的文本類型, 支持選擇所有文本類型
    * `目標文本類型`

      * 使用菜單項 `自定義轉換` 操作時轉換目標的文本類型, 支持選擇所有文本類型
    * `擴展字典`

      * 僅在使用菜單項 `自定義轉換` 操作時生效的用戶自定義字典, 字典格式與 `全局擴展字典` 一致

## 更改日誌

[CHANGELOG.md](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-opencc/blob/main/CHANGELOG.md)
