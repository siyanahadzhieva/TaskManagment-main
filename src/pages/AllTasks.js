import React, { useEffect, useState } from "react";
import { getTasks } from "../services/taskService";
import { priorities, statuses } from "../options";
import BlockerIcon from "../assets/icons/blocker.svg";
import CriticalIcon from "../assets/icons/critical.svg";
import MajorIcon from "../assets/icons/major.svg";
import HighestIcon from "../assets/icons/highest.svg";
import HighIcon from "../assets/icons/high.svg";
import MediumIcon from "../assets/icons/medium.svg";
import LowIcon from "../assets/icons/low.svg";
import LowestIcon from "../assets/icons/lowest.svg";

const priorityIcons = {
  1: BlockerIcon,
  2: CriticalIcon,
  3: MajorIcon,
  4: HighestIcon,
  5: HighIcon,
  6: MediumIcon,
  7: LowIcon,
  8: LowestIcon,
};

const statusStyles = {
  "To Do":
    "bg-var(--status-to-do-bg-color) text-var(--status-to-do-text-color)",
  "In Progress":
    "bg-var(--status-in-progress-bg-color) text-var(--status-in-progress-text-color)",
  Done: "bg-var(--status-done-bg-color) text-var(--status-done-text-color)",
};

const AllTasks = ({ user }) => {
  const [tasks, setTasks] = useState([]);
  const [prioritySortOrder, setPrioritySortOrder] = useState("asc");
  const [statusSortOrder, setStatusSortOrder] = useState("asc");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const fetchedTasks = await getTasks(user.id);
        setTasks(fetchedTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, [user.id]);

  const handlePrioritySort = () => {
    const sortedTasks = [...tasks].sort((a, b) => {
      if (prioritySortOrder === "asc") {
        return a.priority_id - b.priority_id;
      } else {
        return b.priority_id - a.priority_id;
      }
    });
    setTasks(sortedTasks);
    setPrioritySortOrder(prioritySortOrder === "asc" ? "desc" : "asc");
  };

  const handleStatusSort = () => {
    const sortedTasks = [...tasks].sort((a, b) => {
      if (statusSortOrder === "asc") {
        return a.status_id - b.status_id;
      } else {
        return b.status_id - a.status_id;
      }
    });
    setTasks(sortedTasks);
    setStatusSortOrder(statusSortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div className="p-8 flex justify-start items-center">
      <div className="w-full max-w-5xl overflow-x-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">All Tasks</h1>
        <div className="overflow-hidden rounded-lg shadow-lg">
          <table className="min-w-full bg-var(--table-bg-color) border border-var(--table-border-color) rounded-lg shadow-md">
            <thead className="bg-var(--table-header-bg-color) text-var(--table-header-text-color) text-lg font-semibold uppercase">
              <tr className="border-b border-var(--table-border-color)">
                <th
                  className="py-4 px-6 text-left cursor-pointer flex items-center"
                  onClick={handlePrioritySort}
                >
                  <span className="mr-2">
                    {prioritySortOrder === "asc" ? "↑" : "↓"}
                  </span>
                  Priority
                </th>
                <th className="py-4 px-6 text-left w-1/3">Title</th>
                <th className="py-4 px-6 text-left">Description</th>
                <th
                  className="py-4 px-6 text-left cursor-pointer flex items-center w-1/4"
                  onClick={handleStatusSort}
                >
                  <span className="mr-2">
                    {statusSortOrder === "asc" ? "↑" : "↓"}
                  </span>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, index) => {
                const priority = priorities.find(
                  (p) => p.id === task.priority_id
                );
                const status = statuses.find((s) => s.id === task.status_id);

                return (
                  <tr
                    key={task.id}
                    className="border-b border-var(--table-border-color) bg-var(--table-bg-color) hover:bg-var(--table-row-hover-bg-color) transition-all"
                  >
                    <td className="py-3 px-6 text-center">
                      {priority ? (
                        <img
                          src={priorityIcons[priority.id]}
                          alt={priority.name}
                          className="w-5 h-5 mx-auto"
                          style={{ color: "var(--priority-icon-color)" }}
                        />
                      ) : (
                        "Unknown"
                      )}
                    </td>
                    <td className="py-3 px-6 w-1/3 text-base">{task.title}</td>
                    <td className="py-3 px-6 text-sm">
                      {task.description.length > 80
                        ? `${task.description.substring(0, 80)}...`
                        : task.description}
                    </td>
                    <td className="py-3 px-6 w-1/4 text-xs">
                      {status ? (
                        <span
                          className={`inline-block px-2 py-1 rounded-md text-xs font-semibold ${
                            statusStyles[status.name]
                          } uppercase tracking-wide`}
                          style={{ fontVariant: "small-caps" }}
                        >
                          {status.name}
                        </span>
                      ) : (
                        "Unknown"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllTasks;
