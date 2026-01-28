import React, { Component } from "react";

interface Param {
  id: number;
  name: string;
  type: "string";
}

interface ParamValue {
  paramId: number;
  value: string;
}

interface Color {
  id: number;
  name: string;
  code: string;
}

interface Model {
  paramValues: ParamValue[];
  colors: Color[];
}

interface Props {
  params: Param[];
  model: Model;
}

interface State {
  paramValues: Map<number, string>;
  changes: Array<{
    paramId: number;
    name: string;
    oldValue: string;
    newValue: string;
  }>;
}

export interface ParamEditorRef {
  getModel: () => Model;
}

class ParamEditor extends Component<Props, State> {
  public getModel(): Model {
    const paramValues: ParamValue[] = [];

    this.state.paramValues.forEach((value, paramId) => {
      paramValues.push({ paramId, value });
    });

    return {
      paramValues,
      colors: this.props.model.colors,
    };
  }

  constructor(props: Props) {
    super(props);

    const paramValuesMap = new Map<number, string>();

    props.params.forEach((param) => {
      const existingValue = props.model.paramValues.find(
        (pv) => pv.paramId === param.id,
      );
      const value = existingValue ? existingValue.value : "";
      paramValuesMap.set(param.id, value);
    });

    this.state = {
      paramValues: paramValuesMap,
      changes: [],
    };
  }

  handleParamChange = (paramId: number, name: string, value: string) => {
    const oldValue = this.state.paramValues.get(paramId) || "";

    this.setState((prevState) => {
      const newParamValues = new Map(prevState.paramValues);
      newParamValues.set(paramId, value);

      const newChange = {
        paramId,
        name,
        oldValue,
        newValue: value,
      };

      const existingChangeIndex = prevState.changes.findIndex(
        (c) => c.paramId === paramId,
      );
      const updatedChanges = [...prevState.changes];

      if (existingChangeIndex >= 0) {
        updatedChanges[existingChangeIndex] = {
          ...updatedChanges[existingChangeIndex],
          newValue: value,
        };
      } else {
        updatedChanges.push(newChange);
      }

      return {
        paramValues: newParamValues,
        changes: updatedChanges,
      };
    });
  };

  render() {
    const { params } = this.props;
    const { paramValues, changes } = this.state;

    return (
      <div data-testid="param-editor">
        {params.map((param) => (
          <div
            key={param.id}
            style={{ marginBottom: "10px" }}
            data-testid={`param-field-${param.id}`}
            data-param-id={param.id}
          >
            <label
              style={{ display: "inline-block", width: "150px" }}
              data-testid={`param-label-${param.id}`}
            >
              {param.name}:
            </label>
            <input
              type="text"
              value={paramValues.get(param.id) || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                this.handleParamChange(param.id, param.name, e.target.value)
              }
              style={{ padding: "5px", width: "200px" }}
              data-testid={`param-input-${param.id}`}
              data-param-type={param.type}
              aria-label={`Поле ввода для параметра "${param.name}"`}
            />
          </div>
        ))}

        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            border: "1px solid #ccc",
          }}
          data-testid="changes-log"
        >
          <h4>Изменения:</h4>
          {changes.length === 0 ? (
            <p data-testid="no-changes-message">Пока нет изменений</p>
          ) : (
            <ul
              style={{ listStyle: "none", padding: 0 }}
              data-testid="changes-list"
            >
              {changes.map((change, index) => (
                <li
                  key={index}
                  style={{ padding: "5px 0", borderBottom: "1px solid #eee" }}
                  data-testid={`change-item-${change.paramId}`}
                  data-change-index={index}
                >
                  <strong data-testid={`change-name-${change.paramId}`}>
                    {change.name}
                  </strong>
                  :
                  <span
                    style={{ color: "red" }}
                    data-testid={`old-value-${change.paramId}`}
                  >
                    {change.oldValue}
                  </span>{" "}
                  ---
                  <span
                    style={{ color: "green" }}
                    data-testid={`new-value-${change.paramId}`}
                  >
                    {change.newValue}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ marginTop: "20px" }}>
          <button
            onClick={() => {
              const model = this.getModel();
              console.log("Текущая модель:", model);
              alert("Модель получена! Проверьте консоль.");
            }}
            style={{
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
            data-testid="get-model-button"
          >
            Получить модель (getModel)
          </button>

          <div
            data-testid="model-result"
            style={{ display: "none" }}
            aria-hidden="true"
          >
            {JSON.stringify(this.getModel())}
          </div>
        </div>
      </div>
    );
  }
}

const App: React.FC = () => {
  const params: Param[] = [
    { id: 1, name: "Назначение", type: "string" },
    { id: 2, name: "Длина", type: "string" },
    { id: 3, name: "Материал", type: "string" },
  ];

  const model: Model = {
    paramValues: [
      { paramId: 1, value: "повседневное" },
      { paramId: 2, value: "макси" },
    ],
    colors: [],
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <ParamEditor params={params} model={model} />

      <div style={{ marginTop: "30px", fontSize: "14px", color: "#666" }}>
        <h4>Исходные данные:</h4>
        <p>
          <strong>Params:</strong>{" "}
          {JSON.stringify(params.map((p) => ({ id: p.id, name: p.name })))}
        </p>
        <p>
          <strong>Model:</strong> {JSON.stringify(model)}
        </p>
      </div>
    </div>
  );
};

export { ParamEditor };
export default App;
