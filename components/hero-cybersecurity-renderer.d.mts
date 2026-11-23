export function createHeroScene(canvas: HTMLCanvasElement, context: WebGL2RenderingContext): {
  resize(): void;
  render(angle: number, time: number, tilt?: number): void;
  dispose(): void;
};
