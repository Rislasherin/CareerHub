/**
 * AI Credit Consumption Policy
 * 
 * TODO (PRODUCT DECISION):
 * The exact cost of an AI Interview is currently unresolved.
 * We are using a placeholder value for reservation until a concrete 
 * product rule (e.g. 1 interview = 10 credits, or 1 minute = X credits) is defined.
 */
export const AICreditPolicy = {
    features: {
        ai_interview: {
            reservationAmount: 10, // Unresolved Product Decision: How many credits to reserve?
            calculateFinalCredits: (durationMinutes: number, tokens?: number): number => {
                // Unresolved Product Decision: How to calculate final consumed credits?
                // Returning a flat 10 credits until decided.
                return 10;
            }
        },
        mock_interview: {
            reservationAmount: 5,
            calculateFinalCredits: (durationMinutes: number, tokens?: number): number => 5
        },
        resume_builder: {
            reservationAmount: 2,
            calculateFinalCredits: () => 2
        }
    }
};
