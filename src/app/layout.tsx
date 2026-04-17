import type { Metadata } from "next";
import { cookies } from "next/headers";
import PreferenceEffects from "@/features/settings/PreferenceEffects";
import {
  preferencesCookieKey,
  resolveLanguageCode,
  resolveThemeMode,
} from "@/features/settings/preferences";
import { getServerPreferences } from "@/features/settings/server-preferences";
import "./global.css";

const themeScript = `
  (() => {
    try {
      const storageKey = "oz.theme";
      const storedTheme = window.localStorage.getItem(storageKey);
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      const theme =
        storedTheme === "dark" || storedTheme === "light" ? storedTheme : systemTheme;
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    } catch {
      document.documentElement.dataset.theme = "light";
      document.documentElement.style.colorScheme = "light";
    }
  })();
`;

export const metadata: Metadata = {
  title: "OrlogoZarlaga",
  description: "Personal & Household Finance Manager",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const preferences = getServerPreferences(
    cookieStore.get(preferencesCookieKey)?.value,
  );
  const language = resolveLanguageCode(preferences?.language ?? "MN");
  const theme = resolveThemeMode(preferences?.theme ?? "LIGHT");

  return (
    <html lang={language} data-theme={theme} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <PreferenceEffects />
        <main>{children}</main>
      </body>
    </html>
  );
}
