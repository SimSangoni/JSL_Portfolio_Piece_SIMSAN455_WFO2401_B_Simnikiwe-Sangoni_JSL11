clear()
const tasksString = localStorage.getItem('tasks');
const tasksArray = JSON.parse(tasksString);

console.log(tasksArray);