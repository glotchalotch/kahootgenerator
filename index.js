const {app, BrowserWindow} = require('electron');
const os = require('os');
const dirname = `${os.tmpdir() + require('path').sep + "khgTemp"}`;
const del = require('del');

app.on('ready', () => {
    let window = new BrowserWindow({webPreferences:{nodeIntegration:true}, width: 1191, icon: "./favicon.ico"});
    window.removeMenu();
    window.loadFile('index.html');  
});

app.on('window-all-closed', () => {
    del(dirname, {force: true});
    app.exit();
})