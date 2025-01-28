export type Particle = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
  color: string;
};

export function createParticles(linesCleared: number, x = 0, y = 0): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < linesCleared * 10; i++) {
    particles.push({
      x: x + Math.random() * 30,
      y: y + Math.random() * 30,
      dx: (Math.random() - 0.5) * 2,
      dy: (Math.random() - 0.5) * 2,
      size: Math.random() * 5 + 2,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`
    });
  }
  return particles;
}

export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  particles.forEach(particle => {
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

export function updateParticles(particles: Particle[]): Particle[] {
  return particles.map(particle => ({
    ...particle,
    x: particle.x + particle.dx,
    y: particle.y + particle.dy,
    size: particle.size * 0.95
  })).filter(particle => particle.size > 0.5);
}
