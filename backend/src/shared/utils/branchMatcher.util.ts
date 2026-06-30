export class BranchMatcher {
  public static isBranchMatch(jobBranch: string, targetBranch: string): boolean {
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const j = normalize(jobBranch);
    const t = normalize(targetBranch);
    
    if (j === t || j.includes(t) || t.includes(j)) return true;
    
    // IT / Software / CS Synonyms
    const itKeywords = ['it', 'computer', 'software', 'informationtechnology', 'cse', 'cs', 'ce', 'network', 'data'];
    
    if (j.includes('anyit') || j.includes('anybranch')) {
      return true; // If job says "Any IT", we can just be very permissive or check IT keywords
    }

    if (itKeywords.some(k => j.includes(k))) {
      return itKeywords.some(k => t.includes(k));
    }
    
    // Electronics / Electrical Synonyms
    const eceKeywords = ['electronics', 'electrical', 'ece', 'eee', 'communication', 'telecom'];
    if (eceKeywords.some(k => j.includes(k))) {
      return eceKeywords.some(k => t.includes(k));
    }

    // Mechanical / Civil / Core
    const coreKeywords = ['mechanical', 'mech', 'civil', 'auto', 'manufacturing'];
    if (coreKeywords.some(k => j.includes(k))) {
      return coreKeywords.some(k => t.includes(k));
    }

    return false;
  }
}
