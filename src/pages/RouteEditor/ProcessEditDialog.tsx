import { useState, useEffect } from "react";
import type { ProcessLibraryItem } from "../../lib/types/route";
import type {
  CreateCustomProcessData,
  UpdateCustomProcessData,
  ParamTemplateItem,
} from "../../lib/types/route";
import ParamTemplateEditor from "../../components/ui/ParamTemplateEditor";
import { getNextCustomCode } from "../../lib/utils/processCode";

interface ProcessEditDialogProps {
  open: boolean;
  /** 编辑模式传入已有工序，新增模式传入 null */
  process?: ProcessLibraryItem | null;
  /** 已有自定义工序编码列表（用于自动生成新编码） */
  existingCodes?: string[];
  onSave: (data: CreateCustomProcessData | UpdateCustomProcessData) => void;
  onCancel: () => void;
  saving?: boolean;
}

function parseDefaultParams(raw: string | null | undefined): ParamTemplateItem[] {
  if (!raw) return [{ name: "", type: "number", required: false }];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [{ name: "", type: "number", required: false }];
  } catch {
    return [{ name: "", type: "number", required: false }];
  }
}

export default function ProcessEditDialog({
  open,
  process,
  existingCodes = [],
  onSave,
  onCancel,
  saving = false,
}: ProcessEditDialogProps) {
  const isEdit = !!process;
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [responsibleRole, setResponsibleRole] = useState("");
  const [description, setDescription] = useState("");
  const [params, setParams] = useState<ParamTemplateItem[]>([
    { name: "", type: "number", required: false },
  ]);
  const [dirty, setDirty] = useState(false);
  const [showDirtyConfirm, setShowDirtyConfirm] = useState(false);

  useEffect(() => {
    if (open) {
      if (process) {
        // 编辑模式
        setName(process.name || "");
        setCode(process.code || "");
        setResponsibleRole(process.responsibleRole || "");
        setDescription(process.description || "");
        setParams(parseDefaultParams(process.defaultParams));
      } else {
        // 新增模式
        setName("");
        setCode(getNextCustomCode(existingCodes));
        setResponsibleRole("");
        setDescription("");
        setParams([{ name: "", type: "number", required: false }]);
      }
      setDirty(false);
      setShowDirtyConfirm(false);
    }
  }, [open, process, existingCodes]);

  const handleSave = () => {
    if (!name.trim()) return;
    if (isEdit && process) {
      const data: UpdateCustomProcessData = {
        id: process.id,
        name: name.trim(),
        code,
        responsibleRole,
        description,
        defaultParams: params,
      };
      onSave(data);
    } else {
      const data: CreateCustomProcessData = {
        name: name.trim(),
        code,
        category: "custom",
        responsibleRole,
        description,
        defaultParams: params,
      };
      onSave(data);
    }
  };

  const handleCancel = () => {
    if (dirty) {
      setShowDirtyConfirm(true);
    } else {
      onCancel();
    }
  };

  const handleDirtyConfirm = () => {
    setShowDirtyConfirm(false);
    onCancel();
  };

  if (!open) return null;

  const isValid = name.trim().length > 0;

  return (
    <div className="dialog-overlay" onClick={handleCancel}>
      <div
        className="dialog process-edit-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="dialog__title">
          {isEdit ? "编辑自定义工序" : "新增自定义工序"}
        </h3>
        <div className="dialog__body">
          <div className="process-edit-dialog__form">
            {/* 工序名称 */}
            <div className="process-edit-dialog__field">
              <label className="process-edit-dialog__label">
                工序名称 <span className="dialog__required">*</span>
              </label>
              <input
                className="process-edit-dialog__input"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setDirty(true);
                }}
                placeholder="请输入工序名称"
                maxLength={30}
                autoFocus
              />
            </div>

            {/* 工序编码 */}
            <div className="process-edit-dialog__field">
              <label className="process-edit-dialog__label">工序编码</label>
              <input
                className="process-edit-dialog__input process-edit-dialog__input--code"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setDirty(true);
                }}
                placeholder="C001（自动生成）"
                maxLength={4}
              />
              <span className="process-edit-dialog__hint">格式：C + 3位数字</span>
            </div>

            {/* 责任人角色 */}
            <div className="process-edit-dialog__field">
              <label className="process-edit-dialog__label">责任人角色</label>
              <input
                className="process-edit-dialog__input"
                value={responsibleRole}
                onChange={(e) => {
                  setResponsibleRole(e.target.value);
                  setDirty(true);
                }}
                placeholder="如：烘干工"
                maxLength={20}
              />
            </div>

            {/* 工序描述 */}
            <div className="process-edit-dialog__field">
              <label className="process-edit-dialog__label">工序描述</label>
              <textarea
                className="process-edit-dialog__textarea"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setDirty(true);
                }}
                placeholder="对工序进行简要说明..."
                rows={2}
                maxLength={200}
              />
            </div>

            {/* 参数模板 */}
            <div className="process-edit-dialog__field">
              <ParamTemplateEditor
                params={params}
                onChange={(newParams) => {
                  setParams(newParams);
                  setDirty(true);
                }}
              />
            </div>
          </div>
        </div>
        <div className="dialog__footer">
          <button
            className="dialog__btn dialog__btn--cancel"
            onClick={handleCancel}
            disabled={saving}
          >
            取消
          </button>
          <button
            className="dialog__btn dialog__btn--confirm"
            onClick={handleSave}
            disabled={!isValid || saving}
          >
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      </div>
    </div>

      {/* 未保存确认弹窗 */}
      {showDirtyConfirm && (
        <div
          className="dialog-overlay"
          onClick={() => setShowDirtyConfirm(false)}
        >
          <div
            className="dialog"
            onClick={(e) => e.stopPropagation()}
            style={{ width: 380 }}
          >
            <h3 className="dialog__title">未保存的更改</h3>
            <div className="dialog__body">
              <p>有未保存的更改，是否放弃？</p>
            </div>
            <div className="dialog__footer">
              <button
                className="dialog__btn dialog__btn--cancel"
                onClick={() => setShowDirtyConfirm(false)}
              >
                继续编辑
              </button>
              <button
                className="dialog__btn dialog__btn--warning"
                onClick={handleDirtyConfirm}
              >
                放弃更改
              </button>
            </div>
          </div>
        </div>
      )}
  );
}
