import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export const SortableItem = ({ id, children, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition ? `${transition}, transform 0.3s ease` : undefined, // Adjust transition duration and easing
    zIndex: isDragging ? 1000 : "auto",
    boxShadow: isDragging ? "0 5px 15px rgba(0,0,0,0.3)" : "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick} // Ensure onClick is handled here
    >
      {children}
    </div>
  );
};
