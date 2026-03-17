const CACHE_TTL = 50;

function getKey(from, to) {
    return `${from.x},${from.y}->${to.x},${to.y}`;
}

export function moveToCached(creep, target) {
    if (!Memory.pathCache) Memory.pathCache = {};

    const key = getKey(creep.pos, target.pos || target);

    let cached = Memory.pathCache[key];

    if (!cached || Game.time - cached.time > CACHE_TTL) {
        const path = creep.pos.findPathTo(target, { serialize: true });

        Memory.pathCache[key] = {
            path,
            time: Game.time
        };

        cached = Memory.pathCache[key];
    }

    creep.moveByPath(cached.path);
}