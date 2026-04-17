import type { ReactNode } from "react";

type ModalProps = {
  open: boolean;
  onClose?: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  overlayClassName?: string;
  panelClassName?: string;
};

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  overlayClassName = "fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4",
  panelClassName = "w-full max-w-md rounded-3xl bg-white p-5 shadow-xl",
}: ModalProps) {
  if (!open) return null;

  return (
    <div className={overlayClassName} onClick={onClose}>
      <div className={panelClassName} onClick={(event) => event.stopPropagation()}>
        {title ? <h3>{title}</h3> : null}
        {description ? <div>{description}</div> : null}
        {children}
        {footer ? <div>{footer}</div> : null}
      </div>
    </div>
  );
}
