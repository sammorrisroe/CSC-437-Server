import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

function AddTaskForm({ addTask }) {
  const [taskName, setTaskName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (taskName.trim()) {
      addTask(taskName);
      setTaskName("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2 mb-4">
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

function TodoItem({ task, deleteTask }) {
  return (
    <li className="flex items-center justify-between p-2 border-b border-gray-200">
      <label className="flex items-center space-x-2">
        <input type="checkbox" className="accent-blue-500" />
        <span>{task}</span>
      </label>
      <button onClick={() => deleteTask(task)}>
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
  const [tasks, setTasks] = useState(["Eat", "Sleep", "Repeat"]);

  const addTask = (task) => {
    setTasks([...tasks, task]);
  };

  const deleteTask = (taskToRemove) => {
    setTasks(tasks.filter((task) => task !== taskToRemove));
  };

  return (
    <main className="m-4 max-w-md mx-auto">
      <AddTaskForm addTask={addTask} />
      <section>
        <h1 className="text-xl font-bold mb-2">To do</h1>
        <ul className="bg-white shadow rounded">
          {tasks.map((task) => (
            <TodoItem key={task} task={task} deleteTask={deleteTask} />
          ))}
        </ul>
      </section>
    </main>
  );
}

export default App;
