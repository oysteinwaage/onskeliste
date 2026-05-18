import React, { useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { X, MoreHorizontal, Share, PlusSquare } from 'lucide-react';
import { incrementIosInstallBannerCount } from '../Api';
import { RootState } from '../types';

const MAX_SHOW_COUNT = 5;

// macOS Safari (Ventura+) also supports PWAs and sets navigator.standalone,
// so we must check iOS user-agent first before trusting the standalone flag.
function isIosInBrowser(): boolean {
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  if (!isIOS) return false;
  // standalone: true = installed PWA, false = Safari browser, undefined = iOS Chrome/Firefox
  const standalone = (window.navigator as any).standalone;
  return standalone !== true;
}

interface Props {
  userDbKey: string;
  iosInstallBannerCount: number;
}

function InstallBanner({ userDbKey, iosInstallBannerCount }: Props) {
  const hasIncremented = useRef(false);
  const shouldShow =
    !!userDbKey &&
    isIosInBrowser() &&
    iosInstallBannerCount < MAX_SHOW_COUNT;

  useEffect(() => {
    if (shouldShow && !hasIncremented.current) {
      hasIncremented.current = true;
      incrementIosInstallBannerCount(userDbKey, iosInstallBannerCount);
    }
  }, [shouldShow, userDbKey, iosInstallBannerCount]);

  const [dismissed, setDismissed] = React.useState(false);

  if (!shouldShow || dismissed) return null;

  return (
    <div className="fixed bottom-16 left-0 right-0 z-30 px-3 pb-2 pointer-events-none">
      <div
        className="pointer-events-auto bg-white border border-slate-200 rounded-2xl shadow-lg px-4 py-3 flex items-start gap-3"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}
      >
        <div className="mt-0.5 shrink-0 bg-primary-50 rounded-xl p-2">
          <MoreHorizontal className="h-5 w-5 text-primary-600" strokeWidth={2} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-slate-800 leading-tight">
            Tips: Legg til som app på Hjem-skjerm
          </p>
          <ol className="text-[12px] text-slate-500 mt-1 leading-snug space-y-0.5 list-none">
            <li><span className="font-medium text-slate-700">1.</span> Trykk <span className="font-medium text-slate-700">«···»</span> nederst til høyre i Safari</li>
            <li><span className="font-medium text-slate-700">2.</span> Velg <span className="font-medium text-slate-700">Del</span> <Share className="h-3 w-3 inline align-middle -translate-y-[2px] mx-0.5" strokeWidth={2.5} /></li>
            <li><span className="font-medium text-slate-700">3.</span> Scroll ned og trykk <PlusSquare className="h-3 w-3 inline align-middle -translate-y-[2px] mx-0.5" strokeWidth={2.5} /><span className="font-medium text-slate-700">«Legg til på Hjem-skjerm»</span></li>
          </ol>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors -mr-1 -mt-0.5"
          aria-label="Lukk"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

const mapStateToProps = (state: RootState) => ({
  userDbKey: state.innloggetBruker.userDbKey,
  iosInstallBannerCount: state.innloggetBruker.iosInstallBannerCount ?? 0,
});

export default connect(mapStateToProps)(InstallBanner);
