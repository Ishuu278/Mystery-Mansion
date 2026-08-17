// Generate random positions for 4 answer clue cards scattered in the dark room.
// Cards must not overlap each other, the question banner, or the HUD.

const MIN_DISTANCE = 18;

function randomInRange(min, max) {
  return min + Math.random() * (max - min);
}

function distance(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function generateCluePositions(count) {
  const positions = [];
  let attempts = 0;
  const maxAttempts = 300;

  while (positions.length < count && attempts < maxAttempts) {
    const pos = {
      x: randomInRange(10, 90),
      y: randomInRange(20, 82),
    };

    const tooClose = positions.some((p) => distance(p, pos) < MIN_DISTANCE);
    if (!tooClose) {
      positions.push(pos);
    }
    attempts++;
  }

  while (positions.length < count) {
    positions.push({
      x: randomInRange(10, 90),
      y: randomInRange(20, 82),
    });
  }

  return positions;
}
