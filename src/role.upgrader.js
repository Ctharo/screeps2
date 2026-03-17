const { STATES } = require('../config');
const { runState, setState } = require('../utils/stateMachine');
const { moveToCached } = require('../systems/pathCache');
const { getTask } = require('../systems/taskManager');

function run(creep) {

    if (!creep.memory.task) {
        getTask(creep);
    }

    runState(creep, {

        [STATES.HARVEST]: () => {
            if (creep.store.getFreeCapacity() === 0) {
                return setState(creep, STATES.UPGRADE);
            }

            const source = creep.pos.findClosestByPath(FIND_SOURCES);
            if (!source) return;

            if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                moveToCached(creep, source);
            }
        },

        [STATES.UPGRADE]: () => {
            if (creep.store[RESOURCE_ENERGY] === 0) {
                return setState(creep, STATES.HARVEST);
            }

            if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
                moveToCached(creep, creep.room.controller);
            }
        },

        [STATES.IDLE]: () => {
            setState(creep, STATES.HARVEST);
        }
    });
}

module.exports = { run };