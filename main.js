const { app, BrowserWindow, ipcMain } = require('electron'); // 引入 electron 模块
const path = require('path');
const fs = require('fs'); // 引入 fs 模块, 用于文件操作

const dataPath = path.join(app.getPath('userData'), 'data.json'); // /Users/username/Library/Application Support/App Name/data.json

let mainWindow; // 保存主窗口的引用

// // 函数：保存项目数据到文件
// async function saveItems() {
//     const filePath = path.join(app.getPath('userData'), 'data.json');
//     try {
//         const items = await mainWindow.webContents.executeJavaScript('getTableItems()');
//         await fs.promises.writeFile(filePath, JSON.stringify(items, null, 2));
//         console.log('Items saved to file');  // Debug log
//     } catch (error) {
//         console.error('Failed to save items:', error);
//         throw error;  // 重新抛出错误传递给 renderer
//     }
// }

// 函数：创建主窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile('index.html');
  console.log('Data path:', dataPath);
  console.log('Preload path:', path.join(__dirname, 'preload.js'));
  console.log('Index path:', path.join(__dirname, 'index.html'));

  mainWindow.on('close', async (event) => {
    // 信号'close'由窗口关闭时触发

    event.preventDefault();
    console.log('Window close event triggered');  // Debug log
    try {
      if (mainWindow) {
        // 发送消息到 renderer 进程保存数据
        await saveItems();
        mainWindow.webContents.send('app-close');  // 发送关闭消息到 renderer
      }
    } catch (error) {
      console.error('Error during save or close process:', error);
      if (mainWindow) {
        mainWindow.destroy();  // 强制关闭窗口
      } else {
        app.quit();  // 如果 mainWindow 不存在，直接退出应用
      }
    }
  });
}

// 应用就绪时，创建窗口
app.on('ready', createWindow);

// 当所有窗口关闭时，退出应用（macOS 除外）
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 激活应用时，如果没有窗口，则创建一个新的窗口
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC 处理：获取项目数据
ipcMain.handle('get-items', async () => {
  console.log('Fetching items from file:', dataPath);  // Debug log
  if (fs.existsSync(dataPath)) {
    const data = fs.readFileSync(dataPath);
    console.log('Items read from file:', data);  // Debug log
    return JSON.parse(data);
  }
  console.log('No items found, returning empty array');  // Debug log
  return [];
});

// IPC 处理：保存项目数据
ipcMain.handle('save-items', async (event, items) => {
  try {
    await saveItems();
    console.log('Items saved to file');  // Debug log
  } catch (error) {
    console.error('Failed to save items:', error);
    throw error;  // 重新抛出错误传递给 renderer
  }
});

// IPC 处理：退出应用
ipcMain.on('app-quit', () => {
  if (mainWindow) {
    console.log('Quitting application');  // Debug log
    mainWindow.destroy();  // 强制关闭窗口
    console.log('mainWindow destroyed');  // Debug log
  }
  app.quit();
});

async function saveItems() {
  const items = await mainWindow.webContents.executeJavaScript('getTableItems()');
  await fs.promises.writeFile(dataPath, JSON.stringify(items, null, 2));
}