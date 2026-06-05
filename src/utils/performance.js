const SLOW_THRESHOLD_MS = 100;

export function measurePerformance(label, fn) {
  const start = performance.now();
  const result = fn();
  const elapsed = performance.now() - start;

  if (elapsed > SLOW_THRESHOLD_MS) {
    console.warn(`SLOW OPERATION: ${label} took ${elapsed.toFixed(2)}ms`);
  }

  return result;
}

export function onRenderCallback(id, phase, actualDuration) {
  if (actualDuration > 50) {
    console.warn(`SLOW RENDER: ${id} (${phase}) took ${actualDuration.toFixed(2)}ms`);
  }
}
