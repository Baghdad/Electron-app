const { exec } = require('child_process');
const { app, ipcMain, BrowserWindow } = require('electron');

let win;

function createWindow () {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });

    win.loadFile(`${__dirname}/renderer/index.html`);

    let getData = () => {
        exec(`dotnet ${__dirname}/netcoreapp2.1/publish/InternalToolsDeveloperFsharpCheck.dll`, (error, stdout) => {
            if (error) {
                throw error;
            }

            win.webContents
                .send('load-data', stdout.replace(/\n|\[|\]/g, '').split(/;\s+/g).map(datum => {
                return datum.slice(1, -1).split('-');
            }));
        });
    };

    win.once('show', () => getData());

    ipcMain.on('refresh', () => getData());

    win.on('closed', () => {
        win = null;
    })
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});
