import { google } from 'googleapis';
import Dropbox from 'dropbox';
import AWS from 'aws-sdk';

class CloudStorageManager {
  constructor() {
    this.providers = {
      google: null,
      dropbox: null,
      aws: null
    };
  }

  // Google Drive Integration
  setupGoogleDrive(accessToken) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    
    this.providers.google = google.drive({ version: 'v3', auth });
    return this.providers.google;
  }

  async listGoogleDriveFiles(query = '') {
    if (!this.providers.google) throw new Error('Google Drive not connected');
    
    const response = await this.providers.google.files.list({
      q: query || 'name != \'.\'',
      fields: 'files(id, name, mimeType, size, modifiedTime, webViewLink)',
      pageSize: 100
    });
    
    return response.data.files.map(file => ({
      id: file.id,
      name: file.name,
      type: file.mimeType === 'application/vnd.google-apps.folder' ? 'folder' : 'file',
      mimeType: file.mimeType,
      size: file.size,
      modifiedTime: file.modifiedTime,
      url: file.webViewLink,
      provider: 'google'
    }));
  }

  async uploadToGoogleDrive(fileData, filename, folderId = null) {
    if (!this.providers.google) throw new Error('Google Drive not connected');
    
    const media = {
      mimeType: fileData.type,
      body: require('fs').createReadStream(fileData.path)
    };
    
    const response = await this.providers.google.files.create({
      requestBody: {
        name: filename,
        parents: folderId ? [folderId] : []
      },
      media: media,
      fields: 'id, name, mimeType, size, webViewLink'
    });
    
    return {
      id: response.data.id,
      name: response.data.name,
      type: 'file',
      mimeType: response.data.mimeType,
      size: response.data.size,
      url: response.data.webViewLink,
      provider: 'google'
    };
  }

  // Dropbox Integration
  setupDropbox(accessToken) {
    this.providers.dropbox = new Dropbox({ accessToken });
    return this.providers.dropbox;
  }

  async listDropboxFiles(path = '') {
    if (!this.providers.dropbox) throw new Error('Dropbox not connected');
    
    try {
      const response = await this.providers.dropbox.filesListFolder({ path });
      
      return response.result.entries.map(file => ({
        id: file.id,
        name: file.name,
        type: file['.tag'],
        size: file.size,
        modifiedTime: file.server_modified,
        provider: 'dropbox'
      }));
    } catch (error) {
      if (error.status === 409) {
        // Path is a file, not a folder
        return [];
      }
      throw error;
    }
  }

  async uploadToDropbox(fileData, filename, path = '') {
    if (!this.providers.dropbox) throw new Error('Dropbox not connected');
    
    const response = await this.providers.dropbox.filesUpload({
      path: `${path}/${filename}`,
      contents: require('fs').readFileSync(fileData.path)
    });
    
    // Create shared link
    const sharedLinkResponse = await this.providers.dropbox.sharingCreateSharedLinkWithSettings({
      path: response.result.path_lower
    });
    
    return {
      id: response.result.id,
      name: response.result.name,
      type: 'file',
      size: response.result.size,
      modifiedTime: response.result.server_modified,
      url: sharedLinkResponse.result.url,
      provider: 'dropbox'
    };
  }

  // AWS S3 Integration
  setupS3(accessKeyId, secretAccessKey, region, bucket) {
    AWS.config.update({
      accessKeyId,
      secretAccessKey,
      region
    });
    
    this.providers.aws = new AWS.S3();
    this.s3Bucket = bucket;
    return this.providers.aws;
  }

  async listS3Files(prefix = '') {
    if (!this.providers.aws) throw new Error('AWS S3 not connected');
    
    const response = await this.providers.aws.listObjectsV2({
      Bucket: this.s3Bucket,
      Prefix: prefix,
      MaxKeys: 100
    }).promise();
    
    return response.Contents.map(file => ({
      id: file.Key,
      name: file.Key.split('/').pop(),
      type: file.Key.endsWith('/') ? 'folder' : 'file',
      size: file.Size,
      modifiedTime: file.LastModified,
      url: `https://${this.s3Bucket}.s3.${AWS.config.region}.amazonaws.com/${file.Key}`,
      provider: 'aws'
    }));
  }

  async uploadToS3(fileData, filename, prefix = '') {
    if (!this.providers.aws) throw new Error('AWS S3 not connected');
    
    const fileContent = require('fs').readFileSync(fileData.path);
    
    const response = await this.providers.aws.upload({
      Bucket: this.s3Bucket,
      Key: `${prefix}${filename}`,
      Body: fileContent,
      ContentType: fileData.type
    }).promise();
    
    return {
      id: response.Key,
      name: filename,
      type: 'file',
      size: fileContent.length,
      url: response.Location,
      provider: 'aws'
    };
  }

  // Universal methods
  async listAllFiles() {
    const allFiles = [];
    
    for (const [provider, service] of Object.entries(this.providers)) {
      if (service) {
        try {
          const files = await this[`list${provider.charAt(0).toUpperCase() + provider.slice(1)}Files`]();
          allFiles.push(...files);
        } catch (error) {
          console.error(`Error listing ${provider} files:`, error);
        }
      }
    }
    
    return allFiles;
  }

  async searchFiles(query) {
    const allFiles = await this.listAllFiles();
    
    return allFiles.filter(file => 
      file.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  async getFilePreview(fileId, provider) {
    switch (provider) {
      case 'google':
        if (!this.providers.google) throw new Error('Google Drive not connected');
        const response = await this.providers.google.files.get({
          fileId: fileId,
          alt: 'media'
        });
        return response.data;
        
      case 'dropbox':
        if (!this.providers.dropbox) throw new Error('Dropbox not connected');
        const dropboxResponse = await this.providers.dropbox.filesDownload({ path: fileId });
        return dropboxResponse.result.fileBinary;
        
      case 'aws':
        if (!this.providers.aws) throw new Error('AWS S3 not connected');
        const s3Response = await this.providers.aws.getObject({
          Bucket: this.s3Bucket,
          Key: fileId
        }).promise();
        return s3Response.Body;
        
      default:
        throw new Error('Unsupported provider');
    }
  }

  async deleteFile(fileId, provider) {
    switch (provider) {
      case 'google':
        if (!this.providers.google) throw new Error('Google Drive not connected');
        await this.providers.google.files.delete({ fileId });
        break;
        
      case 'dropbox':
        if (!this.providers.dropbox) throw new Error('Dropbox not connected');
        await this.providers.dropbox.filesDeleteV2({ path: fileId });
        break;
        
      case 'aws':
        if (!this.providers.aws) throw new Error('AWS S3 not connected');
        await this.providers.aws.deleteObject({
          Bucket: this.s3Bucket,
          Key: fileId
        }).promise();
        break;
        
      default:
        throw new Error('Unsupported provider');
    }
  }

  async createFolder(name, provider, parentId = null) {
    switch (provider) {
      case 'google':
        if (!this.providers.google) throw new Error('Google Drive not connected');
        const response = await this.providers.google.files.create({
          requestBody: {
            name: name,
            mimeType: 'application/vnd.google-apps.folder',
            parents: parentId ? [parentId] : []
          },
          fields: 'id, name'
        });
        return {
          id: response.data.id,
          name: response.data.name,
          type: 'folder',
          provider: 'google'
        };
        
      case 'dropbox':
        if (!this.providers.dropbox) throw new Error('Dropbox not connected');
        const dropboxResponse = await this.providers.dropbox.filesCreateFolderV2({
          path: `/${name}`
        });
        return {
          id: dropboxResponse.result.id,
          name: dropboxResponse.result.name,
          type: 'folder',
          provider: 'dropbox'
        };
        
      case 'aws':
        if (!this.providers.aws) throw new Error('AWS S3 not connected');
        const folderKey = `${name}/`;
        await this.providers.aws.putObject({
          Bucket: this.s3Bucket,
          Key: folderKey,
          Body: ''
        }).promise();
        return {
          id: folderKey,
          name: name,
          type: 'folder',
          provider: 'aws'
        };
        
      default:
        throw new Error('Unsupported provider');
    }
  }
}

export default CloudStorageManager;
