import type { ParamTemplateItem } from "../../lib/types/route";

interface ParamTemplateEditorProps {
  params: ParamTemplateItem[];
  onChange: (params: ParamTemplateItem[]) => void;
}

function createEmptyParam(): ParamTemplateItem {
  return {
    name: "",
    type: "number",
    required: false,
    defaultValue: undefined,
    unit: "",
    min: undefined,
    max: undefined,
    options: [],
  };
}

export default function ParamTemplateEditor({
  params,
  onChange,
}: ParamTemplateEditorProps) {
  const handleChange = (index: number, field: keyof ParamTemplateItem, value: any) => {
    const updated = params.map((p, i) =>
      i === index ? { ...p, [field]: value } : p,
    );
    onChange(updated);
  };

  const handleAdd = () => {
    onChange([...params, createEmptyParam()]);
  };

  const handleRemove = (index: number) => {
    if (params.length <= 1) return; // 至少保留 1 个
    onChange(params.filter((_, i) => i !== index));
  };

  return (
    <div className="param-template-editor">
      <div className="param-template-editor__header">
        <span className="param-template-editor__title">默认参数模板</span>
        <button
          className="param-template-editor__add-btn"
          onClick={handleAdd}
          title="新增参数"
        >
          + 新增
        </button>
      </div>

      {params.length === 0 ? (
        <div className="param-template-editor__empty">暂无参数，点击「+ 新增」添加</div>
      ) : (
        <div className="param-template-editor__table">
          <div className="param-template-editor__row param-template-editor__row--header">
            <span className="param-template-editor__cell param-template-editor__cell--name">参数名</span>
            <span className="param-template-editor__cell param-template-editor__cell--type">类型</span>
            <span className="param-template-editor__cell param-template-editor__cell--required">必填</span>
            <span className="param-template-editor__cell param-template-editor__cell--unit">单位</span>
            <span className="param-template-editor__cell param-template-editor__cell--range">范围</span>
            <span className="param-template-editor__cell param-template-editor__cell--action">操作</span>
          </div>
          {params.map((param, i) => (
            <div key={i} className="param-template-editor__row">
              <input
                className="param-template-editor__input param-template-editor__cell--name"
                value={param.name}
                onChange={(e) => handleChange(i, "name", e.target.value)}
                placeholder="参数名"
                maxLength={30}
              />
              <select
                className="param-template-editor__select param-template-editor__cell--type"
                value={param.type}
                onChange={(e) => handleChange(i, "type", e.target.value)}
              >
                <option value="text">文本</option>
                <option value="number">数字</option>
                <option value="select">选择</option>
                <option value="boolean">开关</option>
              </select>
              <label className="param-template-editor__checkbox param-template-editor__cell--required">
                <input
                  type="checkbox"
                  checked={param.required}
                  onChange={(e) => handleChange(i, "required", e.target.checked)}
                />
              </label>
              {param.type === "number" ? (
                <input
                  className="param-template-editor__input param-template-editor__cell--unit"
                  value={param.unit || ""}
                  onChange={(e) => handleChange(i, "unit", e.target.value)}
                  placeholder="如 kV"
                />
              ) : (
                <span className="param-template-editor__cell--unit">—</span>
              )}
              {param.type === "number" ? (
                <div className="param-template-editor__range param-template-editor__cell--range">
                  <input
                    className="param-template-editor__input param-template-editor__range-input"
                    type="number"
                    value={param.min ?? ""}
                    onChange={(e) =>
                      handleChange(i, "min", e.target.value ? Number(e.target.value) : undefined)
                    }
                    placeholder="最小值"
                  />
                  <span>~</span>
                  <input
                    className="param-template-editor__input param-template-editor__range-input"
                    type="number"
                    value={param.max ?? ""}
                    onChange={(e) =>
                      handleChange(i, "max", e.target.value ? Number(e.target.value) : undefined)
                    }
                    placeholder="最大值"
                  />
                </div>
              ) : (
                <span className="param-template-editor__cell--range">—</span>
              )}
              <button
                className="param-template-editor__remove-btn"
                onClick={() => handleRemove(i)}
                disabled={params.length <= 1}
                title="删除参数"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
