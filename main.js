'use strict';

// ===== Config =====
const ROLES = {
    HARVESTER: 'harvester',
    UPGRADER: 'upgrader',
    BUILDER: 'builder'
};

// ===== Utility: Safe execution wrapper =====
function safeRun(label, fn) {
    try {
        fn();
    } catch (err) {
        console.log(`[ERROR] ${label}: ${err.stack || err}`);
    }
}

// ===== Role Logic =====
const roles = {

    [ROLES.HARVESTER]: (creep) => {
        if (creep.store.getFreeCapacity() > 0) {
            const source = creep.pos.findClosestByPath(FIND_SOURCES);
            if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
            }
        } else {
            const target = creep.room.find(FIND_STRUCTURES, {
                filter: s =>
                    (s.structureType === STRUCTURE_SPAWN ||
                     s.structureType === STRUCTURE_EXTENSION) &&
                    s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            })[0];

            if (target) {
                if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
                }
            }
        }
    },

    [ROLES.UPGRADER]: (creep) => {
        if (creep.store[RESOURCE_ENERGY] === 0) {
            const source = creep.pos.findClosestByPath(FIND_SOURCES);
            if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }
        } else {
            if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
        }
    },

    [ROLES.BUILDER]: (creep) => {
        if (creep.store[RESOURCE_ENERGY] === 0) {
            const source = creep.pos.findClosestByPath(FIND_SOURCES);
            if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }
        } else {
            const site = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
            if (site) {
                if (creep.build(site) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(site);
                }
            } else {
                // fallback
                roles[ROLES.UPGRADER](creep);
            }
        }
    }
};

// ===== Spawn Logic =====
function manageSpawns() {
    const spawn = Game.spawns['Spawn1'];
    if (!spawn) return;

    const counts = _.countBy(Game.creeps, c => c.memory.role);

    if ((counts[ROLES.HARVESTER] || 0) < 2) {
        spawn.spawnCreep([WORK, CARRY, MOVE], `H${Game.time}`, {
            memory: { role: ROLES.HARVESTER }
        });
    } else if ((counts[ROLES.UPGRADER] || 0) < 1) {
        spawn.spawnCreep([WORK, CARRY, MOVE], `U${Game.time}`, {
            memory: { role: ROLES.UPGRADER }
        });
    } else if ((counts[ROLES.BUILDER] || 0) < 1) {
        spawn.spawnCreep([WORK, CARRY, MOVE], `B${Game.time}`, {
            memory: { role: ROLES.BUILDER }
        });
    }
}

// ===== Memory Cleanup =====
function cleanupMemory() {
    for (const name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }
}

// ===== Main Loop =====
module.exports.loop = function () {

    const startCPU = Game.cpu.getUsed();

    safeRun('memory cleanup', cleanupMemory);
    safeRun('spawn manager', manageSpawns);

    // Run creeps
    for (const name in Game.creeps) {
        const creep = Game.creeps[name];

        safeRun(`creep ${name}`, () => {
            const role = creep.memory.role;
            const roleFn = roles[role];

            if (!roleFn) {
                console.log(`Unknown role: ${role}`);
                return;
            }

            roleFn(creep);
        });
    }

    // ===== Performance logging =====
    const usedCPU = Game.cpu.getUsed() - startCPU;

    if (Game.time % 10 === 0) {
        console.log(`Tick ${Game.time} | CPU: ${usedCPU.toFixed(2)}`);
    }
};