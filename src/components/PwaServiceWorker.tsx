"use client";

import { useEffect } from "react";
import { PWA_SERVICE_WORKER_PATH } from "@/lib/pwa/web-app-manifest";

export function PwaServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    void navigator.serviceWorker.register(PWA_SERVICE_WORKER_PATH, {
      scope: "/",
    });
  }, []);

  return null;
}
