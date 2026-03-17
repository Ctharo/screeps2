import { STATES } from '../config.js';
import { runState, setState } from '../utils/stateMachine.js';
import { moveToCached } from '../systems/pathCache.js';

export function run(creep) {
    runState(creep, {

        [STATES.BUILD]: (creep) => {
            if (creep.store[RESOURCE_ENERGY] === 0) {
                return setState(creep, STATES.HHARVEST);
            }

            const site = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);

            if (site) {
                if (creep.build(site) === ERR_NOT_IN_RANGE) {
                    moveToCached(creep, site);
                }
            } else {
                setState(creep, STATES.UPGRADE);
            }
        }
    });
}