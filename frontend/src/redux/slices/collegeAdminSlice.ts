import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { VerificationDocumentItem } from './hrSlice';

export interface CollegeAdminDetails {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  collegeName?: string;
  name?: string;
  shortName?: string;
  yearEstablished?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  naacGrade?: string;
  placementCellName?: string;
  placementContactEmail?: string;
  placementContactPhone?: string;
  logoUrl?: string;
  verificationDocument?: string;
  verificationDocuments?: VerificationDocumentItem[];
  status: string;
  onboardingStep?: number;
  activeBranches?: string[];
  currentAcademicYear?: string;
  activePlacementBatch?: string;
  plan?: string;
  rejectionReason?: string;
  rejectedAt?: string | Date;
  resubmittedAt?: string | Date;
  approvedAt?: string | Date;
  statusHistory?: Array<{
    status: string;
    reason?: string;
    changedBy?: string;
    changedAt: string | Date;
  }>;
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
