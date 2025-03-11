import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTaskById, updateTask, deleteTask } from "../services/taskService";
import { priorities, statuses } from "../options"; // Import options

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [statusId, setStatusId] = useState(""); // Use status_id
  const [priorityId, setPriorityId] = useState(""); // Use priority_id

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const taskData = await getTaskById(id); // Fetch task by ID
        setTask(taskData);
        setTitle(taskData.title);
        setDescription(taskData.description);
        setStatusId(taskData.status_id); // Set initial status_id
        setPriorityId(taskData.priority_id); // Set initial priority_id
      } catch (error) {
        console.error("Error fetching task:", error);
      }
    };
    fetchTask();
  }, [id]);

  const handleUpdate = async () => {
    const updatedTask = {
      title,
      description,
      status_id: statusId,
      priority_id: priorityId,
    };

    await updateTask(id, updatedTask, setTask);
    navigate("/");
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(task.id);
        navigate("/"); // Redirect to the task list after deletion
      } catch (error) {
        console.error("Failed to delete task:", error);
      }
    }
  };

  if (!task) return <p>Loading...</p>;

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-md shadow-md">
      <h2 className="text-2xl font-bold mb-4">Edit Task</h2>
      <input
        type="text"
        className="w-full p-2 border rounded mb-2"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="w-full p-2 border rounded mb-2"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      {/* Status dropdown */}
      <select
        className="w-full p-2 border rounded mb-4"
        value={statusId}
        onChange={(e) => setStatusId(e.target.value)}
      >
        {statuses.map((status) => (
        <option key={status.id} value={status.id}>
            {status.name}
</option>
))}
      </select>
      {/* Priority dropdown */}
      <select
        className="w-full p-2 border rounded mb-4"
        value={priorityId}
        onChange={(e) => setPriorityId(e.target.value)}
      >
        {priorities.map((priority) => (
          <option key={priority.id} value={priority.id}>
            {priority.name}
          </option>
        ))}
      </select>
      <button
        onClick={handleUpdate}
        className="bg-blue-500 text-white p-2 rounded mr-2"
      >
        Update Task
      </button>
      <button
        onClick={handleDelete}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Delete Task
      </button>
    </div>
  );
};

export default TaskDetails;
