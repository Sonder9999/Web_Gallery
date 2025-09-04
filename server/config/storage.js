// server/config/storage.js - 文件存储配置

module.exports = {
    // 是否启用按标签分类存储
    enableTagBasedFolders: true,

    // 文件夹层数配置
    // 1 = 只使用第一个标签作为文件夹 (例如: images/genshin/)
    // 2 = 使用前两个标签作为文件夹层级 (例如: images/genshin/kokomi/)
    // 3 = 使用前三个标签 (例如: images/genshin/kokomi/summer/)
    folderDepth: 1,

    // 无标签图片存储文件夹名称
    // 当图片没有任何标签时，会存储在 images/{noTagsFolder}/ 下
    noTagsFolder: 'others',

    // 标签到文件夹名的转换规则
    tagToFolderName: {
        // 是否转换为小写
        lowercase: true,
        // 是否将空格替换为下划线
        replaceSpaces: true,
        // 是否移除特殊字符（保留中文、英文、数字、下划线、连字符）
        removeSpecialChars: true
    }
};

/*
使用示例：
- 标签: ["Genshin Impact", "Kokomi"] -> 文件夹: images/genshin_impact/kokomi/
- 标签: ["原神", "心海"] -> 文件夹: images/原神/心海/
- 标签: [] -> 文件夹: images/others/
- 标签: ["Honkai Impact 3rd", "Elysia", "Summer"] + folderDepth=2 -> 文件夹: images/honkai_impact_3rd/elysia/

配置说明：
1. enableTagBasedFolders = false: 所有图片直接存储在 images/ 下（原来的方式）
2. folderDepth = 1: images/第一个标签/
3. folderDepth = 2: images/第一个标签/第二个标签/
4. 以此类推...
*/
