import { type ReactNode, useEffect, useRef } from "react";

/**
 * A modal dialog: a title, a text and its actions. It keeps the keyboard's focus inside while open,
 * starts on its first action, closes on Escape or a click beside it, and gives the focus back to what
 * opened it.
 */
export function Dialog({
  title,
  children,
  actions,
  onClose,
}: {
  title: string;
  children: ReactNode;
  actions: ReactNode;
  onClose: () => void;
}) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    box.current?.querySelector<HTMLElement>("button")?.focus();
    const keys = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || box.current === null) return;
      const focusable = [...box.current.querySelectorAll<HTMLElement>("button")];
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener("keydown", keys);
    return () => {
      window.removeEventListener("keydown", keys);
      opener?.focus();
    };
  }, [onClose]);

  return (
    <div className="foundations-modal" onClick={onClose}>
      <div
        ref={box}
        className="foundations-modal-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="foundations-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id="foundations-dialog-title">{title}</h3>
        <div className="foundations-modal-text">{children}</div>
        <div className="foundations-modal-actions">{actions}</div>
      </div>
    </div>
  );
}
