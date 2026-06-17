import React, { useEffect, useRef, useState } from 'react';
import { db } from '../config/firebase';
import './LiverpoolTur.css';

type Status = 'passer' | 'kanIkkeIdeelt' | 'gaarIkke';

const PERSONER: { label: string; key: string }[] = [
  { label: 'Jo', key: 'jo' },
  { label: 'Arvid', key: 'arvid' },
  { label: 'Snorre', key: 'snorre' },
  { label: 'Øystein', key: 'oystein' },
];

const VALG: { status: Status; label: string }[] = [
  { status: 'passer', label: 'Passer' },
  { status: 'kanIkkeIdeelt', label: 'Kan, men ikke ideelt' },
  { status: 'gaarIkke', label: 'Går ikke' },
];

interface Helg {
  type: 'mulig' | 'block';
  id?: string;          // stabil nøkkel i Firebase (kun for "mulig")
  dato: string;
  cl?: string;          // CL-badge tekst
  romjul?: boolean;
  ws: string;           // høyre-tekst ("Mulig", "Landslagspause", ...)
}

interface Maaned {
  navn: string;
  antall: string;
  helger: Helg[];
}

const MAANEDER: Maaned[] = [
  {
    navn: 'Oktober 2026',
    antall: '4 av 5 helger',
    helger: [
      { type: 'block', dato: '3.–4. okt', ws: 'Landslagspause' },
      { type: 'mulig', id: 'okt-10-11', dato: '10.–11. okt', cl: '+ CL uka etter (13.–14.)', ws: 'Mulig' },
      { type: 'mulig', id: 'okt-17-18', dato: '17.–18. okt', cl: '+ CL uka etter (20.–21.)', ws: 'Mulig' },
      { type: 'mulig', id: 'okt-24-25', dato: '24.–25. okt', ws: 'Mulig' },
      { type: 'mulig', id: 'okt-31-nov-01', dato: '31. okt–1. nov', cl: '+ CL uka etter (3.–4.)', ws: 'Mulig' },
    ],
  },
  {
    navn: 'November 2026',
    antall: '3 av 4 helger',
    helger: [
      { type: 'mulig', id: 'nov-07-08', dato: '7.–8. nov', ws: 'Mulig' },
      { type: 'block', dato: '14.–15. nov', ws: 'Landslagspause' },
      { type: 'mulig', id: 'nov-21-22', dato: '21.–22. nov', cl: '+ CL uka etter (24.–25.)', ws: 'Mulig' },
      { type: 'mulig', id: 'nov-28-29', dato: '28.–29. nov', ws: 'Mulig' },
    ],
  },
  {
    navn: 'Januar 2027',
    antall: '4 av 5 helger',
    helger: [
      { type: 'mulig', id: 'jan-02-03', dato: '2.–3. jan', cl: 'Romjul – kamper kan flyttes', romjul: true, ws: 'Mulig' },
      { type: 'block', dato: '9.–10. jan', ws: 'FA-cup, 3. runde' },
      { type: 'mulig', id: 'jan-16-17', dato: '16.–17. jan', cl: '+ CL uka etter (19.–20.)', ws: 'Mulig' },
      { type: 'mulig', id: 'jan-23-24', dato: '23.–24. jan', cl: '+ CL uka etter (27.)', ws: 'Mulig' },
      { type: 'mulig', id: 'jan-30-31', dato: '30.–31. jan', ws: 'Mulig' },
    ],
  },
  {
    navn: 'Februar 2027',
    antall: '3 av 4 helger',
    helger: [
      { type: 'mulig', id: 'feb-06-07', dato: '6.–7. feb', ws: 'Mulig' },
      { type: 'block', dato: '13.–14. feb', ws: 'FA-cup, 4. runde' },
      { type: 'mulig', id: 'feb-20-21', dato: '20.–21. feb', cl: '+ CL-playoff uka etter (23.–24.)', ws: 'Mulig' },
      { type: 'mulig', id: 'feb-27-28', dato: '27.–28. feb', ws: 'Mulig' },
    ],
  },
];

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const BlockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M10 10l4 4M14 10l-4 4" />
  </svg>
);

type Votes = Record<string, Record<string, Status>>;

const LiverpoolTur: React.FC = () => {
  const [votes, setVotes] = useState<Votes>({});
  const [open, setOpen] = useState<string | null>(null); // "<rowId>:<personKey>"
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ref = db.ref('liverpool-tur');
    const handler = ref.on('value', (snap) => setVotes(snap.val() || {}));
    return () => ref.off('value', handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.lt-person')) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const setStatus = (rowId: string, personKey: string, status: Status | null) => {
    db.ref(`liverpool-tur/${rowId}/${personKey}`).set(status);
    setOpen(null);
  };

  return (
    <div className="lt-root" ref={rootRef}>
      <div className="lt-wrap">
        <h1 style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
          Oversikt over mulige helger for å reise til Liverpool på kamp i oktober–november 2026 og januar–februar 2027.
        </h1>

        <div className="lt-leg">
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--lt-success)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M9 12l2 2 4-4" /></svg> Mulig kamphelg
          </span>
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--lt-danger)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M10 10l4 4M14 10l-4 4" /></svg> Sperret
          </span>
          <span><span className="lt-cl" style={{ margin: 0 }}>+ CL uka etter</span> kan kombineres med hjemmekamp i CL</span>
        </div>

        <div className="lt-grid">
          {MAANEDER.map((maaned) => (
            <div className="lt-mc" key={maaned.navn}>
              <div className="lt-mh">
                <span className="lt-mn">{maaned.navn}</span>
                <span className="lt-mcount">{maaned.antall}</span>
              </div>
              {maaned.helger.map((helg, i) => (
                <div className={`lt-wk ${helg.type === 'mulig' ? 'lt-ok' : 'lt-block'}`} key={helg.id || `${maaned.navn}-${i}`}>
                  {helg.type === 'mulig' ? <CheckIcon /> : <BlockIcon />}
                  <div className="lt-wb">
                    <span className="lt-wd">{helg.dato}</span>
                    {helg.cl && <><br /><span className={`lt-cl${helg.romjul ? ' romjul' : ''}`}>{helg.cl}</span></>}
                    {helg.type === 'mulig' && helg.id && (
                      <div className="lt-people">
                        {PERSONER.map((person) => {
                          const current = votes[helg.id!]?.[person.key];
                          const menuKey = `${helg.id}:${person.key}`;
                          return (
                            <span className="lt-person" key={person.key}>
                              <button
                                type="button"
                                className={`lt-pbtn${current ? ' ' + current : ''}`}
                                onClick={() => setOpen(open === menuKey ? null : menuKey)}
                              >
                                {person.label}
                              </button>
                              {open === menuKey && (
                                <div className="lt-menu">
                                  {VALG.map((v) => (
                                    <button key={v.status} type="button" onClick={() => setStatus(helg.id!, person.key, v.status)}>
                                      <span className={`lt-dot ${v.status}`} />{v.label}
                                    </button>
                                  ))}
                                  {current && (
                                    <button type="button" onClick={() => setStatus(helg.id!, person.key, null)}>
                                      <span className="lt-dot clear" />Fjern svar
                                    </button>
                                  )}
                                </div>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <span className="lt-ws">{helg.ws}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiverpoolTur;
