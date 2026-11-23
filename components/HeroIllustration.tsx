"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import s from "../app/home.module.css";

const maxAngle = Math.PI / 9;
const period = 32_000;
const resumeDelay = 2200;
const clampAngle = (angle: number) => Math.max(-maxAngle, Math.min(maxAngle, angle));

type Renderer = ReturnType<typeof import("./hero-cybersecurity-renderer.mjs").createHeroScene>;

async function createFrameRenderer(canvas: HTMLCanvasElement): Promise<Renderer> {
  const atlas = new Image();
  atlas.src = "/hero/cybersecurity-v5-turn.webp";
  await atlas.decode();
  const renderingContext = canvas.getContext("2d");
  if (!renderingContext) throw new Error("Не удалось открыть панораму первого экрана");
  const context = renderingContext;
  context.imageSmoothingQuality = "high";

  const tile = 800;
  const columns = 6;
  const lastFrame = 29;

  function paint(index: number) {
    context.drawImage(
      atlas, (index % columns) * tile, Math.floor(index / columns) * tile, tile, tile,
      0, 0, canvas.width, canvas.height,
    );
  }

  return {
    resize() {
      const scale = Math.min(2, Math.max(1.5, devicePixelRatio));
      canvas.width = Math.round(canvas.clientWidth * scale);
      canvas.height = Math.round(canvas.clientHeight * scale);
      context.imageSmoothingQuality = "high";
    },
    render(angle) {
      const frame = (clampAngle(angle) / maxAngle + 1) * lastFrame / 2;
      const first = Math.floor(frame);
      const blend = frame - first;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.globalAlpha = 1 - blend;
      paint(first);
      if (blend > 0) {
        context.globalCompositeOperation = "lighter";
        context.globalAlpha = blend;
        paint(first + 1);
        context.globalCompositeOperation = "source-over";
      }
      context.globalAlpha = 1;
    },
    dispose() {
      canvas.width = canvas.height = 1;
    },
  };
}

export function HeroIllustration() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<"webgl" | "frames">("webgl");
  const drawRef = useRef<(() => void) | null>(null);
  const angle = useRef(0);
  const interactionUntil = useRef(0);
  const drag = useRef<{ pointerId: number; x: number; angle: number } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const webglCanvas = canvasRef.current;
    const frameCanvas = frameRef.current;
    if (!webglCanvas || !frameCanvas) return;

    let cancelled = false;
    let dispose: () => void = () => undefined;
    async function initialize() {
      if (!webglCanvas || !frameCanvas) return;
      let canvas = webglCanvas;
      let rendererMode: "webgl" | "frames" = "webgl";
      let scene: Renderer | undefined;
      const context = webglCanvas.getContext("webgl2", { alpha: true, antialias: true });
      if (context) {
        try {
          const { createHeroScene } = await import("./hero-cybersecurity-renderer.mjs");
          if (cancelled) return;
          scene = createHeroScene(canvas, context);
          scene.resize();
          scene.render(0, 0);
        } catch {
          scene?.dispose();
          scene = undefined;
        }
      }
      if (!scene) {
        canvas = frameCanvas;
        rendererMode = "frames";
        scene = await createFrameRenderer(canvas);
      }
      const activeScene = scene;
      if (cancelled) {
        scene.dispose();
        return;
      }
      const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
      const start = performance.now();
      let visible = true;
      let contextLost = false;
      let frame = 0;
      let lastFrame = start;

      function draw(now: number) {
        if (!contextLost) {
          activeScene.render(angle.current, reduceMotion.matches ? 0 : (now - start) / 1000);
        }
      }

      function resize() {
        activeScene.resize();
        draw(performance.now());
      }

      function animate(now: number) {
        frame = requestAnimationFrame(animate);
        const elapsed = now - lastFrame;
        if (elapsed < 1000 / 24) return;
        lastFrame = now;
        if (!visible || document.hidden || reduceMotion.matches || contextLost) return;

        if (!drag.current && now >= interactionUntil.current) {
          const target = maxAngle * Math.sin((now - start) * 2 * Math.PI / period);
          const ease = 1 - Math.exp(-Math.min(elapsed, 100) / 380);
          angle.current = clampAngle(angle.current + (target - angle.current) * ease);
        }
        draw(now);
      }

      function loseContext(event: Event) {
        event.preventDefault();
        contextLost = true;
        drag.current = null;
        setReady(false);
      }

      function restoreContext() {
        contextLost = false;
        resize();
        setReady(true);
      }

      const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
      });
      const sizeObserver = new ResizeObserver(resize);

      dispose = () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        sizeObserver.disconnect();
        canvas.removeEventListener("webglcontextlost", loseContext);
        canvas.removeEventListener("webglcontextrestored", restoreContext);
        drawRef.current = null;
        activeScene.dispose();
      };

      canvas.addEventListener("webglcontextlost", loseContext);
      canvas.addEventListener("webglcontextrestored", restoreContext);
      observer.observe(canvas);
      sizeObserver.observe(canvas);
      drawRef.current = () => draw(performance.now());
      resize();
      setMode(rendererMode);
      setReady(true);
      frame = requestAnimationFrame(animate);
    }

    void initialize().catch(() => {
      dispose();
    });

    return () => {
      cancelled = true;
      dispose();
    };
  }, []);

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0 || !ready) return;
    drag.current = { pointerId: event.pointerId, x: event.clientX, angle: angle.current };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    const active = drag.current;
    if (!active || active.pointerId !== event.pointerId) return;
    angle.current = clampAngle(active.angle + (event.clientX - active.x) * .0055);
    drawRef.current?.();
  }

  function finishDrag(event: PointerEvent<HTMLDivElement>) {
    if (drag.current?.pointerId !== event.pointerId) return;
    drag.current = null;
    interactionUntil.current = performance.now() + resumeDelay;
  }

  function turnWithKeys(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const direction = event.key === "ArrowLeft" ? -1 : 1;
    angle.current = clampAngle(angle.current + direction * Math.PI / 45);
    interactionUntil.current = performance.now() + resumeDelay;
    drawRef.current?.();
  }

  return (
    <div
      className={s.heroModel}
      data-ready={ready}
      data-mode={mode}
      tabIndex={ready ? 0 : -1}
      aria-label={ready ? "3D-иллюстрация сети кибербезопасности. Перетащите или нажмите стрелку влево или вправо, чтобы повернуть." : undefined}
      onPointerDown={startDrag}
      onPointerMove={moveDrag}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      onLostPointerCapture={finishDrag}
      onKeyDown={turnWithKeys}
    >
      <img
        className={s.heroPoster}
        src="/hero/cybersecurity-v4-poster.webp"
        width={720}
        height={720}
        alt={ready ? "" : "3D-иллюстрация сети кибербезопасности"}
        fetchPriority="high"
      />
      <canvas ref={canvasRef} className={s.heroCanvas} data-surface="webgl" aria-hidden="true" />
      <canvas ref={frameRef} className={s.heroCanvas} data-surface="frames" aria-hidden="true" />
    </div>
  );
}
