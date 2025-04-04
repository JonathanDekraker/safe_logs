import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Platform, AppState } from "react-native";
import ErrorBoundary from "./error-boundary";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { auth } from "../utils/firebase";
import { useRestaurantStore } from "@/store/restaurant-store";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });
  const [user, setUser] = useState<User | null>(null);
  const segments = useSegments();
  const router = useRouter();
  const { selectedRestaurant, loadSelectedRestaurant } = useRestaurantStore();

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadSelectedRestaurant();
    }
  }, [user, loadSelectedRestaurant]);

  useEffect(() => {
    if (!loaded) return;

    const isLoginPage = segments[0] === "login";
    const isRestaurantSelectPage = segments[0] === "restaurant-select";

    if (!user && !isLoginPage) {
      // Redirect to the login page if not authenticated
      router.replace("/login");
    } else if (user && isLoginPage) {
      // Redirect to the restaurant select page if authenticated but no restaurant selected
      router.replace("/restaurant-select");
    } else if (user && !isLoginPage && !isRestaurantSelectPage && !selectedRestaurant) {
      // Redirect to restaurant select if no restaurant is selected
      router.replace("/restaurant-select");
    }
  }, [user, loaded, segments, selectedRestaurant]);

  // Add app state change listener to sign out when app is closed
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // Sign out the user when app goes to background
        signOut(auth).catch(error => {
          console.error('Error signing out:', error);
        });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <RootLayoutNav />
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      <Stack.Screen 
        name="login" 
        options={{ 
          headerShown: false,
          gestureEnabled: false 
        }} 
      />
      <Stack.Screen 
        name="restaurant-select" 
        options={{ 
          headerShown: false,
          gestureEnabled: false 
        }} 
      />
    </Stack>
  );
}