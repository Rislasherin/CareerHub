export const COMPANY_DOCUMENT_CATEGORIES = [
  'INCORPORATION_CERTIFICATE',
  'GST_CERTIFICATE',
  'MSME_CERTIFICATE',
  'ESTABLISHMENT_LICENSE',
  'OTHER'
] as const;

export type CompanyDocumentCategory = typeof COMPANY_DOCUMENT_CATEGORIES[number];

export const COLLEGE_DOCUMENT_CATEGORIES = [
  'ESTABLISHMENT_CERTIFICATE',
  'GOVERNMENT_RECOGNITION',
  'UGC_AICTE_AFFILIATION',
  'INSTITUTION_AUTHORIZATION',
  'OTHER'
] as const;

export type CollegeDocumentCategory = typeof COLLEGE_DOCUMENT_CATEGORIES[number];

export const ALLOWED_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp'
] as const;

export const MAX_DOCUMENT_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Validates actual file magic numbers / header bytes to prevent forged MIME types or malicious uploads.
 */
export function isValidMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (!buffer || buffer.length < 4) return false;

  // PDF: %PDF (0x25 0x50 0x44 0x46)
  if (mimeType === 'application/pdf') {
    return buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;
  }

  // JPEG: 0xFF 0xD8 0xFF
  if (mimeType === 'image/jpeg') {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  // PNG: 0x89 0x50 0x4E 0x47
  if (mimeType === 'image/png') {
    return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  }

  // WEBP: RIFF....WEBP
  if (mimeType === 'image/webp') {
    return buffer.length >= 12 &&
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP';
  }

  return false;
}

export function sanitizeFileName(originalName: string): string {
  // Strip path traversal characters, control characters, and dangerous characters
  const baseName = originalName.replace(/^.*[\\\/]/, '').trim();
  const safeName = baseName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return safeName.length > 0 ? safeName : 'verification_document';
}
