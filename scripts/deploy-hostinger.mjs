import * as ftp from 'basic-ftp';
import path from 'path';
import { fileURLToPath } from 'url';

Object.assign(global, { __filename: fileURLToPath(import.meta.url), __dirname: path.dirname(fileURLToPath(import.meta.url)) });

const outDir = path.resolve(__dirname, '..', 'out');


async function deploy() {
  const client = new ftp.Client();
  client.ftp.verbose = false;

  try {
    console.log('? Connecting to Hostinger FTP (82.25.120.87)...');
    await client.access({
      host: '82.25.120.87',
      user: 'u198458799.miftahtools.com',
      password: process.env.HOSTINGER_FTP_PASSWORD || 'Jamil132@ ',
      port: 21,
      secure: false,
    });

    console.log('📂 Connected! Checking remote directory...');
    const pwd = await client.pwd();
    console.log('Remote PWD:', pwd);

    try {
      await client.cd('public_html');
      console.log('📁 In public_html folder');
    } catch {
      console.log('📁 In root folder');
    }

    console.log('📦 Uploading/Syncing build output to Hostinger...');
    await client.uploadFromDir(outDir);

    console.log('⁕ DEPLOYMENT SUCCESSFUL! https://miftahtools.com has been updated.');
  } catch (err) {
    console.error('❌ Deployment error:', err.message);
    process.exit(1);
  } finally {
    client.close();
  }
}

deploy();
