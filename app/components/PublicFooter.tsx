import Link from "next/link";
import Image from "next/image";

interface PublicFooterProps {
  maxWidth?: string;
  customBottom?: React.ReactNode;
}

export function PublicFooter({
  maxWidth = "max-w-4xl",
  customBottom,
}: PublicFooterProps) {
  return (
    <footer className="py-12 px-4 bg-gray-50">
      <div className={`${maxWidth} mx-auto`}>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          <Link href="/new" className="flex items-center gap-3">
            <Image
              src="/avatars/pomegranate.svg"
              alt="Yalla Flash"
              width={32}
              height={32}
            />
            <span className="font-pphatton font-bold text-gray-900">
              Yalla Flash
            </span>
          </Link>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link
              href="/new"
              className="hover:text-gray-900 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/packs"
              className="hover:text-gray-900 transition-colors"
            >
              All Packs
            </Link>
            <Link
              href="/resources"
              className="hover:text-gray-900 transition-colors"
            >
              Resources
            </Link>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-400">
          {customBottom || <p>&copy; {new Date().getFullYear()} Yalla Flash</p>}
        </div>
      </div>
    </footer>
  );
}
