import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import Login from "../src/components/Login";

describe("Login component", () => {
  test("이메일과 비밀번호 입력 필드를 렌더링한다.", () => {
    // Arrange
    render(<Login onLogin={vi.fn()} />);
    // Act(없음))
    // Assert
    expect(screen.getByLabelText("이메일")).toBeInTheDocument();
    expect(screen.getByLabelText("비밀번호")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "로그인" })).toBeInTheDocument();
  });
  test("폼 제출 시 onLogin 콜백이 호출된다.", () => {
    // Arrange
    const mockOnLogin = vi.fn();
    render(<Login onLogin={mockOnLogin} />);
    // Act
    fireEvent.change(screen.getByLabelText("이메일"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("비밀번호"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "로그인" }));

    // Assert
    expect(mockOnLogin).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
  });
});
