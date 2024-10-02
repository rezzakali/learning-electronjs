import { BrowserWindow, Menu, app, dialog } from 'electron';
import fs from 'node:fs';
import path from 'node:path';

const isMac = process.platform === 'darwin';
const isDev = process.env.NODE_ENV !== 'production';

const createWindow = () => {
  // Create a window that fills the screen's available work area.
  //   const primaryDisplay = screen.getPrimaryDisplay();
  //   const { width, height } = primaryDisplay.workAreaSize;

  const win = new BrowserWindow({
    title: 'My Firts Electron Application',
    center: true,
    width: isDev ? 800 : 900,
    height: 500,
    webPreferences: {
      preload: path.join(app.getAppPath(), 'preload.js'),
    },
  });

  //   isDev && win.webContents.openDevTools();
  win.loadFile('index.html');

  const menuTemplate = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open',
          accelerator: isMac ? 'Cmd+O' : 'Ctrl+O',
          click: () => {
            // open file explorer
            dialog
              .showOpenDialog({
                properties: ['openFile'],
                filters: [
                  {
                    name: 'Text Files',
                    extensions: ['txt', 'md', 'js', 'html'],
                  },
                  {
                    name: 'All Files',
                    extensions: ['*'],
                  },
                ],
              })
              .then((result) => {
                if (!result.canceled) {
                  const filePath = result.filePaths[0];
                  fs.readFile(filePath, 'utf-8', (err, data) => {
                    if (err) {
                      console.err('An error occurred reading the file!', err);
                      return;
                    }
                    // display the file content in the window
                    win.webContents.executeJavaScript(
                      `document.body.innerText=$${JSON.stringify(data)}`
                    );
                  });
                }
              })
              .catch((err) => console.error('Failed to open file!', err));
          },
        },
        {
          label: 'Save',
          accelerator: isMac ? 'Cmd+S' : 'Ctrl+S',
          click: () => {
            // Open save dialog
            dialog
              .showSaveDialog({
                title: 'Save Current Page',
                defaultPath: path.join(
                  app.getPath('documents'),
                  'untitled.txt'
                ),
                filters: [
                  { name: 'Text Files', extensions: ['txt'] },
                  { name: 'All Files', extensions: ['*'] },
                ],
              })
              .then((result) => {
                if (!result.canceled) {
                  const contentToSave = `Your content here...`; // Replace with your page's actual content
                  fs.writeFile(
                    result.filePath,
                    contentToSave,
                    'utf-8',
                    (err) => {
                      if (err) {
                        console.error(
                          'An error occurred saving the file:',
                          err
                        );
                      } else {
                        console.log('File saved successfully');
                      }
                    }
                  );
                }
              })
              .catch((err) => {
                console.error('Failed to save file:', err);
              });
          },
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: isMac ? 'Cmd+Z' : 'Ctrl+Z',
          click: () => {
            console.log('Undo clicked!');
          },
        },
        {
          label: 'Redu',
          accelerator: isMac ? 'Shift+Cmd+Z' : 'Ctrl+Y',
          click: () => {
            console.log('Redu clicked!');
          },
        },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          accelerator: isMac ? 'Cmd+I' : 'Ctrl+I',
          click: () => {
            // show an about dialog
            dialog.showMessageBox({
              type: 'info',
              title: 'About',
              message: 'This is the about dialog!',
              detail: 'Version: 1.0.0\nDeveloped by Rezzak',
              buttons: ['OK', 'Cancel'],
            });
          },
        },
      ],
    },
  ];

  // build menu from template
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
};

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (!isMac) app.quit();
});
