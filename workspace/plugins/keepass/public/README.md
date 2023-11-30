<div align="center">
<img alt="icon" src="https://cdn.jsdelivr.net/gh/Zuoqiu-Yingyi/siyuan-plugin-keepass/public/icon.png" style="width: 8em; height: 8em;">

---
[![GitHub release (latest by date including pre-releases)](https://img.shields.io/github/v/release/Zuoqiu-Yingyi/siyuan-plugin-keepass?include_prereleases&style=flat-square)](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-keepass/releases/latest)
[![GitHub Release Date](https://img.shields.io/github/release-date/Zuoqiu-Yingyi/siyuan-plugin-keepass?style=flat-square)](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-keepass/releases/latest)
[![GitHub License](https://img.shields.io/github/license/Zuoqiu-Yingyi/siyuan-plugin-keepass?style=flat-square)](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-keepass/blob/main/LICENSE)
[![GitHub last commit](https://img.shields.io/github/last-commit/Zuoqiu-Yingyi/siyuan-plugin-keepass?style=flat-square)](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-keepass/commits/main)
![GitHub repo size](https://img.shields.io/github/repo-size/Zuoqiu-Yingyi/siyuan-plugin-keepass?style=flat-square)
![GitHub code size](https://img.shields.io/github/languages/code-size/Zuoqiu-Yingyi/siyuan-plugin-keepass.svg?style=flat-square)
![hits](https://hits.b3log.org/Zuoqiu-Yingyi/siyuan-plugin-keepass.svg)
<!-- ![jsDelivr hits (GitHub)](https://img.shields.io/jsdelivr/gh/hy/Zuoqiu-Yingyi/siyuan-packages-keepass?style=flat-square) -->
[![GitHub all releases](https://img.shields.io/github/downloads/Zuoqiu-Yingyi/siyuan-plugin-keepass/total?style=flat-square)](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-keepass/releases)

---
[简体中文](./README_zh_CN.md) \| English

---
</div>

# SiYuan KeePass Password Manager Plugin

This is a plugin for [SiYuan](https://github.com/siyuan-note/siyuan), developed based on the [KeeWeb](https://github.com/keeweb/keeweb) project. It provides a fully offline and comprehensive password management functionality, supporting read and write access to KeePass database files `*.kdbx` of versions 3.x and 4.x, and comes with a built-in KeeWeb plugin for connecting to SiYuan services.

## Preview

![Preview Image](https://cdn.jsdelivr.net/gh/Zuoqiu-Yingyi/siyuan-plugin-keepass/public/preview.png)

## Frequently Asked Questions

* Is this project open source?

  * This project is fully open source and uses the [AGPL-3.0-or-later](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-keepass/blob/main/LICENSE) license. It consists of multiple components.

    * Monorepo repository of the project: [Zuoqiu-Yingyi/siyuan-packages-monorepo](https://github.com/Zuoqiu-Yingyi/siyuan-packages-monorepo)

      * The main repository of the project is part of the monorepo, with most of the development activities taking place in the monorepo repository.
      * The main repository of the project at the path in the monorepo repository: [siyuan-packages-monorepo/workspace/plugins/keepass](https://github.com/Zuoqiu-Yingyi/siyuan-packages-monorepo/tree/main/workspace/plugins/keepass)
    * Main repository of the project: [Zuoqiu-Yingyi/siyuan-plugin-keepass](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-keepass)

      * This repository contains two plugins.
      * SiYuan Note plugin (plugin name: `keepass`)

        * Deploys KeeWeb service in SiYuan Note.
        * Includes all official plugins provided by KeeWeb marketplace, enabling full offline usage of KeeWeb related services.
        * Synchronizes KeeWeb user configuration information across multiple browsers.
        * Provides other useful features, details can be found in the "Features" section.
      * KeeWeb plugin (plugin name: `siyuan`)

        * Connects to SiYuan Note services.
        * Reads and writes `*.kdbx` database files located in the SiYuan Note workspace directory.
    * Branch repository for KeeWeb development: [Zuoqiu-Yingyi/keeweb](https://github.com/Zuoqiu-Yingyi/keeweb)

      * Optimizes the packaging process by turning off compression during build.
      * Optimizes CSP (Content Security Policy) signature strategy.
      * Adds trust for SiYuan extensions.
      * Adds offline loading of community extension plugins.
* Unable to read databases under SiYuan workspace in KeeWeb page

  * Please check if the SiYuan service URL and Token are correctly set in the plugin settings, or open the KeeWeb page in a SiYuan tab.
* How to install the KeeWeb plugin `siyuan` in other KeeWeb applications?

  * The KeeWeb plugin `siyuan` is already built-in the SiYuan plugin `keepass` and can be installed using the following address:

    * `http(s)://<SiYuan-service>/plugins/keepass/keeweb/plugins/siyuan`
  * Alternatively, you can install it from the build branch of this project:

    * [https://raw.githubusercontent.com/Zuoqiu-Yingyi/siyuan-plugin-keepass/publish/keeweb/plugins/siyuan](https://raw.githubusercontent.com/Zuoqiu-Yingyi/siyuan-plugin-keepass/publish/keeweb/plugins/siyuan)

## Introduction

### SiYuan Note Plugin `keepass`

#### Features

* Built-in KeeWeb application

  * After installing this plugin, access `http(s)://siyuan/plugins/keepass/keeweb/app/` to use the built-in KeeWeb application.
  * Can be used fully offline.
  * Can load KeeWeb community plugins fully offline.
* Synchronize KeeWeb user configuration

  * Only supports synchronizing user configuration of the built-in KeeWeb application.
* `Open KeeWeb in New Tab`

  * Ways to access this feature:

    * Click the "KeePass Password Manager" button on the top right corner of SiYuan → "Open KeeWeb in New Tab"
    * Use the command "KeePass Password Manager: Open KeeWeb in New Tab"
    * Set a custom shortcut key
* `Open KeeWeb in Browser`

  * Ways to access this feature:

    * Click the "KeePass Password Manager" button on the top right corner of SiYuan → "Open KeeWeb in Browser"
    * Use the command "KeePass Password Manager: Open KeeWeb in Browser"
    * Set a custom shortcut key
* `Open KeeWeb in New Window`

  * Ways to access this feature:

    * Click the "KeePass Password Manager" button on the top right corner of SiYuan → "Open KeeWeb in New Window"
    * Use the command "KeePass Password Manager: Open KeeWeb in New Window"
    * Set a custom shortcut key

      * This shortcut key is a global shortcut in the desktop application of SiYuan.

#### Settings Introduction

* `General Settings`

  * `Reset Settings`

    * This is a button.
    * Resets all settings options of this plugin to their default values.
    * Refreshes the page after resetting.
  * `Delete KeeWeb User Configuration`

    * This is a button.
    * Delete all KeeWeb user configurations.
    * If the KeeWeb app does not load properly, you can use this button to initialize the Keeweb app.
* `KeeWeb Settings`

  * `Plugins`

    * `KeeWeb Plugin: siyuan`

      * This is a toggle switch.
      * Default status: `Enabled`
      * When enabled, it installs the `siyuan` plugin in the built-in KeeWeb application.
      * When disabled, it uninstalls the `siyuan` plugin in the built-in KeeWeb application.
      * After making changes, you need to refresh the KeeWeb application page for the changes to take effect.
      * The status of this switch will be synchronized after installing/uninstalling the `siyuan` plugin in the KeeWeb application.
  * `Window`

    * `Window Width`

      * This is a numerical input box.
      * Default value: `800`
      * Unit: pixels `px`
      * Sets the initial width of the window when using the "Open KeeWeb in New Window" feature.
    * `Window Height`

      * This is a numerical input box.
      * Default value: `600`
      * Unit: pixels `px`
      * Sets the initial height of the window when using the "Open KeeWeb in New Window" feature.
    * `Window Center`

      * This is a toggle switch.
      * Default value: `Disabled`
      * Sets the position of the new window opened by the "Open KeeWeb in New Window" feature.

        * When enabled, the new window is displayed in the center of the screen.
        * When disabled, the new window is displayed at the current mouse position.
    * `Window Always-on-Top`

      * This is a toggle switch.
      * Default value: `Enabled`
      * Sets whether the new window opened by the "Open KeeWeb in New Window" feature is always displayed on top by default.

        * When enabled, the new window is displayed on top by default.
        * When disabled, the new window is not displayed on top by default.
      * The window always-on-top feature only works on desktop versions.

        * You can use the shortcut key <kbd>Ctrl + Shift + Space</kbd> or the window toolbar menu item <kbd>View</kbd>→<kbd>Toggle On Top</kbd> to toggle the on-top status for newly opened windows on desktop versions.

### KeeWeb Plugin `siyuan`

#### Features

* Adds a <kbd>SiYuan</kbd> button on the KeeWeb main interface

  * Allows selecting and loading KeePass database files `*.kdbx` from the SiYuan workspace directory.
  * The initial directory of the file selector is influenced by the "Default File Open Directory" plugin setting.

    * The default initial directory is `/data/storage/petal/keepass/`.
* Saves KeePass database files `*.kdbx` to the SiYuan Note workspace

  * KeePass database files `*.kdbx` opened from the SiYuan workspace location will be saved at their original locations.
  * Newly created KeePass database files `*.kdbx` will be saved in the directory specified by the "Default *.kdbx File Storage Directory" setting.

    * By default, they are saved in the directory `/data/storage/petal/keepass/`.

#### Settings Introduction

* `SiYuan service base URL`

  * This is a text input box.
  * Default: empty
  * Set the URL of the SiYuan Note service to connect to.

    * Leave it empty to connect to the current SiYuan Note service.
    * Can connect to other SiYuan Note services.
* `SiYuan Service Token`

  * This is a text input box.
  * Default: empty
  * Set the token of the SiYuan Note service to connect to.

    * If connecting to the current SiYuan Note service, it can be left empty.

      * Requires authentication through the login of the current SiYuan Note.
    * If connecting to other SiYuan Note services, the corresponding token needs to be set.
* `Default *.kdbx File Storage Directory`

  * This is a text input box.
  * Default: `/data/storage/petal/keepass/`
  * Specify the storage directory for newly created KeePass database files `*.kdbx`.

    * The root directory of this path is the workspace directory of SiYuan Note.
* `Default File Open Directory`

  * This is a drop-down selection box.
  * Default: `Default *.kdbx File Storage Directory`
  * Set the default directory for the file selector opened by the "SiYuan Note" button on the KeeWeb main interface.
  * Options:

    * `Default *.kdbx file storage directory`

      * Opens the directory specified by the <kbd>Default *.kdbx File Storage Directory</kbd> setting by default.
    * `Root Directory of SiYuan Note Workspace`

      * Opens the root directory of the SiYuan Note workspace by default.

## Changelog

[CHANGELOG.md](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-keepass/blob/main/CHANGELOG.md)
