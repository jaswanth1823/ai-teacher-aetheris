"use client";

import React, { useEffect, useState } from "react";
import { FunctionSquare } from "lucide-react";

interface FormulaDisplayProps {
  formula: string;
}

// Convert any LaTeX string into clean, beautiful HTML typography
function renderLatexToHtml(raw: string): string {
  if (!raw) return "";

  let s = raw.trim();

  // Strip wrapping dollar signs
  s = s.replace(/^\$+|\$+$/g, "").trim();

  // 1. Vector transformations \vec{F} -> F&#8407; (combining vector arrow)
  s = s.replace(/\\vec\{([A-Za-z0-9]+)\}/g, '<span class="italic font-serif">$1<span class="text-cyan-400 font-bold ml-0.5">⃗</span></span>');

  // 2. Text blocks \text{net}, \mathrm{...}
  s = s.replace(/\\text\{([^}]+)\}/g, '<span class="font-sans text-slate-300 text-sm md:text-base">$1</span>');
  s = s.replace(/\\mathrm\{([^}]+)\}/g, '<span class="font-sans text-slate-300">$1</span>');
  s = s.replace(/\\mathbf\{([^}]+)\}/g, '<span class="font-bold text-white">$1</span>');
  s = s.replace(/\\mathcal\{([^}]+)\}/g, '<span class="font-serif italic text-purple-300">$1</span>');

  // 3. Fractions \frac{a}{b} -> (a / b) with stacked presentation
  s = s.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '<span class="inline-flex flex-col items-center justify-center align-middle mx-1"><span class="border-b border-cyan-400/60 pb-0.5 px-1 text-sm md:text-base">$1</span><span class="pt-0.5 px-1 text-sm md:text-base text-slate-300">$2</span></span>');

  // 4. Arrows & Relations
  s = s.replace(/\\xrightarrow\{([^}]+)\}/g, ' <span class="text-cyan-400 font-mono px-2 text-sm">── $1 ──➔</span> ');
  s = s.replace(/\\longrightarrow/g, ' <span class="text-cyan-400 px-1">───➔</span> ');
  s = s.replace(/\\rightarrow/g, ' <span class="text-cyan-400 px-1">➔</span> ');
  s = s.replace(/\\Longleftrightarrow/g, ' <span class="text-amber-400 font-bold px-2">⟺</span> ');
  s = s.replace(/\\Longrightarrow/g, ' <span class="text-emerald-400 font-bold px-2">⟹</span> ');
  s = s.replace(/\\implies/g, ' <span class="text-emerald-400 font-bold px-2">⟹</span> ');
  s = s.replace(/\\propto/g, ' <span class="text-purple-400 px-1.5">∝</span> ');
  s = s.replace(/\\approx/g, ' <span class="text-slate-300 px-1">≈</span> ');
  s = s.replace(/\\neq/g, ' <span class="text-red-400 px-1">≠</span> ');
  s = s.replace(/\\cdot/g, ' <span class="text-cyan-400 font-bold px-1.5">·</span> ');
  s = s.replace(/\\times/g, ' <span class="text-cyan-400 font-bold px-1.5">×</span> ');

  // 5. Greek & Math symbols
  s = s.replace(/\\Delta/g, '<span class="text-amber-300">Δ</span>');
  s = s.replace(/\\nabla/g, '<span class="text-cyan-300">∇</span>');
  s = s.replace(/\\sum/g, '<span class="text-2xl text-purple-300 align-middle">∑</span>');
  s = s.replace(/\\int_?([^{]*)\^?([^{]*)/g, '<span class="text-2xl text-emerald-300 align-middle">∫</span>');
  s = s.replace(/\\infty/g, '∞');
  s = s.replace(/\\sigma/g, 'σ');
  s = s.replace(/\\partial/g, '∂');
  s = s.replace(/\\sqrt\{([^}]+)\}/g, '<span class="inline-flex items-center"><span class="text-cyan-400 text-lg mr-0.5">√</span><span class="border-t border-cyan-400/80 px-1">$1</span></span>');

  // 6. Subscripts and Superscripts (e.g. F_{12}, F_{net}, x^2)
  s = s.replace(/_\{([^}]+)\}/g, '<sub class="text-xs text-cyan-300 font-sans ml-0.5">$1</sub>');
  s = s.replace(/\^\{([^}]+)\}/g, '<sup class="text-xs text-amber-300 font-sans ml-0.5">$1</sup>');
  s = s.replace(/_([0-9a-zA-Z])/g, '<sub class="text-xs text-cyan-300 font-sans">$1</sub>');
  s = s.replace(/\^([0-9a-zA-Z])/g, '<sup class="text-xs text-amber-300 font-sans">$1</sup>');

  // 7. Spacing & cleanup
  s = s.replace(/\\quad/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
  s = s.replace(/\\qquad/g, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
  s = s.replace(/\\[,;!]/g, '&nbsp;');
  s = s.replace(/\\/g, ''); // strip remaining rogue backslashes

  return s;
}

export const FormulaDisplay: React.FC<FormulaDisplayProps> = ({ formula }) => {
  const [renderedHtml, setRenderedHtml] = useState<string>("");

  useEffect(() => {
    if (!formula) return;

    // Try KaTeX first if available in window
    if (typeof window !== "undefined" && (window as any).katex) {
      try {
        const cleanRaw = formula.replace(/^\$+|\$+$/g, "").trim();
        const html = (window as any).katex.renderToString(cleanRaw, {
          throwOnError: false,
          displayMode: true,
        });
        setRenderedHtml(html);
        return;
      } catch (e) {
        // Fall through to custom renderer
      }
    }

    // Custom high-fidelity styled typography
    setRenderedHtml(renderLatexToHtml(formula));
  }, [formula]);

  return (
    <div className="w-full flex items-center justify-center">
      <div
        className="text-xl sm:text-2xl md:text-3xl font-serif text-cyan-200 tracking-wide py-4 px-2 overflow-x-auto text-center font-medium leading-relaxed"
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />
    </div>
  );
};
