<div align="center">
<img alt="图标" src="https://cdn.jsdelivr.net/gh/Zuoqiu-Yingyi/siyuan-plugin-inbox/public/icon.png" style="width: 8em; height: 8em;">

---
[![GitHub 最新发行版本 (最新一次发行/预发行)](https://img.shields.io/github/v/release/Zuoqiu-Yingyi/siyuan-plugin-inbox?include_prereleases&style=flat-square)](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-inbox/releases/latest)
[![GitHub 最新发行时间](https://img.shields.io/github/release-date/Zuoqiu-Yingyi/siyuan-plugin-inbox?style=flat-square)](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-inbox/releases/latest)
[![GitHub 许可证](https://img.shields.io/github/license/Zuoqiu-Yingyi/siyuan-plugin-inbox?style=flat-square)](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-inbox/blob/main/LICENSE)
[![GitHub 最后一次提交时间](https://img.shields.io/github/last-commit/Zuoqiu-Yingyi/siyuan-plugin-inbox?style=flat-square)](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-inbox/commits/main)
![GitHub 仓库大小](https://img.shields.io/github/repo-size/Zuoqiu-Yingyi/siyuan-plugin-inbox?style=flat-square)
![GitHub 代码大小](https://img.shields.io/github/languages/code-size/Zuoqiu-Yingyi/siyuan-plugin-inbox.svg?style=flat-square)
![查看次数](https://hits.b3log.org/Zuoqiu-Yingyi/siyuan-plugin-inbox.svg)
<!-- ![jsDelivr 查看次數 (GitHub)](https://img.shields.io/jsdelivr/gh/hy/Zuoqiu-Yingyi/siyuan-packages-inbox?style=flat-square) -->
[![GitHub 发行版本下载次数](https://img.shields.io/github/downloads/Zuoqiu-Yingyi/siyuan-plugin-inbox/total?style=flat-square)](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-inbox/releases)

---
简体中文 \| [English](./README.md)

---
</div>

# 思源收集箱插件

一款可以让你像网络聊天室一样在局域网中通过浏览器在不同设备间共享信息的[思源笔记](https://github.com/siyuan-note/siyuan)插件。

## 预览

![预览图片](https://cdn.jsdelivr.net/gh/Zuoqiu-Yingyi/siyuan-plugin-inbox/public/preview.png)

## 常见问题

* 其他设备如何访问收集箱应用?

  * 其他设备需要在浏览器中访问 URL `http(s)://host[:port]/plugin/inbox/apps/inbox.html`
  * 其中 `http(s)://host[:port]` 需要填写思源内核服务地址, 例如 `http://192.168.1.2:6806`
* 在收集箱中上传的文件将保存在哪里?

  * 上传的文件默认保存在 `思源工作空间/data/assets/inbox/` 目录下
  * 上传的群组/用户头像默认保存在 `思源工作空间/data/public/inbox/avatar/` 目录下

## 介绍

### 功能介绍

* `应用管理`

  * `注销登录`

    * 访问步骤

      * <kbd>群组面板</kbd>→<kbd>面板右上角菜单</kbd>→<kbd>注销登录</kbd>
    * 功能介绍

      * 注销用户登录状态并刷新页面
    * 注意事项

      * 若用户未设置思源访问授权码, 则仅刷新页面
  * `重置应用`

    * 访问步骤

      * <kbd>群组面板</kbd>→<kbd>面板右上角菜单</kbd>→<kbd>重置应用</kbd>
    * 功能介绍

      * 删除所有收集箱应用数据并初始化收集箱应用

        * 解散除 `主收集箱` 群组以外的所有的群组
        * 删除所有群组的消息
    * 注意事项

      * 需二次确认
* `群组管理`

  * `创建群组`

    * 访问步骤

      * <kbd>群组面板</kbd>→<kbd>面板右上角菜单</kbd>→<kbd>创建群组</kbd>
    * 功能介绍

      * 创建一个新的群组
    * 注意事项

      * 群组 ID 不支持更改
      * 创建的新群组默认仅有一个成员 (当前用户)
  * `显示所有群组`

    * 访问步骤

      * <kbd>群组面板</kbd>→<kbd>面板右上角菜单</kbd>→<kbd>显示所有群组</kbd>
    * 功能介绍

      * 在群组面板中显示所有群组

        * 包括当前用户未加入的群组
      * 用于群组管理
    * 注意事项

      * 默认隐藏未加入的群组
  * `隐藏未加入的群组`

    * 访问步骤

      * <kbd>群组面板</kbd>→<kbd>面板右上角菜单</kbd>→<kbd>隐藏未加入的群组</kbd>
    * 功能介绍

      * 在群组面板中隐藏所有未加入的群组
    * 注意事项

      * 默认隐藏未加入的群组
  * `群组设置`

    * 访问步骤

      * <kbd>群组面板</kbd>→<kbd>群组右侧菜单</kbd>→<kbd>群组设置</kbd>
      * <kbd>消息面板</kbd>→<kbd>点击上方群组图标或群组名称</kbd>
    * 功能介绍

      * 查看群组 ID
      * 设置/上传群组图标
      * 修改群组名称
      * 管理群组成员
    * 注意事项

      * 群组 ID 不支持更改
      * 修改完成后需要点击右下角的 <kbd>确认</kbd> 按钮以保存更改
  * `退出群组`

    * 访问步骤

      * <kbd>群组面板</kbd>→<kbd>群组右侧菜单</kbd>→<kbd>退出群组</kbd>
    * 功能介绍

      * 将当前用户从指定群组的成员列表中移除
    * 注意事项

      * 若当前用户为指定群组的最后一个用户, 则无法退出
  * `解散群组`

    * 访问步骤

      * <kbd>群组面板</kbd>→<kbd>群组右侧菜单</kbd>→<kbd>解散群组</kbd>
    * 功能介绍

      * 删除指定的群组
    * 注意事项

      * 解散的群组将无法在群组面板中查看
      * 群组的名称、成员列表等数据被删除
      * 群组中的消息不会被删除但无法被查看
* `用户管理`

  * `成员设置`

    * 访问步骤

      * <kbd>消息面板</kbd>→<kbd>面板右上角菜单菜单</kbd>→<kbd>成员设置</kbd>
    * 功能介绍

      * 修改当前用户在该群组的身份信息
      * 查看当前用户的 ID
      * 修改/上传当前用户在本群组的头像
      * 修改当前用户在本群组的昵称
    * 注意事项

      * 当前用户的 ID 在所有群组中统一且不可更改
      * 当前用户的头像与昵称可在不同群组中单独配置
      * 主群组 `收集箱` 中的用户头像与昵称为当前用户默认的头像与昵称
      * 修改完成后需要点击右下角的 <kbd>确认</kbd> 按钮以保存更改
  * `删除当前用户`

    * 访问步骤

      * <kbd>群组面板</kbd>→<kbd>面板右上角菜单</kbd>→<kbd>删除当前用户</kbd>
    * 功能介绍

      * 删除当前用户的用户信息并创建一个新的用户
    * 注意事项

      * 需要二次确认
      * 删除当前用户后会将其之前发送的信息视为其他用户发送的信息
* `消息管理`

  * `重载消息`

    * 访问步骤

      * <kbd>消息面板</kbd>→<kbd>面板右上角菜单菜单</kbd>→<kbd>重载消息</kbd>
    * 功能介绍

      * 重新加载该群组的消息列表
  * `清空消息`

    * 访问步骤

      * <kbd>消息面板</kbd>→<kbd>面板右上角菜单菜单</kbd>→<kbd>清空消息</kbd>
    * 功能介绍

      * 删除该群组所有的消息
    * 注意事项

      * 需要二次确认
      * 删除的消息将无法再查看
* `消息操作`

  * 访问步骤

    * <kbd>消息面板</kbd>→<kbd>消息右侧菜单</kbd>
  * `复制`

    * 复制消息为 Markdown 文本, 可以直接在思源中粘贴
  * `转发`

    * 转发消息至其他的群组中
  * `多选`

    * 多选消息以进行批量复制/转发
  * `回复`

    * 引用指定的消息
  * `编辑`

    * 重新编辑该消息
  * `删除`

    * 删除该消息, 删除后消息仍可见, 但是其内容会显示已删除
* `编辑操作`

  * `文本`

    * 使用符号 `**` 设置粗体
    * 使用符号 `_` 设置斜体
    * 使用符号 `°` 设置下划线
    * 使用符号 `~` 设置删除线
    * 使用符号 `` ` `` 设置行内代码
    * 使用符号 ```` ``` ```` 设置多行代码
  * `录音`
  * `表情`
  * `文件`
  * `拍照`
  * `录像`

### 设置项介绍

## 更改日志

[CHANGELOG.md](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-inbox/blob/main/CHANGELOG.md)
