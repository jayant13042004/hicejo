"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, LayoutTemplate, ArrowRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STARTER_TEMPLATES, StarterTemplate } from "@/data/starterTemplates";

interface StarterTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: StarterTemplate) => void;
}

export function StarterTemplatesModal({
  isOpen,
  onClose,
  onSelectTemplate
}: StarterTemplatesModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-foreground"
        >
          {/* Header */}
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <LayoutTemplate className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">Industry Starter Templates</h3>
                <p className="text-xs text-muted-foreground">
                  Choose a pre-filled, ATS-tested resume to jumpstart your career profile.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground text-sm p-1.5 rounded-lg hover:bg-muted cursor-pointer transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {STARTER_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                className="p-4 rounded-xl border border-border/80 hover:border-primary/60 bg-muted/20 hover:bg-muted/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                      {tmpl.category}
                    </span>
                    <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                      {tmpl.name}
                    </h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {tmpl.description}
                  </p>
                  <p className="text-[11px] text-zinc-500 font-mono">
                    Target Role: {tmpl.role}
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => {
                    onSelectTemplate(tmpl);
                    onClose();
                  }}
                  className="bg-primary text-primary-foreground gap-1.5 text-xs font-semibold shrink-0 cursor-pointer shadow-xs"
                >
                  <span>Use Template</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
            <span>💡 Loading a template will prefill sample data that you can customize.</span>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
