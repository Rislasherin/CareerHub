import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface HRDetails {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyId?: string;
  companyName?: string;
  industry?: string;
  status: string;
  onboardingStep?: number;
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
