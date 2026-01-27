import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/app/store";

export type Theme = "light" | "dark" | "auto";

interface ConfigurationState {
    interfaceColor: string;
    theme: Theme;
    fontSize: number;
    dyslexic: boolean;
    language: string;
}

const initialState: ConfigurationState = {
    interfaceColor: "#003366",
    theme: "auto",
    fontSize: 16,
    dyslexic: false,
    language: "es",
};

export const configurationSlice = createSlice({
    name: "configuration",
    initialState,
    reducers: {
        setInterfaceColor: (state, action: PayloadAction<string>) => {
            state.interfaceColor = action.payload;
        },
        setTheme: (state, action: PayloadAction<Theme>) => {
            state.theme = action.payload;
        },
        setFontSize: (state, action: PayloadAction<number>) => {
            state.fontSize = action.payload;
        },
        setDyslexic: (state, action: PayloadAction<boolean>) => {
            state.dyslexic = action.payload;
        },
        setLanguage: (state, action: PayloadAction<string>) => {
            state.language = action.payload;
        },
        resetConfiguration: (state) => {
            return initialState;
        },
    },
});

export const {
    setInterfaceColor,
    setTheme,
    setFontSize,
    setDyslexic,
    setLanguage,
    resetConfiguration,
} = configurationSlice.actions;

export const selectConfiguration = (state: RootState) => state.configuration;

export default configurationSlice.reducer;
