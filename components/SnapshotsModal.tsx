import { useState } from "react";
import { IconCamera, IconClose, IconPlus } from "./icons";
import { useSnapshotStore } from "../stores/snapshotStore";
import type { Translations } from "../utils/i18n";

interface SnapshotsModalProps {
  onClose: () => void;
  t: Translations;
}

export function SnapshotsModal({ onClose, t }: SnapshotsModalProps) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const snapshots = useSnapshotStore((s) => s.snapshots);
  const save = useSnapshotStore((s) => s.save);
  const restore = useSnapshotStore((s) => s.restore);
  const remove = useSnapshotStore((s) => s.remove);

  return (
    <div className="tm-overlay" onClick={onClose}>
      <div
        className="tm-cmd"
        style={{ width: 560 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "14px 18px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
            <IconCamera size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
            {t.snapshots.title}
          </h3>
          <div
            style={{
              marginTop: 2,
              fontSize: 11.5,
              color: "var(--fg-3)",
            }}
          >
            {t.snapshots.subtitle}
          </div>
        </div>
        <div style={{ padding: 18 }}>
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.snapshots.placeholder}
              onKeyDown={(e) => {
                if (e.key === "Enter" && name.trim()) {
                  save(name.trim());
                  setName("");
                }
              }}
              style={{
                flex: 1,
                height: 32,
                padding: "0 12px",
                borderRadius: 6,
                border: "1px solid var(--border)",
                background: "var(--bg-sub)",
                color: "var(--fg)",
                outline: "none",
                fontFamily: "inherit",
                fontSize: 13,
              }}
            />
            <button
              className={`tm-btn primary ${saving ? "loading" : ""}`}
              disabled={saving || !name.trim()}
              onClick={async () => {
                if (!name.trim() || saving) return;
                setSaving(true);
                await save(name.trim());
                setName("");
                setSaving(false);
              }}
            >
              <IconPlus size={11} />
              {t.snapshots.save}
            </button>
          </div>
          <div>
            {snapshots.length === 0 ? (
              <div
                style={{
                  padding: 30,
                  textAlign: "center",
                  color: "var(--fg-3)",
                }}
              >
                {t.snapshots.empty}
              </div>
            ) : (
              snapshots.map((sn) => (
                <div
                  key={sn.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 12,
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <IconCamera size={14} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500 }}>{sn.name}</div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10.5,
                        color: "var(--fg-3)",
                        marginTop: 2,
                      }}
                    >
                      {new Date(sn.createdAt).toLocaleString()} ·{" "}
                      {t.snapshots.count(sn.tabs.length)}
                    </div>
                  </div>
                  <button
                    className="tm-btn sm"
                    onClick={() => restore(sn.id)}
                  >
                    {t.snapshots.restore}
                  </button>
                  <button
                    className="tm-btn ghost sm danger"
                    onClick={() => remove(sn.id)}
                  >
                    <IconClose size={11} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
            padding: "12px 18px",
            borderTop: "1px solid var(--border)",
            background: "var(--bg-sub)",
            borderRadius: "0 0 var(--radius-lg) var(--radius-lg)",
          }}
        >
          <button className="tm-btn" onClick={onClose}>
            {t.common.close}
          </button>
        </div>
      </div>
    </div>
  );
}
