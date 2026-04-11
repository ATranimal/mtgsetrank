import pako from 'pako';

export const compressData = (data) => {
  try {
    const jsonString = JSON.stringify(data);
    const compressed = pako.deflate(jsonString);
    const base64 = btoa(String.fromCharCode(...compressed))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return base64;
  } catch (error) {
    console.error('Compression failed:', error);
    return null;
  }
};

export const decompressData = (compressed) => {
  try {
    const base64 = compressed
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const decompressed = pako.inflate(bytes, { to: 'string' });
    return JSON.parse(decompressed);
  } catch (error) {
    console.error('Decompression failed:', error);
    return null;
  }
};
