import { createSlice } from '@reduxjs/toolkit';

interface ThemeState {
  mode: 'dark' | 'light';
}

const initialState: ThemeState = {
  mode: 'dark', // Dark mode par défaut
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'dark' ? 'light' : 'dark';
    },
    setTheme: (state, action) => {
      state.mode = action.payload;
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
