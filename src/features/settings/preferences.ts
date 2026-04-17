export type ThemePreference = "LIGHT" | "DARK";
export type LanguagePreference = "MN" | "EN";
export type CurrencyPreference = "JPY" | "MNT" | "USD";
export type MonthStartPreference = "1" | "25";
export type DensityPreference = "BALANCED" | "COMPACT";
export type LandingPagePreference =
  | "/pocketDashboard"
  | "/lobby"
  | "/settings";

export type UserPreferences = {
  language: LanguagePreference;
  currency: CurrencyPreference;
  monthStart: MonthStartPreference;
  dashboardDensity: DensityPreference;
  theme: ThemePreference;
  hideBalances: boolean;
  landingPage: LandingPagePreference;
};

export const preferencesStorageKey = "oz.settings.preferences";
export const displayNameStorageKey = "oz.user.displayName";
export const themeStorageKey = "oz.theme";
export const preferencesCookieKey = "oz_settings";
export const settingsUpdatedEvent = "oz:settings-updated";

export const defaultPreferences: UserPreferences = {
  language: "MN",
  currency: "JPY",
  monthStart: "1",
  dashboardDensity: "BALANCED",
  theme: "LIGHT",
  hideBalances: false,
  landingPage: "/pocketDashboard",
};

const currencyValues = new Set<CurrencyPreference>(["JPY", "MNT", "USD"]);
const languageValues = new Set<LanguagePreference>(["MN", "EN"]);
const monthStartValues = new Set<MonthStartPreference>(["1", "25"]);
const densityValues = new Set<DensityPreference>(["BALANCED", "COMPACT"]);
const themeValues = new Set<ThemePreference>(["LIGHT", "DARK"]);
const landingPageValues = new Set<LandingPagePreference>([
  "/pocketDashboard",
  "/lobby",
  "/settings",
]);

export function normalizePreferences(
  input?: Partial<UserPreferences> | null,
): UserPreferences {
  return {
    language: languageValues.has(input?.language ?? "MN")
      ? (input?.language as LanguagePreference)
      : defaultPreferences.language,
    currency: currencyValues.has(input?.currency ?? "JPY")
      ? (input?.currency as CurrencyPreference)
      : defaultPreferences.currency,
    monthStart: monthStartValues.has(input?.monthStart ?? "1")
      ? (input?.monthStart as MonthStartPreference)
      : defaultPreferences.monthStart,
    dashboardDensity: densityValues.has(
      input?.dashboardDensity ?? "BALANCED",
    )
      ? (input?.dashboardDensity as DensityPreference)
      : defaultPreferences.dashboardDensity,
    theme: themeValues.has(input?.theme ?? "LIGHT")
      ? (input?.theme as ThemePreference)
      : defaultPreferences.theme,
    hideBalances:
      typeof input?.hideBalances === "boolean"
        ? input.hideBalances
        : defaultPreferences.hideBalances,
    landingPage: landingPageValues.has(
      input?.landingPage ?? "/pocketDashboard",
    )
      ? (input?.landingPage as LandingPagePreference)
      : defaultPreferences.landingPage,
  };
}

export function parsePreferencesCookie(
  rawValue?: string | null,
): UserPreferences | null {
  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(rawValue)) as Partial<UserPreferences>;
    return normalizePreferences(parsed);
  } catch {
    return null;
  }
}

export function serializePreferencesCookie(
  preferences: UserPreferences,
): string {
  return encodeURIComponent(JSON.stringify(preferences));
}

export function resolveThemeMode(theme: ThemePreference): "light" | "dark" {
  return theme === "DARK" ? "dark" : "light";
}

export function applyThemePreference(theme: ThemePreference) {
  if (typeof document === "undefined" || typeof window === "undefined") return;

  const nextTheme = resolveThemeMode(theme);
  document.documentElement.dataset.theme = nextTheme;
  document.documentElement.style.colorScheme = nextTheme;
  window.dispatchEvent(
    new CustomEvent("oz:theme-updated", {
      detail: { theme: nextTheme },
    }),
  );
}

export function resolveLanguageCode(
  language: LanguagePreference,
): "mn" | "en" {
  return language === "EN" ? "en" : "mn";
}

export function readStoredPreferences(): UserPreferences {
  if (typeof window === "undefined") {
    return defaultPreferences;
  }

  let storedPreferences: Partial<UserPreferences> | null = null;

  try {
    const rawStored = window.localStorage.getItem(preferencesStorageKey);
    if (rawStored) {
      storedPreferences = JSON.parse(rawStored) as Partial<UserPreferences>;
    }
  } catch {
    storedPreferences = null;
  }

  const storedTheme = window.localStorage.getItem(themeStorageKey);
  const theme =
    storedTheme === "dark" || storedTheme === "light"
      ? storedTheme === "dark"
        ? "DARK"
        : "LIGHT"
      : document.documentElement.dataset.theme === "dark"
        ? "DARK"
        : defaultPreferences.theme;

  return normalizePreferences({
    ...storedPreferences,
    theme,
  });
}

export function persistPreferences(preferences: UserPreferences) {
  if (typeof window === "undefined") return;

  const normalized = normalizePreferences(preferences);
  window.localStorage.setItem(
    preferencesStorageKey,
    JSON.stringify(normalized),
  );
  window.localStorage.setItem(themeStorageKey, resolveThemeMode(normalized.theme));
  document.cookie = `${preferencesCookieKey}=${serializePreferencesCookie(
    normalized,
  )}; path=/; max-age=31536000; samesite=lax`;
  applyThemePreference(normalized.theme);
  window.dispatchEvent(
    new CustomEvent(settingsUpdatedEvent, {
      detail: { preferences: normalized },
    }),
  );
}
