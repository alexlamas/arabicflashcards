"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../contexts/AuthContext";
import {
  StarterPackService,
  StarterPack,
} from "../../services/starterPackService";
import { PackPreviewModal } from "../PackPreviewModal";
import { ArrowRight, Eye } from "lucide-react";

export function PacksShowcase() {
  const [packs, setPacks] = useState<StarterPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPack, setSelectedPack] = useState<StarterPack | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const { setShowAuthDialog } = useAuth();

  useEffect(() => {
    async function loadPacks() {
      try {
        const availablePacks = await StarterPackService.getAvailablePacks();
        setPacks(availablePacks);
      } catch (error) {
        console.error("Error loading packs:", error);
      } finally {
        setLoading(false);
      }
    }
    loadPacks();
  }, []);

  const handlePackPreview = (pack: StarterPack) => {
    setSelectedPack(pack);
    setShowPreview(true);
  };

  return (
    <section id="packs" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm font-medium mb-4"
          >
            Word packs
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-pphatton text-4xl sm:text-5xl font-bold text-gray-900 mb-4"
          >
            Start with curated vocabulary
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Hand-picked word collections covering essential topics. Each pack is
            designed to get you speaking faster.
          </motion.p>
        </div>

        {/* Packs Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 rounded-2xl bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        ) : packs.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {packs.map((pack, index) => (
              <motion.div
                key={pack.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 hover:border-brand-bg/20 hover:shadow-xl hover:shadow-brand-bg/5 transition-all duration-300"
              >
                {/* Pack Icon */}
                <div className="w-14 h-14 rounded-xl bg-brand-bg/10 flex items-center justify-center text-2xl mb-4">
                  {pack.icon || "📚"}
                </div>

                {/* Pack Info */}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {pack.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {pack.description}
                </p>

                {/* Level Badge */}
                {pack.level && (
                  <div className="mb-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-bg/10 text-brand-bg">
                      {pack.level}
                    </span>
                  </div>
                )}

                {/* Preview Button */}
                <button
                  onClick={() => handlePackPreview(pack)}
                  className="flex items-center gap-2 text-sm text-brand-bg hover:text-brand-bg/80 font-medium transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Preview pack
                </button>

                {/* Hover accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-brand-fg/20 to-transparent rounded-tr-2xl rounded-bl-[100px] opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No packs available at the moment.
          </div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowAuthDialog(true)}
            className="rounded-full px-8 py-6 text-lg border-gray-200 hover:border-brand-bg hover:text-brand-bg group"
          >
            Sign up to access all packs
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>

      {/* Preview Modal */}
      <PackPreviewModal
        pack={selectedPack}
        isOpen={showPreview}
        onClose={() => {
          setShowPreview(false);
          setSelectedPack(null);
        }}
      />
    </section>
  );
}
