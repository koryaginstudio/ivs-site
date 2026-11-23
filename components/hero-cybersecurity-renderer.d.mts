export function createHeroScene(canvas: HTMLCanvasElement, context: WebGL2RenderingContext): {
  resize(): void;
  render(angle: number, time: number): void;
  dispose(): void;
};
