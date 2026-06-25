import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SuperAdminDetails {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
}

interface SuperAdminState {
  details: SuperAdminDetails | null;
}

const initialState: SuperAdminState = {
  details: null,
};

const superAdminSlice = createSlice({
  name: 'superAdmin',
  initialState,
  reducers: {
    setSuperAdminDetails: (state, action: PayloadAction<SuperAdminDetails>) => {
      state.details = action.payload;
    },
    clearSuperAdminDetails: (state) => {
      state.details = null;
    },
  },
});

export const { setSuperAdminDetails, clearSuperAdminDetails } = superAdminSlice.actions;
export default superAdminSlice.reducer;
