import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import TaskForm from "../src/components/TaskForm";

describe("TaskForm component", () => {
  test("제목(input taskTitle)과 설명(textarea taskDescription) 필드를 렌더링한다", () => {
    render(<TaskForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    const title = screen.getByLabelText("제목");
    const description = screen.getByLabelText("설명");
    expect(title.tagName).toBe("INPUT");
    expect(title).toHaveAttribute("name", "taskTitle");
    expect(description.tagName).toBe("TEXTAREA");
    expect(description).toHaveAttribute("name", "taskDescription");
  });

  test("제출하면 앞뒤 공백을 지운 제목과 설명을 전달한다", () => {
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("제목"), { target: { value: "  장보기 " } });
    fireEvent.change(screen.getByLabelText("설명"), { target: { value: "우유, 계란" } });
    fireEvent.click(screen.getByRole("button", { name: "추가" }));
    expect(onSubmit).toHaveBeenCalledWith({ title: "장보기", description: "우유, 계란" });
  });

  test("설명이 비어 있으면 description 없이 전달한다", () => {
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("제목"), { target: { value: "운동" } });
    fireEvent.click(screen.getByRole("button", { name: "추가" }));
    expect(onSubmit).toHaveBeenCalledWith({ title: "운동" });
  });

  test("제목이 없으면 에러를 보여주고 제출하지 않는다", () => {
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "추가" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByLabelText("제목")).toHaveAccessibleDescription("제목을 입력해 주세요.");
  });

  test("설명 textarea도 에러 표시 방식이 같다(label 연결)", () => {
    render(<TaskForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    const label = screen.getByText("설명");
    expect(label).toHaveAttribute("for", screen.getByLabelText("설명").id);
  });

  test("취소를 누르면 onCancel이 호출된다", () => {
    const onCancel = vi.fn();
    render(<TaskForm onSubmit={vi.fn()} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole("button", { name: "취소" }));
    expect(onCancel).toHaveBeenCalled();
  });
});
