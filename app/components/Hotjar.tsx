"use client";

import Script from "next/script";
import { createClient } from "@/utils/supabase/client";

declare global {
  interface Window {
    hj: (command: string, ...args: unknown[]) => void;
  }
}

async function identifyUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user?.email && typeof window !== "undefined" && window.hj) {
    window.hj("identify", user.id, {
      email: user.email,
    });
  }
}

export function Hotjar() {
  return (
    <Script
      id="hotjar"
      strategy="afterInteractive"
      onLoad={() => identifyUser()}
    >
      {`
        (function(h,o,t,j,a,r){
          h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
          h._hjSettings={hjid:3706013,hjsv:6};
          a=o.getElementsByTagName('head')[0];
          r=o.createElement('script');r.async=1;
          r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
          a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
      `}
    </Script>
  );
}
