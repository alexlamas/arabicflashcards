"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";

export function PublicCTA() {
  return (
    <div className="py-24 px-4 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gray-900 border border-gray-800 shadow-sm p-12 text-center">
          <DottedGlowBackground
            gap={20}
            radius={1.5}
            color="rgba(255,255,255,0.15)"
            glowColor="#47907D"
            opacity={0.8}
            speedScale={0.4}
          />
          <div className="relative z-10">
            <h2 className="font-pphatton text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to start?
            </h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Join learners building real Lebanese Arabic fluency, one word at a time.
            </p>
            <Link href="/new">
              <Button
                size="lg"
                className="bg-white hover:bg-gray-100 text-gray-900 rounded-full px-10 py-6 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Get started free
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
