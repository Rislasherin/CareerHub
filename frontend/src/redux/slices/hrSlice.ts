import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface HRDetails {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyId?: string;
  companyName?: string;
  name?: string;
  industry?: string;
  sector?: string;
  size?: string;
  website?: string;
  headquarters?: string;
  location?: string;
  description?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactJobTitle?: string;
  logoUrl?: string;
  preferredColleges?: string[];
  verificationDocument?: string;
  status: string;
  companyStatus?: string;
  onboardingStep?: number;
  rejectionReason?: string;
  rejectedAt?: string;
  resubmittedAt?: string;
  approvedAt?: string;
  statusHistory?: Array<{
    status: string;
    changedAt: string;
    changedBy?: string;
    reason?: string;
  }>;
}

interface HRState {
  details: HRDetails | null;
}

const initialState: HRState = {
  details: null,
};

const hrSlice = createSlice({
  name: 'hr',
  initialState,
  reducers: {
    setHRDetails: (state, action: PayloadAction<HRDetails>) => {
      state.details = action.payload;
    },
    clearHRDetails: (state) => {
      state.details = null;
    },
  },
});

export const { setHRDetails, clearHRDetails } = hrSlice.actions;
export default hrSlice.reducer;
