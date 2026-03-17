const { STATES } = require('../config');
const { runState, setState } = require('../utils/stateMachine');
const { moveToCached } = require('../systems/pathCache');
const { getTask, completeTask } = require('../systems/taskManager');

function run(creep) {

    if (!creep.memory.task) {
        getTask(creep);
    }

    runState(creep, {

        [STATES.HARVEST]: () => {
            if (creep.store.getFreeCapacity() === 0) {
                return setState(creep, STATES.DELIVER);
            }

            const source = creep.pos.findClosestByPath(FIND_SOURCES);
            if (!source) return;

            if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                moveToCached(creep, source);
            }
        },

        [STATES.DELIVER]: () => {
            if (creep.store[RESOURCE_ENERGY] === 0) {
                return setState(creep, STATES.HARVEST);
            }

            const target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: s =>
                    (s.structureType === STRUCTURE_SPAWN ||
                     s.structureType === STRUCTURE_EXTENSION) &&
                    s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            });

            if (target) {
                if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    moveToCached(creep, target);
                }
            } else {
                completeTask(creep);
                setState(creep, STATES.HARVEST);
            }
        },

        [STATES.IDLE]: () => {
            setState(creep, STATES.HARVEST);
        }
    });
}

module.exports = { run };