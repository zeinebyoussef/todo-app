module.exports = {
  getTaskById: function (tasks, id) {
    const tmpTask = tasks.find((task) => task.uuid === id);
    if (tmpTask) return tmpTask;
    return -1;
  },
};
