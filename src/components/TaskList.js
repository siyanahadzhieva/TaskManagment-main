import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getTasks, updateTask } from "../services/taskService";
import { priorities, statuses } from "../options";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem";
import "./TaskList.css";

import BlockerIcon from "../assets/icons/blocker.svg";
import CriticalIcon from "../assets/icons/critical.svg";
import MajorIcon from "../assets/icons/major.svg";
import HighestIcon from "../assets/icons/highest.svg";
import HighIcon from "../assets/icons/high.svg";
import MediumIcon from "../assets/icons/medium.svg";
import LowIcon from "../assets/icons/low.svg";
import LowestIcon from "../assets/icons/lowest.svg";

const statusStyles = {
  "To Do": "bg-blue-300",
  "In Progress": "bg-blue-300",
  Done: "bg-blue-300",
};

const TaskList = ({ addTask, user }) => {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState(7);
  const [activeTask, setActiveTask] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);

  const fetchTasks = async () => {
    try {
      const fetchedTasks = await getTasks(user.id);
      setTasks(fetchedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []); // Dependency array ensures it runs only once on mount

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask = {
      title: newTitle,
      description: newDescription,
      priority_id: newPriority,
      status_id: 1,
    };

    await addTask({ ...newTask, user_id: user.id });
    fetchTasks();
    setNewTitle("");
    setNewDescription("");
    setNewPriority(7); // Default to "Medium"
    setIsModalOpen(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editTask.title.trim()) return;

    await updateTask(editTask.id, editTask);
    fetchTasks(); // Reload tasks from DB
    setIsEditModalOpen(false);
    setEditTask(null);
  };

  const openEditModal = (task) => {
    setEditTask(task);
    setIsEditModalOpen(true);
  };

  const priorityIcons = {
    1: <img src={BlockerIcon} alt="Blocker" className="w-5 h-5" />,
    2: <img src={CriticalIcon} alt="Critical" className="w-5 h-5" />,
    3: <img src={MajorIcon} alt="Major" className="w-5 h-5" />,
    4: <img src={HighestIcon} alt="Highest" className="w-5 h-5" />,
    5: <img src={HighIcon} alt="High" className="w-5 h-5" />,
    6: <img src={MediumIcon} alt="Medium" className="w-5 h-5" />,
    7: <img src={LowIcon} alt="Low" className="w-5 h-5" />,
    8: <img src={LowestIcon} alt="Lowest" className="w-5 h-5" />,
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    const activeTask = tasks.find((task) => task.id === active.id);
    setActiveTask(activeTask);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;

    if (!over) {
      return;
    }

    if (active.id !== over.id) {
      const activeTask = tasks.find((task) => task.id === active.id);
      const overTask = tasks.find((task) => task.id === over.id);

      if (activeTask.status_id !== overTask.status_id) {
        // Update the status_id of the active task temporarily
        setTasks((items) =>
          items.map((task) =>
            task.id === active.id
              ? { ...task, status_id: overTask.status_id }
              : task
          )
        );
      }

      setTasks((items) => {
        const oldIndex = items.findIndex((task) => task.id === active.id);
        const newIndex = items.findIndex((task) => task.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) {
      return;
    }

    if (active.id !== over.id) {
      const activeTask = tasks.find((task) => task.id === active.id);
      const overTask = tasks.find((task) => task.id === over.id);

      // Update the status_id of the active task
      const updatedTask = {
        ...activeTask,
        status_id: overTask.status_id,
      };

      // Update the task in the database
      await updateTask(active.id, updatedTask);
      fetchTasks();

      // Update the tasks state
      setTasks((items) => {
        const oldIndex = items.findIndex((task) => task.id === active.id);
        const newIndex = items.findIndex((task) => task.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="relative">
      {/* Add Task Button */}
      <div className="mt-10 mb-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#89cff0] text-white text-2xl px-2 rounded shadow-lg hover:bg-blue-500 transition"
        >
          +
        </button>
      </div>

      {/* Task Columns */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="status-columns-container">
          {statuses.map((status) => (
            <div
              key={status.id}
              className={`status-column bg-opacity-[3%] backdrop-filter backdrop-blur-lg p-4 rounded-lg shadow-md ${
                statusStyles[status.name]
              }`}
            >
              <h2 className="text-sm mb-2 text-stone-400 mb-5">
                {status.name}
              </h2>
              <SortableContext
                items={tasks.filter((task) => task.status_id === status.id)}
                strategy={verticalListSortingStrategy}
              >
                {tasks
                  .filter((task) => task.status_id === status.id)
                  .map((task) => (
                    <SortableItem
                      key={task.id}
                      id={task.id}
                      className="sortable-item"
                      onClick={() => openEditModal(task)}
                    >
                      <div
                        className="p-4 rounded shadow mb-2 border-l-4 cursor-pointer hover:bg-gray-100 transition relative"
                        style={{
                          backgroundColor: "var(--task-bg-color)",
                          color: "var(--task-title-color)",
                          borderColor: "var(--task-border-color)", // Use the new CSS variable for the border color
                        }}
                      >
                        <div className="absolute top-2 right-3">
                          {priorityIcons[task.priority_id]}
                        </div>
                        <h3 className="text-[17px] font-semibold">
                          {task.title}
                        </h3>
                        <p
                          className="text-sm"
                          style={{ color: "var(--task-description-color)" }}
                        >
                          {task.description.length > 140
                            ? `${task.description.substring(0, 140)}...`
                            : task.description}
                        </p>
                      </div>
                    </SortableItem>
                  ))}
                {tasks.filter((task) => task.status_id === status.id).length ===
                  0 && (
                  <div className="sortable-placeholder">
                    {/* Placeholder for empty column */}
                  </div>
                )}
              </SortableContext>
            </div>
          ))}
        </div>
        <DragOverlay>
          {activeTask ? (
            <div
              className="p-4 rounded shadow mb-2 border-l-4 cursor-pointer hover:bg-gray-100 transition relative"
              style={{
                backgroundColor: "var(--task-bg-color)",
                color: "var(--task-title-color)",
                borderColor: "var(--task-border-color)", // Use the new CSS variable for the border color
              }}
            >
              <div className="absolute top-2 right-3">
                {priorityIcons[activeTask.priority_id]}
              </div>
              <h3 className="text-base font-semibold">{activeTask.title}</h3>
              <p
                className="text-gray-600"
                style={{ color: "var(--task-description-color)" }}
              >
                {activeTask.description.length > 140
                  ? `${activeTask.description.substring(0, 140)}...`
                  : activeTask.description}
              </p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Task Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-lg w-[800px] flex">
            <div className="w-2/3 pr-4">
              <h2 className="text-xl font-semibold mb-4">Create New Task</h2>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Task title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="border p-2 w-full mb-2 rounded"
                />
                <textarea
                  placeholder="Task description"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="border p-2 w-full mb-2 rounded"
                  rows="6"
                />
              </form>
            </div>
            <div className="w-1/3 pl-4">
              <h2 className="text-xl font-semibold mb-4">Priority</h2>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="border p-2 w-full mb-2 rounded"
              >
                {priorities.map((priority) => (
                  <option key={priority.id} value={priority.id}>
                    {priority.name}
                  </option>
                ))}
              </select>
              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-700"
                  onClick={handleSubmit}
                >
                  Add Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Edit Modal */}
      {isEditModalOpen && editTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Edit Task</h2>
            <form onSubmit={handleEditSubmit}>
              <input
                type="text"
                placeholder="Task title"
                value={editTask.title}
                onChange={(e) =>
                  setEditTask({ ...editTask, title: e.target.value })
                }
                className="border p-2 w-full mb-2 rounded"
              />
              <input
                type="text"
                placeholder="Task description"
                value={editTask.description}
                onChange={(e) =>
                  setEditTask({ ...editTask, description: e.target.value })
                }
                className="border p-2 w-full mb-2 rounded"
              />
              <select
                value={editTask.priority_id}
                onChange={(e) =>
                  setEditTask({ ...editTask, priority_id: e.target.value })
                }
                className="border p-2 w-full mb-2 rounded"
              >
                {priorities.map((priority) => (
                  <option key={priority.id} value={priority.id}>
                    {priority.name}
                  </option>
                ))}
              </select>
              <select
                value={editTask.status_id}
                onChange={(e) =>
                  setEditTask({ ...editTask, status_id: e.target.value })
                }
                className="border p-2 w-full mb-2 rounded"
              >
                {statuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Update Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
