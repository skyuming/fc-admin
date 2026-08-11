// 基于jsencrypt的RSA加解密工具
import JSEncrypt from 'jsencrypt';

/* 公钥 */
const publicKey = import.meta.env.VITE_PUBLIC_KEY

// 加密函数
export function encrypt(data) {
    const encryptor = new JSEncrypt();
    encryptor.setPublicKey(publicKey);
    return encryptor.encrypt(data);
}