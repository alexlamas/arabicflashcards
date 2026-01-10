import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4">
        <div className="h-12 flex items-center bg-white border border-gray-200 rounded-full shadow-sm px-4 pr-1.5 gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/avatars/pomegranate.svg"
              alt="Yalla Flash"
              width={28}
              height={28}
            />
            <span className="font-pphatton font-bold text-lg text-gray-900">
              Yalla<span className="hidden sm:inline"> Flash</span>
            </span>
          </Link>

          <div className="flex-1" />

          <Link href="/">
            <Button variant="ghost" className="rounded-full">
              Log in
            </Button>
          </Link>
          <Link href="/">
            <Button className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-5 text-sm font-medium">
              Start free
            </Button>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-8xl mb-6">🫣</div>
          <h1 className="font-pphatton text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Page not found
          </h1>
          <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
            Looks like this page got lost in translation. Let&apos;s get you back on track.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button
                size="lg"
                className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-8"
              >
                Go home
              </Button>
            </Link>
            <Link href="/packs">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8"
              >
                Browse packs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
