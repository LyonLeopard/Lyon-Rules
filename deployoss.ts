import 'dotenv/config';
import OSS from 'ali-oss';
import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

const client = new OSS({
  region: process.env.OSS_REGION,
  accessKeyId: process.env.OSS_ACCESS_KEY_ID!,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET!,
  authorizationV4: true,
  bucket: process.env.OSS_BUCKET!,
});

async function uploadFile(localPath: string, ossPath: string, filename: string) {
  const headers = {
    // 指定Object的存储类型。
    'x-oss-storage-class': 'Standard',
    // 指定Object的访问权限。
    'x-oss-object-acl': 'public-read',
    // 通过文件URL访问文件时，指定以附件形式下载文件，下载后的文件名称为实际文件名。
    'Content-Disposition': `attachment; filename="${filename}"`,
    // 指定PutObject操作时是否覆盖同名目标Object。此处设置为true，表示禁止覆盖同名Object。
    'x-oss-forbid-overwrite': 'false',
  };

  try {
    // 获取 OSS 最终文件的绝对路径
    const ossUrl = `https://${process.env.OSS_BUCKET}.${process.env.OSS_REGION}.aliyuncs.com/${ossPath}`;

    // 读取本地文件内容
    const content = await readFile(localPath, 'utf-8');
    const lines = content.split('\n');

    // 将第一行替换为 #!MANAGED-CONFIG ${OSS_URL} interval=86400
    lines[0] = `#!MANAGED-CONFIG ${ossUrl} interval=86400`;
    const modifiedContent = lines.join('\n');

    // 创建临时文件
    const tempPath = join(tmpdir(), `temp-${filename}`);
    await writeFile(tempPath, modifiedContent, 'utf-8');

    // 上传修改后的文件
    const result = await client.put(ossPath, tempPath, { headers });
    console.log(`✓ Uploaded: ${ossPath}`);
    console.log(`  URL: ${ossUrl}`);
    return result;
  } catch (e) {
    console.error(`✗ Failed to upload ${ossPath}:`, e);
    throw e;
  }
}

async function deployProfiles() {
  const profilesDir = join(__dirname, 'profiles');

  try {
    const files = await readdir(profilesDir);

    if (files.length === 0) {
      console.log('No files found in profiles/ directory');
      return;
    }

    console.log(`Found ${files.length} file(s) to upload...\n`);

    const uploadPromises = files.map(file => {
      const localPath = join(profilesDir, file);
      const ossPath = `profiles/${file}`;
      return uploadFile(localPath, ossPath, file);
    });

    await Promise.all(uploadPromises);

    console.log(`\n✓ Successfully uploaded ${files.length} file(s) to OSS`);
  } catch (e) {
    console.error('Deployment failed:', e);
    process.exit(1);
  }
}

deployProfiles();
