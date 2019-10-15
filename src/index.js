const { exec } = require('child_process');
const { app, ipcMain, BrowserWindow } = require('electron');

// Workaround for Windows installation process
// https://www.electronforge.io/config/makers/squirrel.windows
if (require('electron-squirrel-startup')) return app.quit();

// Workaround for unix to help it find dotnet command
const isWin = /^win/.test(process.platform);

if (!isWin) {
    process.env.PATH = process.env.PATH + ':/usr/local/bin';
}

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
        exec(`dotnet ${__dirname}/netcoreapp3.0/InternalToolsDeveloperFsharpCheck.dll`, (error, stdout) => {
            if (error) {
                throw error;
            }

            win.webContents
                .send('load-data', stdout.replace(/\n|\[|\]/g, '').split(/;\s+/g).map(datum => {
                return datum.slice(1, -1).split('-');
            }));
        });
    };

    win.webContents.once('dom-ready', () => getData());

    ipcMain.on('refresh', () => getData());

    win.on('closed', () => {
        win = null;
    })
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    // Small tweak to leave the application in the dock
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});
