import type { MetadataRoute } from "next";

/**
 * Enables “Add to Home Screen” / install on mobile with a proper app shell.
 * start_url: dashboard (middleware sends unauthenticated users to login).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Beyond Booked",
    short_name: "Beyond Booked",
    description:
      "Social content for party rental businesses — generator, field capture, and archive.",
    start_url: "/dashboard",
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
