import { useState } from "react";
import type { InspectionItem } from "../../lib/types/route";

interface InspectionParamFormProps {
  items: InspectionItem[];
  onChange: (items: InspectionItem[]) => void;
  readonly?: boolean;
}

function createEmptyItem(): InspectionItem {
  return {
    id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: "",
    standardValue: undefined,
    unit: "",
    deviationType: "none",
    deviationValue: undefined,
  };
}

export default function InspectionParamForm({
  items,
  onChange,
  readonly = false,
}: InspectionParamFormProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAdd = () => {
    if (items.length >= 10) return;
    onChange([...items, createEmptyItem()]);
    setEditingIndex(items.length);
  };

  const handleRemove = (index: number) => {
    if (items.length <= 1) return;
    const updated = items.filter((_, i) => i !== index);
    onChange(updated);
    setEditingIndex(null);
  };

  const handleItemChange = (index: number, field: keyof InspectionItem, value: any) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    );
    onChange(updated);
  };

  if (readonly) {
    return (
      <div className="inspection-param-form">
        <div className="inspection-param-form__title">检测项目</div>
        {items.length === 0 ? (
          <p className="inspection-param-form__empty">未配置检测项目</p>
        ) : (
          <ul className="inspection-param-form__list">
            {items.map((item, i) => (
              <li key={item.id || i} className="inspection-param-form__item">
                <span className="inspection-param-form__item-name">{item.name}</span>
                {item.standardValue != null && (
                  <span className="inspection-param-form__item-standard">
                    {item.standardValue}
                    {item.unit || ""}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="inspection-param-form">
      <div className="inspection-param-form__header">
        <span className="inspection-param-form__title">检测项目</span>
        <button
          className="inspection-param-form__add-btn"
          onClick={handleAdd}
          disabled={items.length >= 10}
          title={items.length >= 10 ? "最多 10 个检测项目" : "添加检测项目"}
        >
          + 添加检测项目
        </button>
      </div>

      {items.length === 0 ? (
        <p className="inspection-param-form__empty">请添加至少一个检测项目</p>
      ) : (
        <div className="inspection-param-form__list">
          {items.map((item, i) => (
            <div key={item.id || i} className="inspection-param-form__item-card">
              <div className="inspection-param-form__item-row">
                <span className="inspection-param-form__item-index">#{i + 1}</span>
                <input
                  className="inspection-param-form__input inspection-param-form__input--name"
                  value={item.name}
                  onChange={(e) => handleItemChange(i, "name", e.target.value)}
                  placeholder="检测项目名称"
                  maxLength={20}
                />
                <button
                  className="inspection-param-form__remove-btn"
                  onClick={() => handleRemove(i)}
                  disabled={items.length <= 1}
                  title="删除"
                >
                  🗑️
                </button>
              </div>
              <div className="inspection-param-form__item-row">
                <input
                  className="inspection-param-form__input inspection-param-form__input--value"
                  type="number"
                  value={item.standardValue ?? ""}
                  onChange={(e) =>
                    handleItemChange(
                      i,
                      "standardValue",
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                  placeholder="标准值"
                />
                <input
                  className="inspection-param-form__input inspection-param-form__input--unit"
                  value={item.unit || ""}
                  onChange={(e) => handleItemChange(i, "unit", e.target.value)}
                  placeholder="单位"
                  maxLength={10}
                />
                <select
                  className="inspection-param-form__select"
                  value={item.deviationType || "none"}
                  onChange={(e) =>
                    handleItemChange(i, "deviationType", e.target.value)
                  }
                >
                  <option value="none">无偏差</option>
                  <option value="percent">百分比</option>
                  <option value="absolute">绝对值</option>
                </select>
                {item.deviationType && item.deviationType !== "none" && (
                  <input
                    className="inspection-param-form__input inspection-param-form__input--deviation"
                    type="number"
                    value={item.deviationValue ?? ""}
                    onChange={(e) =>
                      handleItemChange(
                        i,
                        "deviationValue",
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                    placeholder={item.deviationType === "percent" ? "±%" : "±"}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length >= 10 && (
        <p className="inspection-param-form__limit">已达到最大检测项目数量（10 个）</p>
      )}
    </div>
  );
}
