interface SaveConfirmDialogProps {
  open: boolean;
  routeName: string;
  currentVersion: string;
  nextVersion: string;
  description: string;
  onDescriptionChange: (desc: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  saving?: boolean;
}

export default function SaveConfirmDialog({
  open,
  routeName,
  currentVersion,
  nextVersion,
  description,
  onDescriptionChange,
  onConfirm,
  onCancel,
  saving = false,
}: SaveConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog save-dialog" onClick={(e) => e.stopPropagation()}>
        <h3 className="dialog__title">保存路线</h3>
        <div className="dialog__body">
          <div className="save-dialog__info">
            <div className="save-dialog__row">
              <span className="save-dialog__label">路线名称</span>
              <span className="save-dialog__value">{routeName}</span>
            </div>
            <div className="save-dialog__row">
              <span className="save-dialog__label">版本变更</span>
              <span className="save-dialog__value">
                <span className="save-dialog__version-old">{currentVersion}</span>
                <span className="save-dialog__arrow">→</span>
                <span className="save-dialog__version-new">{nextVersion}</span>
              </span>
            </div>
          </div>
          <div className="save-dialog__field">
            <label className="save-dialog__label">
              变更说明 <span className="dialog__required">*</span>
            </label>
            <textarea
              className="save-dialog__textarea"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="请描述本次修改的内容..."
              rows={3}
              maxLength={200}
              autoFocus
            />
            <div className="save-dialog__counter">
              {description.length}/200
            </div>
          </div>
        </div>
        <div className="dialog__footer">
          <button
            className="dialog__btn dialog__btn--cancel"
            onClick={onCancel}
            disabled={saving}
          >
            取消
          </button>
          <button
            className="dialog__btn dialog__btn--confirm"
            onClick={onConfirm}
            disabled={!description.trim() || saving}
          >
            {saving ? "保存中..." : "确认保存"}
          </button>
        </div>
      </div>
    </div>
  );
}
