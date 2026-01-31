import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useGetUserProfileQuery } from "../api/authApiSlice";

import { RootState } from "@/app/store";

export const AuthSessionManager = () => {
    // Automatically fetches user profile on mount.
    // If the cookie is valid, this succeeds and updates Redux via the matcher.
    // If invalid (401), the global error handler or interceptor might catch it, 
    // but here we just let the slice handle the failure (clearing auth).

    const {
        data,
        error,
        isLoading
    } = useGetUserProfileQuery(undefined, {
        // Optional: Polling to keep session alive or detect logout from other tabs
        pollingInterval: 15 * 60 * 1000, // Check every 15 minutes
        refetchOnFocus: true,
        refetchOnReconnect: true,
    });

    const accessToken = useSelector((state: RootState) => state.auth.accessToken);



    return null; // Headless component
};
