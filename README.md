# 🎵 媒体播放检测扩展 (Chrome & Firefox)

一个浏览器扩展，自动检测和恢复网页中的音视频播放，支持 **Chrome** 和 **Firefox**。

![1_0_0_preview](/docs/1_0_0_preview.png)

## ✨ 功能特点

- **自动检测音视频播放：** 检查所有打开的标签页，恢复暂停的媒体（音频或视频）。
- **兼容多种网站：** 尤其针对视频网站（如哔哩哔哩）播放问题。
- **手动控制：** 点击扩展图标，可以手动开启或停止对特定标签页的跟踪。

---

## 📂 文件结构

```
media-playback-checker/
├── chrome/                   # Chrome 扩展版本
│   ├── icons/                # 图标文件
│   ├── background.js         # 后台脚本
│   ├── content.js            # 内容脚本
│   ├── manifest.json         # Chrome 扩展配置
│   ├── popup.html            # 弹窗页面
│   └── popup.js              # 弹窗脚本
└── firefox/                  # Firefox 扩展版本
    ├── icons/                # 图标文件
    ├── background.js         # 后台脚本
    ├── content.js            # 内容脚本
    ├── manifest.json         # Firefox 扩展配置
    ├── popup.html            # 弹窗页面
    └── popup.js              # 弹窗脚本
```

---

## 🚀 安装方法

### Chrome

1. 打开 **Chrome 浏览器**，进入 `chrome://extensions/`。
2. 打开右上角的 **开发者模式**。
3. 点击 **加载已解压的扩展程序**，选择 **chrome** 文件夹。

### Firefox

1. 打开 **Firefox 浏览器**，进入 `about:debugging#/runtime/this-firefox`。
2. 点击 **加载临时附加组件**。
3. 选择 **firefox** 文件夹中的 **manifest.json**。

---

## 🔧 使用方法

1. 安装后，扩展图标会出现在浏览器工具栏上。
2. 点击图标可手动启动或停止跟踪当前标签页的媒体播放状态。
3. 扩展会每秒检查一次播放状态，如有暂停，会自动恢复播放。

---
