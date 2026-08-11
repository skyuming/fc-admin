/**
 * XSS 防护工具
 * 使用 DOMPurify 对 HTML 内容进行净化，防止 XSS 攻击
 */
import DOMPurify from 'dompurify';

/**
 * 净化 HTML 内容
 * @param html 需要净化的 HTML 字符串
 * @returns 净化后的安全 HTML
 */
export function sanitizeHTML(html: string): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br', 'p', 'span', 'div', 'img'],
    ALLOWED_ATTR: ['class', 'style', 'src', 'alt', 'title', 'width', 'height'],
  });
}

/**
 * 严格净化 - 仅保留文本，移除所有 HTML
 * @param html 需要处理的字符串
 * @returns 纯文本
 */
export function stripHTML(html: string): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

export default DOMPurify;
