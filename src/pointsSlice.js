// pointsSlice.js
import { createSlice } from '@reduxjs/toolkit';

const pointsSlice = createSlice({
  name: 'points',
  initialState: {
    userPoints: 0,
    loading: true,
  },
  reducers: {
    setUserPoints: (state, action) => {
      state.userPoints = action.payload;
      state.loading = false;
    },
    // Modify setUserPoints to handle both adding and deducting points
    modifyUserPoints: (state, action) => {
      const { amount, operation } = action.payload;

      if (operation === 'add') {
        state.userPoints += amount;
      } else if (operation === 'deduct') {
        state.userPoints -= amount;
      }

      state.loading = false;
    },
    resetUserPoints: (state) => {
      state.userPoints = null;
      state.loading = false;
    },
  },
});

export const { setUserPoints, modifyUserPoints, resetUserPoints } = pointsSlice.actions;
export default pointsSlice.reducer;
