import { permanentRedirect } from "next/navigation";

/** Actividad merged into /progress — keep URL for bookmarks and old links. */
export default function AnalyticsPage() {
  permanentRedirect("/progress");
}
