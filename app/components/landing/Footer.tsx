"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          {/* Logo and tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Link href="/" className="flex items-center gap-2 mb-3">
              <svg
                width="32"
                height="32"
                viewBox="0 0 260 260"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-brand-bg"
              >
                <path
                  d="M221.792 73.3274C215.418 108.418 203.652 99.3945 196.298 136.991C190.655 165.843 198.259 201.658 186.493 219.203C174.726 236.748 222.367 175.355 229.636 144.009C235.783 117.5 231.107 104.407 221.792 73.3274Z"
                  fill="currentColor"
                />
                <path
                  d="M63.1188 136.991C55.7648 99.3945 43.9985 108.418 37.6251 73.3274C28.3101 104.407 23.6334 117.5 29.7809 144.009C37.0498 175.355 84.6903 236.748 72.924 219.203C61.1577 201.658 68.7621 165.843 63.1188 136.991Z"
                  fill="currentColor"
                />
                <path
                  d="M126.711 220V114.19C126.711 113.086 127.606 112.19 128.711 112.19C129.815 112.19 130.853 113.085 130.853 114.19L130.711 220C130.711 221.104 129.815 222 128.711 222C127.606 222 126.711 221.104 126.711 220Z"
                  fill="currentColor"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M148.782 52.2994C151.201 49.6222 154.514 46.2756 157.915 43.5144C160.124 41.7211 162.456 40.1044 164.664 39.0985C166.783 38.1331 169.274 37.5098 171.466 38.5058L172.609 39.0254L172.637 40.28C173.136 63.7272 172.4 78.0833 169.827 87.99C167.2 98.1034 162.664 103.551 155.957 109.225C149.862 114.381 140.071 115.54 130.853 109.393V114.19C130.853 115.293 129.959 116.186 128.857 116.186C128.832 116.186 128.808 116.183 128.783 116.182C128.759 116.183 128.735 116.186 128.71 116.186C127.608 116.186 126.714 115.292 126.714 114.19V109.393C117.496 115.539 107.705 114.381 101.61 109.225C94.9031 103.551 90.3669 98.1032 87.7398 87.99C85.1663 78.0833 84.4311 63.7271 84.93 40.28L84.9573 39.0254L86.1009 38.5058C88.2932 37.5096 90.7841 38.1331 92.903 39.0985C95.1104 40.1043 97.4423 41.7212 99.6515 43.5144C103.053 46.2755 106.366 49.6222 108.785 52.2994C112.17 46.7574 121.223 38.3268 128.711 38.3268C136.198 38.3268 145.766 47.3617 148.782 52.2994Z"
                  fill="currentColor"
                />
              </svg>
              <span className="font-pphatton font-bold text-xl text-gray-900">
                Yalla
              </span>
            </Link>
            <p className="text-gray-500 text-sm max-w-xs">
              The fun way to learn Lebanese Arabic with smart flashcards.
            </p>
          </motion.div>

          {/* Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex gap-8 text-sm"
          >
            <a
              href="#features"
              className="text-gray-600 hover:text-brand-bg transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-gray-600 hover:text-brand-bg transition-colors"
            >
              How it works
            </a>
            <a
              href="#packs"
              className="text-gray-600 hover:text-brand-bg transition-colors"
            >
              Word packs
            </a>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-12 pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500"
        >
          <p>&copy; {new Date().getFullYear()} Yalla. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with{" "}
            <span className="text-red-500" aria-label="love">
              &hearts;
            </span>{" "}
            for Lebanese Arabic learners
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
