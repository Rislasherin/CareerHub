export class CanonicalSkill {
  constructor(
    public readonly id: string,
    public readonly canonicalName: string,
    public readonly normalizedName: string,
    public readonly isVerified: boolean,
    public readonly aliases: string[] = [],
    public readonly category?: string
  ) {}

  public static create(data: Partial<CanonicalSkill>): CanonicalSkill {
    return new CanonicalSkill(
      data.id || '',
      data.canonicalName || '',
      data.normalizedName || '',
      data.isVerified || false,
      data.aliases || [],
      data.category
    );
  }
}
