import { useState } from "react";
import { nanoid } from "nanoid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import Modal from "./Modal";
import { GroceryPanel } from "./GroceryPanel";

function AddTaskForm({ onNewTask }) {
  const [taskName, setTaskName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (taskName.trim()) {
      onNewTask(taskName);
      setTaskName("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
      <input
        type="text"
        placeholder="New task name"
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded transition hover:bg-blue-600 active:bg-blue-700"
      >
        Add task
      </button>
    </form>
  );
}

function TodoItem({ task, toggleTaskCompletion, deleteTask }) {
  return (
    <li className="flex items-center justify-between p-2 border-b border-gray-200">
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          className="accent-blue-500"
          checked={task.completed}
          onChange={() => toggleTaskCompletion(task.id)}
        />
        <span className={task.completed ? "line-through text-gray-500" : ""}>
          {task.name}
        </span>
      </label>
      <button onClick={() => deleteTask(task.id)}>
        <FontAwesomeIcon
          icon={faTrash}
          className="text-gray-500 hover:text-gray-700"
          title="Delete task"
        />
      </button>
    </li>
  );
}

function App() {
  const [tasks, setTasks] = useState([
    { id: nanoid(), name: "Eat", completed: false },
    { id: nanoid(), name: "Sleep", completed: false },
    { id: nanoid(), name: "Repeat", completed: false },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const addTask = (taskName) => {
    setTasks([...tasks, { id: nanoid(), name: taskName, completed: false }]);
    setIsModalOpen(false);
  };

  const toggleTaskCompletion = (taskId) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  return (
    <main className="m-4 max-w-md mx-auto">
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4 transition hover:bg-blue-600"
      >
        Add Task
      </button>

      <Modal
        headerLabel="Add New Task"
        isOpen={isModalOpen}
        onCloseRequested={() => setIsModalOpen(false)}
      >
        <AddTaskForm onNewTask={addTask} />
      </Modal>

      <section>
        <h1 className="text-xl font-bold mb-2">To do</h1>
        <ul className="bg-white shadow rounded">
          {tasks.map((task) => (
            <TodoItem
              key={task.id}
              task={task}
              toggleTaskCompletion={toggleTaskCompletion}
              deleteTask={deleteTask}
            />
          ))}
        </ul>

        {/* Pass addTask to GroceryPanel */}
        <GroceryPanel onAddTodo={addTask} />
      </section>
    </main>
  );
}

export default App;
