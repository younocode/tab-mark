import { IconClose } from "./icons";

interface PanelModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function PanelModal({ title, onClose, children }: PanelModalProps) {
  return (
    <div className="tm-overlay" onClick={onClose}>
      <div className="tm-panel-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tm-panel-modal-hd">
          <h2>{title}</h2>
          <button className="tm-btn ghost icon sm" onClick={onClose}>
            <IconClose size={14} />
          </button>
        </div>
        <div className="tm-panel-modal-body">{children}</div>
      </div>
    </div>
  );
}
