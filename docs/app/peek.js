import { memoryPeek } from './game.js';
// A white patch teaches nothing. Keep a random window that actually contains drawing.
export function picturePeek(level, pixels, random = Math.random) {
    if (level < 1)
        return null;
    let best = null;
    let bestScore = -1;
    for (let attempt = 0; attempt < 40; attempt++) {
        const candidate = memoryPeek(level, random);
        candidate.y = 25 + random() * 40;
        const cx = pixels.width * candidate.x / 100;
        const cy = pixels.height * candidate.y / 100;
        const radius = Math.min(pixels.width, pixels.height) * candidate.radius * 0.65 / 100;
        let dark = 0;
        let total = 0;
        for (let y = Math.max(0, Math.floor(cy - radius)); y < Math.min(pixels.height, cy + radius); y++) {
            for (let x = Math.max(0, Math.floor(cx - radius)); x < Math.min(pixels.width, cx + radius); x++) {
                if ((x - cx) ** 2 + (y - cy) ** 2 > radius ** 2)
                    continue;
                const i = (y * pixels.width + x) * 4;
                total++;
                if ((pixels.data[i + 3] ?? 0) > 32 && Math.min(pixels.data[i], pixels.data[i + 1], pixels.data[i + 2]) < 155)
                    dark++;
            }
        }
        const score = total ? dark / total : 0;
        if (score > bestScore) {
            best = candidate;
            bestScore = score;
        }
        if (score >= 0.08)
            return candidate;
    }
    return best;
}
