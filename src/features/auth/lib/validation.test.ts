import { describe, expect, it } from "vitest";

import { loginSchema, registerSchema } from "./validation";

describe("loginSchema", () => {
  it("принимает валидные email и пароль", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "password1",
    });
    expect(result.success).toBe(true);
  });

  it("отклоняет некорректный email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "password1",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "email")).toBe(true);
    }
  });

  it("отклоняет пустой email", () => {
    expect(loginSchema.safeParse({ email: "", password: "password1" }).success).toBe(false);
  });

  it("отклоняет короткий пароль (< 8)", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "password")).toBe(true);
    }
  });
});

describe("registerSchema", () => {
  const valid = {
    email: "user@example.com",
    password: "Password1",
    confirmPassword: "Password1",
    full_name: "Иван Иванов",
  };

  it("принимает валидную регистрацию", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("full_name необязателен", () => {
    const { full_name: _full, ...rest } = valid;
    void _full;
    expect(registerSchema.safeParse(rest).success).toBe(true);
  });

  it("требует заглавную букву в пароле", () => {
    const result = registerSchema.safeParse({
      ...valid,
      password: "password1",
      confirmPassword: "password1",
    });
    expect(result.success).toBe(false);
  });

  it("требует строчную букву в пароле", () => {
    const result = registerSchema.safeParse({
      ...valid,
      password: "PASSWORD1",
      confirmPassword: "PASSWORD1",
    });
    expect(result.success).toBe(false);
  });

  it("требует цифру в пароле", () => {
    const result = registerSchema.safeParse({
      ...valid,
      password: "Password",
      confirmPassword: "Password",
    });
    expect(result.success).toBe(false);
  });

  it("отклоняет несовпадающие пароли с ошибкой на confirmPassword", () => {
    const result = registerSchema.safeParse({
      ...valid,
      confirmPassword: "Different1",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "confirmPassword")).toBe(true);
    }
  });

  it("отклоняет слишком длинное имя (> 255)", () => {
    const result = registerSchema.safeParse({
      ...valid,
      full_name: "x".repeat(256),
    });
    expect(result.success).toBe(false);
  });

  it("отклоняет некорректный email при регистрации", () => {
    expect(registerSchema.safeParse({ ...valid, email: "bad" }).success).toBe(false);
  });
});
