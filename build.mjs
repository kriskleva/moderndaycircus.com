import {cpSync,mkdirSync} from 'node:fs';
mkdirSync('dist',{recursive:true});cpSync('web','dist',{recursive:true});
console.log('Public Lightroom gallery built. No archives, private state, credentials or media copies included.');
