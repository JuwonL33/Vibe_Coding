import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import TaskTable from "../src/components/TaskTable";

describe("TaskTable component", () => {
  const mockTasks = [
    { id: 1, title: "Task 1", status: "pending", description: "Description 1" },
    {
      id: 2,
      title: "Task 2",
      status: "completed",
      description: "Description 2",
    },
  ];
  test("태스크 목록을 테이블로 렌더링한다", () => {
    // Arrange
    render(
      <TaskTable
        tasks={mockTasks}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    // Act(없음)
    // Assert
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
    expect(screen.getByText("pending")).toBeInTheDocument();
    expect(screen.getByText("completed")).toBeInTheDocument();
  });

  test("상태 변경 클릭 시 onStatusChange 콜백이 호출된다", () => {
    // Arrange
    const mockOnStatusChange = vi.fn();
    render(
      <TaskTable
        tasks={mockTasks}
        onStatusChange={mockOnStatusChange}
        onDelete={vi.fn()}
      />,
    );
    // Act
    const statusButton = screen.getAllByRole("button", {
      name: "상태 변경",
    })[0];
    fireEvent.click(statusButton);

    // Assert
    expect(mockOnStatusChange).toHaveBeenCalledWith(1, "in_progress");
  });
  test("삭제 버튼 클릭 시 onDelete 콜백이 호출된다", () => {
    // Arrange
    const mockOnDelete = vi.fn();
    render(
      <TaskTable
        tasks={mockTasks}
        onStatusChange={vi.fn()}
        onDelete={mockOnDelete}
      />,
    );

    // Act
    const deleteButton = screen.getAllByRole("button", { name: "삭제" })[0];
    fireEvent.click(deleteButton);

    // Assert
    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });
});
