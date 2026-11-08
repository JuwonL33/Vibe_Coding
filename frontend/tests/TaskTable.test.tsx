import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import TaskTable from "../src/components/TaskTable";
import type { Task } from "../src/types/task";

describe("TaskTable component", () => {
  // 백엔드와 동일하게 id는 문자열(UUID), status는 "pending" | "in_progress" | "completed"
  const mockTasks: Task[] = [
    { id: "task-1", title: "Task 1", status: "pending", description: "Description 1" },
    { id: "task-2", title: "Task 2", status: "completed", description: "Description 2" },
  ];

  function renderTable(props: Partial<Parameters<typeof TaskTable>[0]> = {}) {
    return render(
      <TaskTable tasks={mockTasks} onStatusChange={vi.fn()} onDelete={vi.fn()} {...props} />,
    );
  }

  test("태스크 목록을 테이블로 렌더링한다", () => {
    renderTable();
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
    // 상태는 한국어 라벨로 표시한다.
    expect(screen.getByText("대기")).toBeInTheDocument();
    expect(screen.getByText("완료")).toBeInTheDocument();
  });

  test("각 행은 .task-item 이고, 상태 버튼과 삭제 버튼에 data-testid가 있다", () => {
    const { container } = renderTable();
    expect(container.querySelectorAll(".task-item")).toHaveLength(2);
    expect(screen.getByTestId("status-pending")).toHaveTextContent("대기");
    expect(screen.getByTestId("status-completed")).toHaveTextContent("완료");
    expect(screen.getAllByTestId("delete-button")).toHaveLength(2);
  });

  test("상태 변경 버튼을 누르면 현재 상태를 제외한 선택지가 메뉴로 열린다", () => {
    renderTable();
    fireEvent.click(screen.getAllByRole("button", { name: "상태 변경" })[0]);
    const items = screen.getAllByRole("menuitem").map((el) => el.textContent);
    expect(items).toEqual(["진행중", "완료"]);
  });

  test("메뉴에서 진행중을 고르면 onStatusChange(id, 'in_progress')가 호출되고 메뉴가 닫힌다", () => {
    const onStatusChange = vi.fn();
    renderTable({ onStatusChange });
    fireEvent.click(screen.getAllByRole("button", { name: "상태 변경" })[0]);
    fireEvent.click(screen.getByRole("menuitem", { name: "진행중" }));
    expect(onStatusChange).toHaveBeenCalledWith("task-1", "in_progress");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  test("완료된 태스크는 대기로 되돌릴 수 있다", () => {
    const onStatusChange = vi.fn();
    renderTable({ onStatusChange });
    fireEvent.click(screen.getAllByRole("button", { name: "상태 변경" })[1]);
    fireEvent.click(screen.getByRole("menuitem", { name: "대기" }));
    expect(onStatusChange).toHaveBeenCalledWith("task-2", "pending");
  });

  test("Escape를 누르면 상태 메뉴가 닫힌다", () => {
    renderTable();
    fireEvent.click(screen.getAllByRole("button", { name: "상태 변경" })[0]);
    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  test("삭제 버튼 클릭 시 onDelete 콜백이 호출된다", () => {
    const onDelete = vi.fn();
    renderTable({ onDelete });
    fireEvent.click(screen.getAllByRole("button", { name: "삭제" })[0]);
    expect(onDelete).toHaveBeenCalledWith("task-1");
  });

  test("태스크가 없으면 빈 상태 메시지를 보여준다", () => {
    renderTable({ tasks: [] });
    expect(screen.getByText("태스크가 없습니다.")).toBeInTheDocument();
  });
});
