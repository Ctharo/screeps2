export function initTasks() {
    if (!Memory.tasks) {
        Memory.tasks = [];
    }
}

export function addTask(task) {
    Memory.tasks.push({
        id: `${Game.time}-${Math.random()}`,
        assigned: null,
        ...task
    });
}

export function getTask(creep) {
    const task = Memory.tasks.find(t => !t.assigned);

    if (task) {
        task.assigned = creep.name;
        creep.memory.task = task.id;
        creep.say(`🛠 ${task.type}`);
    }

    return task;
}

export function getMyTask(creep) {
    return Memory.tasks.find(t => t.id === creep.memory.task);
}

export function completeTask(creep) {
    Memory.tasks = Memory.tasks.filter(t => t.id !== creep.memory.task);
    creep.memory.task = null;
}