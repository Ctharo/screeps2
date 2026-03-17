import { STATES } from '../config.js';
import { runState, setState } from '../utils/stateMachine.js';
import { moveToCached } from '../systems/pathCache.js';
import { getTask, getMyTask, completeTask } from '../systems/taskManager.js';

export function run(creep) {

    if (!creep.memory.task) {
        getTask(creep);
    }

    runState(creep, {

        [STATES.HARVEST]: (creep) => {
            if (creep.store.getFreeCapacity() === 0) {
                return setState(creep, STATES.DELIVER);
            }

            const source = creep.pos.findClosestByPath(FIND_SOURCES);

            if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                moveToCached(creep, source);
            }
        },

        [STATES.DELIVER]: (creep) => {
            if (creep.store[RESOURCE_ENERGY] === 0) {
                return setState(creep, STATES.HARVEST);
            }

            const target = creep.room.find(FIND_STRUCTURES, {
                filter: s =>
                    (s.structureType === STRUCTURE_SPAWN ||
                     s.structureType === STRUCTURE_EXTENSION) &&
                    s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            })[0];

            if (target) {
                if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    moveToCached(creep, target);
                }
            } else {
                completeTask(creep);
                setState(creep, STATES.HARVEST);
            }
        }
    });
}