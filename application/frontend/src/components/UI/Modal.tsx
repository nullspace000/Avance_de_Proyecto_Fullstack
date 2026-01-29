import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

export default function Modal({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: ReactNode }) {
    useEffect(() => {
        const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", esc);
        return () => document.removeEventListener("keydown", esc);
    }, [onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div style={overlay} onClick={onClose}>
            <div style={box} onClick={e => e.stopPropagation()}>
                {children}
            </div>
        </div>,
        document.body
    );
}

const overlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center" };
const box = { background: "white", padding: 20, borderRadius: 10 };
