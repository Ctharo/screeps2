import { runSpawns } from './spawnManager.js';
import { initTasks } from './taskManager.js';

import * as harvester from './role.harvester.js';
import * as builder from './role.builder.js';
import * as upgrader from './role.upgrader.js';

const roleMap = {
    harvester,
    builder,
    upgrader
};

function safeRun(label, fn) {
    try {
        fn();
    } catch (e) {
        console.log(`[ERROR] ${label}: ${e.stack}`);
    }
};

function cleanupMemory() {
    for (const name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }
};

module.exports.loop = function () {

    initTasks();

    safeRun('memory cleanup', cleanupMemory);
    safeRun('spawns', runSpawns);

    for (const name in Game.creeps) {
        const creep = Game.creeps[name];

        safeRun(`creep ${name}`, () => {
            const role = roleMap[creep.memory.role];
            if (!role) return;

            role.run(creep);
        });
    }
};