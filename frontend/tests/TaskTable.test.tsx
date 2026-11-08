import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import TaskTable from "../src/components/TaskTable";
import type { Task } from "../src/types/task";

describe("TaskTable component", () => {
  // 백엔드와 동일하게 id는 문자열(UUID), status는 "pending" | "completed"
  const mockTasks: Task[] = [
    {
      id: "task-1",
      title: "Task 1",
      status: "pending",
      description: "Description 1",
    },
    {
      id: "task-2",
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
    expect(mockOnStatusChange).toHaveBeenCalledWith("task-1", "completed");
  });

  test("완료된 태스크의 상태 변경 클릭 시 pending으로 되돌린다", () => {
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
    fireEvent.click(screen.getAllByRole("button", { name: "상태 변경" })[1]);
    // Assert
    expect(mockOnStatusChange).toHaveBeenCalledWith("task-2", "pending");
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
    expect(mockOnDelete).toHaveBeenCalledWith("task-1");
  });

  test("태스크가 없으면 빈 상태 메시지를 보여준다", () => {
    render(<TaskTable tasks={[]} onStatusChange={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText("태스크가 없습니다.")).toBeInTheDocument();
  });
});
