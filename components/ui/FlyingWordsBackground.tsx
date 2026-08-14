"use client";

/**
 * FlyingWordsBackground — latar animasi global CikguBoleh.
 *
 * Perkataan berkaitan pendidikan berterbangan perlahan di belakang semua
 * kandungan. Apabila "CIKGU BOLEH" terlanggar tepi skrin ia melalui kitaran:
 *   IMPACT → PECAH (letters scatter) → CANTUM SEMULA (reassemble) → BOUNCE → terbang lagi.
 *
 * Prestasi:
 *  - Satu <canvas> sahaja (tiada layout thrashing / reflow).
 *  - requestAnimationFrame + lukisan transform-friendly.
 *  - DPR dihadkan ke 2; jeda bila tab tersembunyi.
 *  - Responsif kepada resize/orientation tanpa menyebabkan layout bergerak.
 *  - Hormati prefers-reduced-motion (perkataan statik, tiada gerakan).
 *  - pointer-events: none, z-index -10 → tidak mengganggu klik/borang/kandungan.
 */

import { useEffect, useRef } from "react";

const TEAL = "13,148,136";     // #0d9488
const ORANGE = "249,115,22";   // #f97316

// Perkataan lain (identiti pendidikan) — dilukis satu warna, pantulan mudah.
const EDU_WORDS = ["RPH", "MURID", "ILMU", "DIDIK", "PPKI", "PENTAKSIRAN", "SEKOLAH"];

type Phase = "fly" | "impact" | "shatter" | "reassemble";

interface Letter { ch: string; ox: number; teal: boolean }
interface Frag { dx: number; dy: number; vx: number; vy: number; rot: number; vrot: number }

interface Word {
  brand: boolean;
  text: string;
  color: string;      // untuk perkataan edu
  x: number; y: number; vx: number; vy: number;
  size: number; alpha: number;
  w: number;          // lebar diukur
  phase: Phase; t: number;
  letters: Letter[];  // brand sahaja
  frags: Frag[];      // brand sahaja (semasa pecah/cantum)
  measured: boolean;
}

export function FlyingWordsBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0, H = 0, dpr = 1;
    let words: Word[] = [];
    let raf = 0;
    let running = true;

    const font = (size: number) => `800 ${size}px "Plus Jakarta Sans", system-ui, sans-serif`;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas!.width = Math.floor(W * dpr);
      canvas!.height = Math.floor(H * dpr);
      canvas!.style.width = W + "px";
      canvas!.style.height = H + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      // pastikan perkataan kekal dalam viewport baharu
      for (const wd of words) {
        wd.x = Math.min(Math.max(wd.x, 0), Math.max(W - wd.w, 0));
        wd.y = Math.min(Math.max(wd.y, wd.size), H - 4);
      }
    }

    function measure(wd: Word) {
      ctx!.font = font(wd.size);
      wd.w = ctx!.measureText(wd.text).width;
      if (wd.brand) {
        wd.letters = [];
        let ox = 0;
        const bolehStart = wd.text.indexOf("BOLEH");
        for (let i = 0; i < wd.text.length; i++) {
          const ch = wd.text[i];
          const cw = ctx!.measureText(ch).width;
          wd.letters.push({ ch, ox, teal: i < bolehStart });
          ox += cw;
        }
      }
      wd.measured = true;
    }

    function make(brand: boolean, text: string): Word {
      const isMobile = W < 640;
      const size = brand
        ? (isMobile ? 30 : 46) + Math.random() * (isMobile ? 8 : 18)
        : (isMobile ? 20 : 28) + Math.random() * (isMobile ? 8 : 16);
      const speed = 0.18 + Math.random() * 0.28;
      const ang = Math.random() * Math.PI * 2;
      return {
        brand, text,
        color: Math.random() > 0.5 ? TEAL : ORANGE,
        x: Math.random() * W * 0.8 + W * 0.1,
        y: Math.random() * H * 0.8 + H * 0.1,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed,
        size, alpha: brand ? 0.12 : 0.09,
        w: 0, phase: "fly", t: 0, letters: [], frags: [], measured: false,
      };
    }

    function init() {
      const isMobile = W < 640;
      const brandCount = isMobile ? 2 : 3;
      const eduCount = isMobile ? 2 : 4;
      words = [];
      for (let i = 0; i < brandCount; i++) words.push(make(true, "CIKGU BOLEH"));
      for (let i = 0; i < eduCount; i++) words.push(make(false, EDU_WORDS[i % EDU_WORDS.length]));
      for (const wd of words) measure(wd);
    }

    function startShatter(wd: Word) {
      wd.phase = "impact"; wd.t = 0;
      wd.frags = wd.letters.map(() => ({
        dx: 0, dy: 0,
        vx: (Math.random() - 0.5) * 3.2,
        vy: (Math.random() - 0.5) * 3.2 - 0.6,
        rot: 0, vrot: (Math.random() - 0.5) * 0.3,
      }));
    }

    function drawWord(wd: Word) {
      if (!wd.measured) measure(wd);
      ctx!.font = font(wd.size);
      ctx!.textBaseline = "alphabetic";

      if (!wd.brand) {
        ctx!.fillStyle = `rgba(${wd.color},${wd.alpha})`;
        ctx!.fillText(wd.text, wd.x, wd.y);
        return;
      }

      // brand
      if (wd.phase === "fly") {
        for (const L of wd.letters) {
          ctx!.fillStyle = `rgba(${L.teal ? TEAL : ORANGE},${wd.alpha})`;
          ctx!.fillText(L.ch, wd.x + L.ox, wd.y);
        }
      } else {
        // impact/shatter/reassemble — lukis setiap huruf pada offset frag
        for (let i = 0; i < wd.letters.length; i++) {
          const L = wd.letters[i]; const f = wd.frags[i];
          ctx!.save();
          ctx!.translate(wd.x + L.ox + f.dx, wd.y + f.dy);
          ctx!.rotate(f.rot);
          ctx!.fillStyle = `rgba(${L.teal ? TEAL : ORANGE},${wd.alpha})`;
          ctx!.fillText(L.ch, 0, 0);
          ctx!.restore();
        }
      }
    }

    function step() {
      ctx!.clearRect(0, 0, W, H);
      for (const wd of words) {
        // gerakan badan perkataan
        wd.x += wd.vx; wd.y += wd.vy;

        // pantulan tepi
        let hit = false;
        if (wd.x < 0) { wd.x = 0; wd.vx = Math.abs(wd.vx); hit = true; }
        else if (wd.x + wd.w > W) { wd.x = W - wd.w; wd.vx = -Math.abs(wd.vx); hit = true; }
        if (wd.y - wd.size < 0) { wd.y = wd.size; wd.vy = Math.abs(wd.vy); hit = true; }
        else if (wd.y > H) { wd.y = H; wd.vy = -Math.abs(wd.vy); hit = true; }

        if (hit && wd.brand && wd.phase === "fly") startShatter(wd);

        // kitaran pecah → cantum
        if (wd.brand && wd.phase !== "fly") {
          wd.t += 1;
          if (wd.phase === "impact") {
            if (wd.t > 6) { wd.phase = "shatter"; wd.t = 0; }
          } else if (wd.phase === "shatter") {
            for (const f of wd.frags) {
              f.dx += f.vx; f.dy += f.vy; f.vy += 0.05; f.rot += f.vrot;
            }
            if (wd.t > 26) { wd.phase = "reassemble"; wd.t = 0; }
          } else if (wd.phase === "reassemble") {
            let done = true;
            for (const f of wd.frags) {
              f.dx += (0 - f.dx) * 0.14; f.dy += (0 - f.dy) * 0.14; f.rot += (0 - f.rot) * 0.14;
              if (Math.abs(f.dx) > 0.5 || Math.abs(f.dy) > 0.5) done = false;
            }
            if (done || wd.t > 60) { wd.phase = "fly"; wd.t = 0; }
          }
        }

        drawWord(wd);
      }
      if (running) raf = requestAnimationFrame(step);
    }

    function drawStatic() {
      ctx!.clearRect(0, 0, W, H);
      for (const wd of words) drawWord(wd);
    }

    // ---- setup ----
    resize(); init();
    if (reduce) {
      drawStatic();
    } else {
      raf = requestAnimationFrame(step);
    }

    let rt = 0;
    const onResize = () => {
      clearTimeout(rt);
      rt = window.setTimeout(() => { resize(); if (reduce) drawStatic(); }, 150);
    };
    const onVis = () => {
      if (document.hidden) { running = false; cancelAnimationFrame(raf); }
      else if (!reduce && !running) { running = true; raf = requestAnimationFrame(step); }
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      clearTimeout(rt);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{
        position: "fixed", inset: 0, width: "100%", height: "100%",
        zIndex: -9, pointerEvents: "none",
      }}
    />
  );
}
