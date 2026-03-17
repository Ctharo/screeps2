import { ROLES, STATES } from '../config.js';

export function runSpawns() {
    const spawn = Game.spawns['Spawn1'];
    if (!spawn) return;

    const counts = _.countBy(Game.creeps, c => c.memory.role);

    if ((counts.harvester || 0) < 2) {
        spawnCreep(spawn, ROLES.HARVESTER, STATES.HARVEST);
    } else if ((counts.upgrader || 0) < 1) {
        spawnCreep(spawn, ROLES.UPGRADER, STATES.UPGRADE);
    } else if ((counts.builder || 0) < 1) {
        spawnCreep(spawn, ROLES.BUILDER, STATES.BUILD);
    }
}

function spawnCreep(spawn, role, initialState) {
    const name = `${role}_${Game.time}`;

    spawn.spawnCreep([WORK, CARRY, MOVE], name, {
        memory: {
            role,
            state: initialState,
            task: null
        }
    });
}