<div align="center">
<img alt="icon" src="https://cdn.jsdelivr.net/gh/Zuoqiu-Yingyi/siyuan-plugin-inbox/public/icon.png" style="width: 8em; height: 8em;">

---
[![GitHub release (latest by date including pre-releases)](https://img.shields.io/github/v/release/Zuoqiu-Yingyi/siyuan-plugin-inbox?include_prereleases&style=flat-square)](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-inbox/releases/latest)
[![GitHub Release Date](https://img.shields.io/github/release-date/Zuoqiu-Yingyi/siyuan-plugin-inbox?style=flat-square)](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-inbox/releases/latest)
[![GitHub License](https://img.shields.io/github/license/Zuoqiu-Yingyi/siyuan-plugin-inbox?style=flat-square)](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-inbox/blob/main/LICENSE)
[![GitHub last commit](https://img.shields.io/github/last-commit/Zuoqiu-Yingyi/siyuan-plugin-inbox?style=flat-square)](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-inbox/commits/main)
![GitHub repo size](https://img.shields.io/github/repo-size/Zuoqiu-Yingyi/siyuan-plugin-inbox?style=flat-square)
![GitHub code size](https://img.shields.io/github/languages/code-size/Zuoqiu-Yingyi/siyuan-plugin-inbox.svg?style=flat-square)
![hits](https://hits.b3log.org/Zuoqiu-Yingyi/siyuan-plugin-inbox.svg)
<!-- ![jsDelivr hits (GitHub)](https://img.shields.io/jsdelivr/gh/hy/Zuoqiu-Yingyi/siyuan-packages-inbox?style=flat-square) -->
[![GitHub all releases](https://img.shields.io/github/downloads/Zuoqiu-Yingyi/siyuan-plugin-inbox/total?style=flat-square)](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-inbox/releases)

---
[简体中文](./README_zh_CN.md) \| English

---
</div>

# SiYuan Inbox Plugin

A Siyuan Note plugin that allows you to share information among different devices in a local area network through a browser, just like in an online chat room.

## Preview

![Preview Image](https://cdn.jsdelivr.net/gh/Zuoqiu-Yingyi/siyuan-plugin-inbox/public/preview.png)

## Frequently Asked Questions

* How can other devices access the inbox application?

  * Other devices need to access the URL `http(s)://host[:port]/plugin/inbox/apps/inbox.html`
  * The `http(s)://host[:port]` should be filled with the Siyuan core service address, such as `http://192.168.1.2:6806`
* Where are the uploaded files saved in the inbox?

  * The uploaded files are saved in the default directory `思源工作空间/data/assets/inbox/`
  * The uploaded group/user avatars are saved in the default directory `思源工作空间/data/public/inbox/avatar/`

## Introduction

### Function Introduction

* `Application Management`

  * `Logout`

    * Access Steps

      * <kbd>Group Panel</kbd> → <kbd>Panel Menu in the Upper Right Corner</kbd> → <kbd>Logout</kbd>
    * Function

      * Logout the user and refresh the page
    * Notes

      * If the user has not set the Siyuan access authorization code, only the page will be refreshed
  * `Reset Application`

    * Access Steps

      * <kbd>Group Panel</kbd> → <kbd>Panel Menu in the Upper Right Corner</kbd> → <kbd>Reset Application</kbd>
    * Function

      * Delete all inbox application data and initialize the inbox application

        * Disband all groups except the `Main Inbox` group
        * Delete all group messages
    * Notes

      * Confirmation is required for reset
* `Group Management`

  * `Create Group`

    * Access Steps

      * <kbd>Group Panel</kbd> → <kbd>Panel Menu in the Upper Right Corner</kbd> → <kbd>Create Group</kbd>
    * Function

      * Create a new group
    * Notes

      * Group ID cannot be changed
      * The created group initially has only one member (the current user)
  * `Show All Groups`

    * Access Steps

      * <kbd>Group Panel</kbd> → <kbd>Panel Menu in the Upper Right Corner</kbd> → <kbd>Show All Groups</kbd>
    * Function

      * Display all groups in the group panel

        * Including groups that the current user has not joined
      * Used for group management
    * Notes

      * Unjoined groups are hidden by default
  * `Hide Unjoined Groups`

    * Access Steps

      * <kbd>Group Panel</kbd> → <kbd>Panel Menu in the Upper Right Corner</kbd> → <kbd>Hide Unjoined Groups</kbd>
    * Function

      * Hide all unjoined groups in the group panel
    * Notes

      * Unjoined groups are hidden by default
  * `Group Settings`

    * Access Steps

      * <kbd>Group Panel</kbd> → <kbd>Group Menu on the Right</kbd> → <kbd>Group Settings</kbd>
      * <kbd>Message Panel</kbd> → <kbd>Click on the Group Icon or Group Name Above</kbd>
    * Function

      * View the group ID
      * Set/upload the group icon
      * Modify the group name
      * Manage group members
    * Notes

      * Group ID cannot be changed
      * After modification, click the <kbd>Confirm</kbd> button in the lower right corner to save the changes
  * `Leave Group`

    * Access Steps

      * <kbd>Group Panel</kbd> → <kbd>Group Menu on the Right</kbd> → <kbd>Leave Group</kbd>
    * Function

      * Remove the current user from the member list of the specified group
    * Notes

      * If the current user is the last member of the specified group, they cannot leave
  * `Disband Group`

    * Access Steps

      * <kbd>Group Panel</kbd> → <kbd>Group Menu on the Right</kbd> → <kbd>Disband Group</kbd>
    * Function

      * Delete the specified group
    * Notes

      * The disbanded group cannot be viewed in the group panel
      * The group name, member list, and other data will be deleted
      * The messages in the group will not be deleted but cannot be viewed
* `User Management`

  * `Member Settings`

    * Access Steps

      * <kbd>Message Panel</kbd> → <kbd>Panel Menu in the Upper Right Corner</kbd> → <kbd>Member Settings</kbd>
    * Function

      * Modify the user's identity information in the group
      * View the user's ID
      * Modify/upload the user's avatar in the group
      * Modify the user's nickname in the group
    * Notes

      * The user's ID is consistent and cannot be changed in all groups
      * The user's avatar and nickname can be configured separately in different groups
      * The user's avatar and nickname in the main group `Inbox` are the default avatar and nickname for the current user
      * After modification, click the <kbd>Confirm</kbd> button in the lower right corner to save the changes
  * `Delete Current User`

    * Access Steps

      * <kbd>Group Panel</kbd> → <kbd>Panel Menu in the Upper Right Corner</kbd> → <kbd>Delete Current User</kbd>
    * Function

      * Delete the current user's user information and create a new user
    * Notes

      * Confirmation is required for deletion
      * After deleting the current user, the messages sent by them will be considered as messages sent by other users
* `Message Management`

  * `Reload Messages`

    * Access Steps

      * <kbd>Message Panel</kbd> → <kbd>Panel Menu in the Upper Right Corner</kbd> → <kbd>Reload Messages</kbd>
    * Function

      * Reload the message list of the group
  * `Clear Messages`

    * Access Steps

      * <kbd>Message Panel</kbd> → <kbd>Panel Menu in the Upper Right Corner</kbd> → <kbd>Clear Messages</kbd>
    * Function

      * Delete all messages in the group
    * Notes

      * Confirmation is required for deletion
      * The deleted messages cannot be viewed
* `Message Operations`

  * Access Steps

    * <kbd>Message Panel</kbd> → <kbd>Message Menu on the Right</kbd>
  * `Copy`

    * Copy the message as Markdown text, which can be directly pasted into Siyuan
  * `Forward`

    * Forward the message to other groups
  * `Multi-select`

    * Select multiple messages for batch copying/forwarding
  * `Reply`

    * Quote a specified message
  * `Edit`

    * Edit the message again
  * `Delete`

    * Delete the message, the deleted message will still be visible, but its content will be displayed as deleted
* `Editing Operations`

  * `Text`

    * Use `**` symbols for bold text
    * Use `_` symbols for italics
    * Use `°` symbols for underline
    * Use `~` symbols for strikethrough
    * Use `` ` `` symbols for inline code
    * Use ```` ``` ```` symbols for multi-line code
  * `Voice Recording`
  * `Emoji`
  * `File`
  * `Take Photo`
  * `Record Video`

### Settings Introduction

## Changelog

[CHANGELOG.md](https://github.com/Zuoqiu-Yingyi/siyuan-plugin-inbox/blob/main/CHANGELOG.md)
