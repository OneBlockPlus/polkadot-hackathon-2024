const {
    app,
    BrowserWindow,
    ipcMain,
    dialog
} = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 700,
        resizable: false,
        minimizable: false,
        maximizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });
    win.loadFile('./browserWindows/src/page/login.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.on('select-folder', async (event) => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });

    if (!result.canceled && result.filePaths.length > 0) {
        const folderPath = result.filePaths[0];
        fs.readdir(folderPath, (err, files) => {
            if (err) {
                console.error('Error reading directory:', err);
                return;
            }
            const videoFiles = files
                .filter(file => file.endsWith('.pflx'))
                .map(file => ({
                    name: file,
                    path: `file://${path.join(folderPath, file)}`
                }));

            event.sender.send('selected-videos', videoFiles);
        });
    }
});

ipcMain.handle('select-file', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openFile'],
    });

    if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths[0];
    }
    return null;
});