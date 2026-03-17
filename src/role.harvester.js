var config = require('../config');
var STATES = config.STATES;

var stateMachine = require('../utils/stateMachine');
var runState = stateMachine.runState;
var setState = stateMachine.setState;

var pathCache = require('../systems/pathCache');
var moveToCached = pathCache.moveToCached;

var taskManager = require('../systems/taskManager');
var getTask = taskManager.getTask;
var completeTask = taskManager.completeTask;

function run(creep) {

    if (!creep.memory.task) {
        getTask(creep);
    }

    var states = {};

    states[STATES.HARVEST] = function () {
        if (creep.store.getFreeCapacity() === 0) {
            setState(creep, STATES.DELIVER);
            return;
        }

        var source = creep.pos.findClosestByPath(FIND_SOURCES);
        if (!source) return;

        if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
            moveToCached(creep, source);
        }
    };

    states[STATES.DELIVER] = function () {
        if (creep.store[RESOURCE_ENERGY] === 0) {
            setState(creep, STATES.HARVEST);
            return;
        }

        var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: function (s) {
                return (
                    (s.structureType === STRUCTURE_SPAWN ||
                     s.structureType === STRUCTURE_EXTENSION) &&
                    s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                );
            }
        });

        if (target) {
            if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                moveToCached(creep, target);
            }
        } else {
            completeTask(creep);
            setState(creep, STATES.HARVEST);
        }
    };

    states[STATES.IDLE] = function () {
        setState(creep, STATES.HARVEST);
    };

    runState(creep, states);
}

module.exports = {
    run: run
};