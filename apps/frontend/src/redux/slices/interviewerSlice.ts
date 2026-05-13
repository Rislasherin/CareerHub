import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface InterviewerDetails {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyId?: string;
  status: string;
}

interface InterviewerState {
  details: InterviewerDetails | null;
}

const initialState: InterviewerState = {
  details: null,
};

const interviewerSlice = createSlice({
  name: 'interviewer',
  initialState,
  reducers: {
    setInterviewerDetails: (state, action: PayloadAction<InterviewerDetails>) => {
      state.details = action.payload;
    },
    clearInterviewerDetails: (state) => {
      state.details = null;
    },
  },
});

export const { setInterviewerDetails, clearInterviewerDetails } = interviewerSlice.actions;
export default interviewerSlice.reducer;
