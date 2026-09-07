export interface IAICreditService {
  consumeCredits(collegeId: string, userId: string, feature: string, requiredCredits: number, provider: string, model?: string, tokens?: number): Promise<void>;
  checkQuota(collegeId: string, requiredCredits: number): Promise<boolean>;
  reserveCredits(collegeId: string, userId: string, feature: string, requiredCredits: number, provider: string): Promise<string>;
  commitCredits(reservationId: string, finalCredits: number, telemetry?: any): Promise<void>;
  releaseCredits(reservationId: string): Promise<void>;
}
