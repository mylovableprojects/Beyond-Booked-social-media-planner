import type { MetadataRoute } from "next";

/**
 * Enables “Add to Home Screen” / install on mobile with a proper app shell.
 * start_url: field capture so the home-screen icon opens there (not the main dashboard).
 * Unauthenticated users are sent to /login?next=/dashboard/field-upload by middleware.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Beyond Booked",
    short_name: "Beyond Booked",
    description:
      "Social content for party rental businesses — generator, field capture, and archive.",
    start_url: "/dashboard/field-upload",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#fbf7f4",
    theme_color: "#10172c",
    icons: [
      {
        src: "/icon.svg",
        type: "image/svg+xml",
        sizes: "any",
        purpose: "any",
      },
    ],
  };
}
