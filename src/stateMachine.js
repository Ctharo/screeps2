export function runState(creep, states) {
    const state = creep.memory.state;

    if (!states[state]) {
        creep.memory.state = 'idle';
        return;
    }

    states[state](creep);
}

export function setState(creep, newState) {
    creep.memory.state = newState;
}