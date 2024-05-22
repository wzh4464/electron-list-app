const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const dataPath = path.join(__dirname, 'data.json');

let mainWindow;

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

  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  mainWindow.on('close', async (event) => {
    event.preventDefault();
    await saveItems();
    mainWindow.destroy();
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

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

ipcMain.handle('save-items', async (event, items) => {
  console.log('Saving items to file:', items);  // Debug log
  fs.writeFileSync(dataPath, JSON.stringify(items, null, 2));
  console.log('Items saved to file successfully');  // Debug log
});

async function saveItems() {
  const items = await mainWindow.webContents.executeJavaScript('items');
  fs.writeFileSync(dataPath, JSON.stringify(items));
}
