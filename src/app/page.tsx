import { fallbackModeToFallbackField } from "next/dist/lib/fallback";
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/pocketDashboard");
}
