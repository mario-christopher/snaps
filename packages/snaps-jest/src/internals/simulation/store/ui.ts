import type { DialogType, Component } from '@metamask/snaps-sdk';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createAction, createSelector, createSlice } from '@reduxjs/toolkit';

import type { ApplicationState } from './store';

export type Interface = {
  type: DialogType;
  content: Component;
};

export type UiState = {
  current?: Interface | null;
};

const INITIAL_STATE: UiState = {
  current: null,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState: INITIAL_STATE,
  reducers: {
    setInterface(state, action: PayloadAction<Interface>) {
      state.current = action.payload;
    },
    closeInterface(state) {
      state.current = null;
    },
  },
});

export const resolveInterface = createAction<unknown>(
  `${uiSlice.name}/resolveInterface`,
);

export const { setInterface, closeInterface } = uiSlice.actions;

export const getCurrentInterface = createSelector(
  (state: ApplicationState) => state.ui,
  (ui) => ui.current,
);
