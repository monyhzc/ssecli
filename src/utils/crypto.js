const crypto = require('crypto');

const SECRET_KEY = '16bit secret key';

function pkcs7Pad(buffer, blockSize) {
  const padding = blockSize - (buffer.length % blockSize);
  const pad = Buffer.alloc(padding, padding);
  return Buffer.concat([buffer, pad]);
}

function trimByMaxKeySize(key) {
  if (key.length > 32) {
    return key.slice(0, 32);
  }
  return key;
}

function zerosPadding(buffer, blockSize) {
  const rem = buffer.length % blockSize;
  if (rem === 0) {
    return buffer;
  }
  const pad = Buffer.alloc(blockSize - rem, 0);
  return Buffer.concat([buffer, pad]);
}

function genIVFromKey(key) {
  const hashedKey = crypto.createHash('sha256').update(key).digest('hex');
  return trimByBlockSize(hashedKey);
}

function trimByBlockSize(key) {
  const blockSize = 16;
  if (key.length > blockSize) {
    return key.slice(0, blockSize);
  }
  return key;
}

function aesSimpleEncrypt(data, key) {
  key = trimByMaxKeySize(key);
  const keyBytes = zerosPadding(Buffer.from(key), 16);
  const iv = genIVFromKey(key);
  return aesCBCEncrypt(data, keyBytes.toString(), iv, 'PKCS7');
}

function aesCBCEncrypt(data, key, iv, paddingMode) {
  const blockSize = 16;
  let buffer = Buffer.from(data);
  
  if (paddingMode === 'PKCS7') {
    buffer = pkcs7Pad(buffer, blockSize);
  }
  
  const cipher = crypto.createCipheriv('aes-128-cbc', Buffer.from(key), Buffer.from(iv));
  cipher.setAutoPadding(false);
  let encrypted = cipher.update(buffer);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted.toString('base64');
}

function encryptPassword(password) {
  return aesSimpleEncrypt(password, SECRET_KEY);
}

module.exports = {
  encryptPassword,
};
