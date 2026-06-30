export class NormalizationUtil {
  
  public static normalize(input: string): string {
    if (!input) return '';

    return input
      .normalize('NFKC') // Unicode normalization
      .toLowerCase() // Case insensitive
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^\w\s+#]/ig, ' ') // Replace punctuation with space, keep +, # for C++, C#
      .replace(/\s+/g, ' ') // Collapse whitespace
      .trim();
  }
}
