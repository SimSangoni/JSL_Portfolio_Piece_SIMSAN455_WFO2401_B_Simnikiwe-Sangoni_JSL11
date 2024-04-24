// TASK: import helper functions from utils
import { getTasks, createNewTask, patchTask, deleteTask } from "./utils/taskFunctions.js";
// TASK: import initialData
import { initialData } from "./initialData.js"; 


/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists in localStorage');
  }
}

initializeData();

// TASK: Get elements from the DOM
const elements = {
  headerBoardName: document.getElementById("header-board-name"),
  columnDivs: document.querySelectorAll(".column-div"),
  editTaskModal: document.querySelector(".edit-task-modal-window"),
  filterDiv: document.getElementById("filterDiv"),
  hideSideBarBtn: document.getElementById("hide-side-bar-btn"),
  showSideBarBtn: document.getElementById("show-side-bar-btn"),
  themeSwitch: document.getElementById("switch"),
  createNewTaskBtn: document.getElementById("add-new-task-btn"),
  modalWindow: document.getElementById("new-task-modal-window"), 
}

let activeBoard = ""

// Extracts unique board names from tasks
// TASK: FIX BUGS: ternary operator fix
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"))
    activeBoard = localStorageBoard ? localStorageBoard :  boards[0]; 
    elements.headerBoardName.textContent = activeBoard
    styleActiveBoard(activeBoard)
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener('click', () => { 
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard))
      styleActiveBoard(activeBoard)
    });
    boardsContainer.appendChild(boardElement);
  });

}

const columnTitles = {
  todo: "todo",
  doing: "doing",
  done: "done"
};


// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName);

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    const columnTitle = columnTitles[status];
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${columnTitle.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => { 
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      taskElement.addEventListener('click', () => { 
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
  });
}


function refreshTasksUI() {

  filterAndDisplayTasksByBoard(activeBoard);

}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { 
    
    if(btn.textContent === boardName) {
      btn.classList.add('active') 
    }
    else {
      btn.classList.remove('active'); 
    }
  });
}


function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`); 
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);
  
  tasksContainer.appendChild(taskElement); 
}



function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener('click', toggleModal(false, elements.editTaskModal));


  // getEventListeners(document.getElementById('cancel-edit-btn'))

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener('click', () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener('click', () => toggleSidebar(true));

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit', (event) => {
    addTask(event)
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none'; 
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault(); 

  //Assign user input to the task object

  const titleInput = document.getElementById('title-input').value;
  const descriptionInput = document.getElementById('desc-input').value;
  const statusInput = document.getElementById('select-status').value;

  const boardName = elements.headerBoardName.textContent;

    const task = {

      "title": titleInput,
      "description": descriptionInput,
      "status": statusInput,
      "board": boardName
    };

    const newTask = createNewTask(task);
    if (newTask) {
      addTaskToUI(newTask);
      toggleModal(false);
      console.clear()
      const tasksString = localStorage.getItem('tasks');
      const tasksArray = JSON.parse(tasksString);
      console.log(tasksArray);
      console.log(`"${newTask.title}" added.`);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
      event.target.reset();
      refreshTasksUI();
    }
}


function toggleSidebar(show) {
  const sidebar = document.getElementById('side-bar-div');
  if (show) {
    sidebar.style.display = 'block';
    elements.showSideBarBtn.style.display = 'none';
  } else {
    sidebar.style.display = 'none';
    elements.showSideBarBtn.style.display = 'block';
  }
 
}

function toggleTheme() {
  // Check the current state of the theme switch
  const isLightTheme = elements.themeSwitch.checked;

  localStorage.setItem('light-theme', isLightTheme ? 'enabled' : 'disabled');

  document.body.classList.toggle('light-theme', isLightTheme);
 
}


let deleteTaskListenerAdded = false;


function openEditTaskModal(task) {

  const titleInput = document.getElementById('edit-task-title-input');
  const descriptionInput = document.getElementById('edit-task-desc-input');
  const statusSelect = document.getElementById('edit-select-status');

  titleInput.value = task.title;
  descriptionInput.value = task.description;
  statusSelect.value = task.status;


  const saveChangesHandler = () => {
    saveTaskChanges(task.id);
    console.log(`"${task.title}" edited.`);
  };

  const saveChangesBtn = document.getElementById('save-task-changes-btn');
  saveChangesBtn.removeEventListener('click', saveChangesHandler);
  saveChangesBtn.addEventListener('click', once(saveChangesHandler));


  function onDeleteTaskClick() {
    if (deleteTaskListenerAdded) {
        document.getElementById("delete-task-btn").removeEventListener("click", onDeleteTaskClick);
        deleteTaskListenerAdded = false;
    }

    deleteTask(task.id);
    console.log(`"${task.title}" deleted.`);
    toggleModal(false, elements.editTaskModal);
    refreshTasksUI();
  }

  if (!deleteTaskListenerAdded) {
    document.getElementById("delete-task-btn").addEventListener("click", onDeleteTaskClick);
    deleteTaskListenerAdded = true;
  }

  // This is to log out the local storage array:
  console.clear();
  const tasksString = localStorage.getItem('tasks');
  const tasksArray = JSON.parse(tasksString);

  console.log(tasksArray);

  toggleModal(true, elements.editTaskModal);
  refreshTasksUI();
}

function once(handler) {
  let executed = false;
  return function () {
    if (!executed) {
      executed = true;
      handler();
    }
  };
}

function saveTaskChanges(taskId) {

  // Get new user inputs
  const titleInput = document.getElementById('edit-task-title-input').value;
  const descriptionInput = document.getElementById('edit-task-desc-input').value;
  const statusInput = document.getElementById('edit-select-status').value;
  const boardName = elements.headerBoardName.textContent;

  // Create an object with the updated task details
  const updatedTask = {
    "id": taskId,
    "title": titleInput,
    "description": descriptionInput,
    "status": statusInput,
    "board": boardName
  };
  

  // Update task using a helper functoin
  patchTask(taskId, updatedTask);


  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModal);
  refreshTasksUI();
 
}


/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'false';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  elements.themeSwitch.checked = isLightTheme;
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}
console.clear()
const tasksString = localStorage.getItem('tasks');
const tasksArray = JSON.parse(tasksString);
console.log(tasksArray);

// localStorage.clear();