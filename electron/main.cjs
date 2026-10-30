const {app,BrowserWindow,session,utilityProcess,shell}=require('electron');
const path=require('node:path');
let backend;
app.whenReady().then(()=>{
 if(!process.env.TERAVS_REMOTE_API){
  backend=utilityProcess.fork(path.join(__dirname,'../server/index.mjs'),[],{env:{...process.env,TERAVS_DB:path.join(app.getPath('userData'),'teravs.sqlite'),HOST:'127.0.0.1',PORT:'4318'}});
 }
 session.defaultSession.setPermissionRequestHandler((_web,permission,callback)=>callback(['media'].includes(permission)));
 const window=new BrowserWindow({width:1280,height:850,minWidth:800,minHeight:600,backgroundColor:'#10151c',title:'Teravs',webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true}});
 window.webContents.setWindowOpenHandler(({url})=>{try{if(new URL(url).protocol==='https:')shell.openExternal(url)}catch{}return {action:'deny'}});
 window.webContents.on('will-navigate',e=>e.preventDefault());
 window.loadFile(path.join(__dirname,'../dist/index.html'));
});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
app.on('before-quit',()=>backend?.kill());
