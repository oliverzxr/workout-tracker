import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { ChevronDown, ChevronUp, Dumbbell, X } from 'lucide-react';
import { t } from '../app/pt-BR';

export function Title({ heading, subtitle, action }: { heading: string; subtitle?: string; action?: ReactNode }) {
  return <header className="page-title"><div><h1>{heading}</h1>{subtitle && <p>{subtitle}</p>}</div>{action}</header>;
}

export function Empty({ title, detail, action }: { title: string; detail?: string; action?: ReactNode }) {
  return <div className="empty"><span className="empty-icon"><Dumbbell size={20} /></span><div><strong>{title}</strong>{detail && <p>{detail}</p>}</div>{action}</div>;
}

export function Dialog({ title, children, close }: { title: string; children: ReactNode; close: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const heading = useId();
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => { dialog?.close(); };
  }, []);
  return <dialog ref={ref} aria-labelledby={heading} onCancel={event => { event.preventDefault(); close(); }}>
    <header className="dialog-head"><h2 id={heading}>{title}</h2><button type="button" className="icon-button" onClick={close} aria-label={t.common.close}><X size={20} /></button></header>
    {children}
  </dialog>;
}

export function Order({ index, length, label, move }: { index: number; length: number; label: string; move: (step: -1 | 1) => void }) {
  return <div className="order">
    <button type="button" className="icon-button" disabled={index === 0} onClick={() => move(-1)} aria-label={t.common.up + ' ' + label}><ChevronUp size={17} /></button>
    <button type="button" className="icon-button" disabled={index === length - 1} onClick={() => move(1)} aria-label={t.common.down + ' ' + label}><ChevronDown size={17} /></button>
  </div>;
}
