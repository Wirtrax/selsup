import { render, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach } from "vitest";
import { ParamEditor } from "./App";

describe("ParamEditor", () => {
  const mockParams = [
    { id: 1, name: "Назначение", type: "string" as const },
    { id: 2, name: "Длина", type: "string" as const },
    { id: 3, name: "Материал", type: "string" as const },
  ];

  const mockModel = {
    paramValues: [
      { paramId: 1, value: "повседневное" },
      { paramId: 2, value: "макси" },
    ],
    colors: [],
  };

  beforeEach(() => {
    render(<ParamEditor params={mockParams} model={mockModel} />);
  });

  describe("отображение полей по params", () => {
    it("должен отображать все переданные параметры", () => {
      mockParams.forEach((param) => {
        const field = screen.getByTestId(`param-field-${param.id}`);
        expect(field).toBeInTheDocument();

        const label = screen.getByTestId(`param-label-${param.id}`);
        expect(label).toHaveTextContent(param.name);

        const input = screen.getByTestId(`param-input-${param.id}`);
        expect(input).toBeInTheDocument();
      });
    });

    it("должен корректно отображать data-атрибуты", () => {
      mockParams.forEach((param) => {
        const field = screen.getByTestId(`param-field-${param.id}`);
        expect(field).toHaveAttribute("data-param-id", param.id.toString());

        const input = screen.getByTestId(`param-input-${param.id}`);
        expect(input).toHaveAttribute("data-param-type", param.type);
      });
    });
  });

  describe("корректная инициализация из model.paramValues", () => {
    it("должен устанавливать значения из model.paramValues", () => {
      const input1 = screen.getByTestId("param-input-1") as HTMLInputElement;
      expect(input1.value).toBe("повседневное");

      const input2 = screen.getByTestId("param-input-2") as HTMLInputElement;
      expect(input2.value).toBe("макси");
    });

    it("должен оставлять пустым поле, если значение отсутствует в model", () => {
      const input3 = screen.getByTestId("param-input-3") as HTMLInputElement;
      expect(input3.value).toBe("");
    });
  });

  describe("корректный результат getModel() после изменений", () => {
    it("должен возвращать исходную модель при отсутствии изменений", () => {
      const getModelButton = screen.getByTestId("get-model-button");
      fireEvent.click(getModelButton);

      const resultElement = screen.getByTestId("model-result");
      const model = JSON.parse(resultElement.textContent || "{}");

      expect(model.paramValues).toEqual([
        { paramId: 1, value: "повседневное" },
        { paramId: 2, value: "макси" },
        { paramId: 3, value: "" },
      ]);
      expect(model.colors).toEqual([]);
    });

    it("должен возвращать обновленную модель после изменения значений", async () => {
      const user = userEvent.setup();

      const input1 = screen.getByTestId("param-input-1");
      await user.clear(input1);
      await user.type(input1, "официальное");

      const input3 = screen.getByTestId("param-input-3");
      await user.type(input3, "хлопок");

      const getModelButton = screen.getByTestId("get-model-button");
      fireEvent.click(getModelButton);

      const resultElement = screen.getByTestId("model-result");
      const model = JSON.parse(resultElement.textContent || "{}");

      expect(model.paramValues).toEqual([
        { paramId: 1, value: "официальное" },
        { paramId: 2, value: "макси" },
        { paramId: 3, value: "хлопок" },
      ]);
    });

    it("должен отражать изменения в логе изменений", async () => {
      const user = userEvent.setup();

      expect(screen.getByTestId("no-changes-message")).toBeInTheDocument();

      const input1 = screen.getByTestId("param-input-1");
      await user.clear(input1);
      await user.type(input1, "официальное");

      expect(screen.getByTestId("changes-list")).toBeInTheDocument();

      const changeItem = screen.getByTestId("change-item-1");
      expect(within(changeItem).getByTestId("change-name-1")).toHaveTextContent(
        "Назначение",
      );
      expect(within(changeItem).getByTestId("old-value-1")).toHaveTextContent(
        "повседневное",
      );
      expect(within(changeItem).getByTestId("new-value-1")).toHaveTextContent(
        "официальное",
      );

      await user.clear(input1);
      await user.type(input1, "спортивное");

      expect(within(changeItem).getByTestId("new-value-1")).toHaveTextContent(
        "спортивное",
      );
    });

    it("должен корректно обрабатывать несколько изменений разных параметров", async () => {
      const user = userEvent.setup();

      const input1 = screen.getByTestId("param-input-1");
      await user.clear(input1);
      await user.type(input1, "официальное");

      const input2 = screen.getByTestId("param-input-2");
      await user.clear(input2);
      await user.type(input2, "мини");

      expect(screen.getByTestId("change-item-1")).toBeInTheDocument();
      expect(screen.getByTestId("change-item-2")).toBeInTheDocument();

      const getModelButton = screen.getByTestId("get-model-button");
      fireEvent.click(getModelButton);

      const resultElement = screen.getByTestId("model-result");
      const model = JSON.parse(resultElement.textContent || "{}");

      expect(model.paramValues).toEqual([
        { paramId: 1, value: "официальное" },
        { paramId: 2, value: "мини" },
        { paramId: 3, value: "" },
      ]);
    });
  });
});
