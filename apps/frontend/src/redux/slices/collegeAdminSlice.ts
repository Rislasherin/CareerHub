import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CollegeAdminDetails {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  collegeName?: string;
  status: string;
  onboardingStep?: number;
}

interface CollegeAdminState {
  details: CollegeAdminDetails | null;
}

const initialState: CollegeAdminState = {
  details: null,
};

const collegeAdminSlice = createSlice({
  name: 'collegeAdmin',
  initialState,
  reducers: {
    setCollegeAdminDetails: (state, action: PayloadAction<CollegeAdminDetails>) => {
      state.details = action.payload;
    },
    clearCollegeAdminDetails: (state) => {
      state.details = null;
    },
  },
});

export const { setCollegeAdminDetails, clearCollegeAdminDetails } = collegeAdminSlice.actions;
export default collegeAdminSlice.reducer;
