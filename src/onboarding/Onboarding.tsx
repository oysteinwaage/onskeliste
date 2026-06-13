import React, { useState } from 'react';
import { connect } from 'react-redux';
import confetti from 'canvas-confetti';
import { setOnboardingCompleted, updateMyMeasumentOnProfile } from '../Api';
import { currentVersion } from '../utils/ChangesSinceLastLogin';
import { finnLabelForStrl, measurementKeys } from '../utils/util';
import AddViewersToMyListComponent from '../minliste/AddViewersToMyListComponent';
import RequestAccessComponent from '../minliste/RequestAccessComponent';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { RootState } from '../types';
import { Dispatch } from 'redux';
import { Gift, Users, Target, ChevronRight, ChevronLeft, Sparkles, Zap } from 'lucide-react';

interface OnboardingProps {
  measurements: Record<string, string>;
  userDbKey: string;
  onComplete: (measurements: Record<string, string>, lastSeenVersion: number) => void;
}

const STEPS = 3;

function Onboarding({ measurements, userDbKey, onComplete }: OnboardingProps) {
  const isExistingUser = new URLSearchParams(window.location.search).get('type') === 'existing';

  const [step, setStep] = useState(1);
  const [localMeasurements, setLocalMeasurements] = useState<Record<string, string>>({});
  const [completing, setCompleting] = useState(false);

  const getMeasurementValue = (sizeKey: string): string => {
    if (localMeasurements[sizeKey] !== undefined) return localMeasurements[sizeKey];
    return (measurements && measurements[sizeKey]) || '';
  };

  const fireConfetti = () => {
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#6366f1', '#a78bfa', '#f0abfc', '#fbbf24', '#34d399'] });
    setTimeout(() => {
      confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#6366f1', '#fbbf24', '#34d399'] });
    }, 250);
    setTimeout(() => {
      confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#a78bfa', '#f0abfc', '#fbbf24'] });
    }, 400);
  };

  const saveMeasurements = () => {
    Object.entries(localMeasurements).forEach(([sizeKey, value]) => {
      if (value.trim()) {
        updateMyMeasumentOnProfile(userDbKey, value, sizeKey);
      }
    });
  };

  const goToNextStep = () => {
    if (step === 2) saveMeasurements();
    setStep(s => s + 1);
  };

  const handleComplete = () => {
    if (completing) return;
    setCompleting(true);
    fireConfetti();
    const mergedMeasurements = { ...measurements, ...localMeasurements };
    setTimeout(() => {
      onComplete(mergedMeasurements, currentVersion);
    }, 1800);
  };

  const step1Title = isExistingUser ? 'Velkommen til nye Ønskelisten!' : 'Hvem skal se listen din?';
  const step3Title = isExistingUser ? 'Klar for den nye Ønskelisten!' : 'Velkommen til Ønskelisten!';
  const step3Intro = isExistingUser
    ? 'Du er nå inne på en ny og forbedret Ønskelisten. Alt du kjente fra før er der, pluss en rekke nye funksjoner. Her er en kort oppsummering av de forskjellige sidene og hva de kan brukes til'
    : 'Med Ønskelisten kan du samle alt du ønsker deg på ett sted. Del listen med familie og venner, og hjelp dem med å finne den perfekte gaven — uten avsløringer om hva som allerede er kjøpt. 🎁';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-primary-50 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-500 px-8 pt-8 pb-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Gift className="w-6 h-6 opacity-90" />
            <span className="text-sm font-medium opacity-90">
              {isExistingUser ? 'Ny og forbedret' : 'Kom i gang'}
            </span>
          </div>
          <h1 className="text-2xl font-bold leading-tight">
            {step === 1 && step1Title}
            {step === 2 && 'Dine generelle mål'}
            {step === 3 && step3Title}
          </h1>

          {/* Step dots */}
          <div className="flex gap-2 mt-5">
            {Array.from({ length: STEPS }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${i + 1 <= step ? 'bg-white w-6' : 'bg-white/30 w-3'}`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-7">

          {/* Steg 1 */}
          {step === 1 && (
            isExistingUser ? (
              <div>
                <div className="flex items-start gap-3 bg-primary-50 rounded-xl p-4 mb-5">
                  <Zap className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-primary-800 leading-relaxed">
                    Ønskelisten er flyttet til ny server og har fått seg en real facelift — med et friskt nytt utseende og en rekke nye funksjoner.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-slate-50 rounded-xl p-3">
                    <span className="text-lg">📋</span>
                    <p className="text-sm text-slate-700"><strong>Flere lister per bruker</strong> — opprett egne lister for ulike anledninger eller for barna dine</p>
                  </div>
                  <div className="flex items-start gap-3 bg-slate-50 rounded-xl p-3">
                    <span className="text-lg">🤝</span>
                    <p className="text-sm text-slate-700"><strong>Del lister med andre</strong> — samarbeid om felles ønskelister med familie eller venner</p>
                  </div>
                  <div className="flex items-start gap-3 bg-slate-50 rounded-xl p-3">
                    <span className="text-lg">🏷️</span>
                    <p className="text-sm text-slate-700"><strong>Prisjakt-integrasjon</strong> — legg enkelt til produkter med priser direkte fra Prisjakt.no</p>
                  </div>
                  <div className="flex items-start gap-3 bg-slate-50 rounded-xl p-3">
                    <span className="text-lg">✨</span>
                    <p className="text-sm text-slate-700"><strong>Og mye mer</strong> — ny design, bedre ytelse og jevnlige oppdateringer</p>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start gap-3 bg-primary-50 rounded-xl p-4 mb-5">
                  <Users className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-primary-800 leading-relaxed">
                    Velg hvem som skal ha tilgang til ønskelisten din. Kun de du velger her kan se hva du ønsker deg.
                  </p>
                </div>
                <AddViewersToMyListComponent />

                <div className="mt-6 pt-6 border-t border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-800 mb-1">Vil du følge noen andres lister?</h3>
                  <p className="text-xs text-slate-500 mb-3">
                    Søk dem opp og send en forespørsel om å få se ønskelisten deres.
                  </p>
                  <RequestAccessComponent />
                </div>
              </div>
            )
          )}

          {/* Steg 2: Mål */}
          {step === 2 && (
            <div>
              <div className="flex items-start gap-3 bg-amber-50 rounded-xl p-4 mb-5">
                <Target className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 leading-relaxed">
                  Når du fyller inn dine generelle mål gjør du det mye enklere for folk som skal kjøpe gave til deg — de kan velge ting som passer, selv om det ikke er på ønskelisten din!
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {Object.values(measurementKeys).map(sizeKey => (
                  <Input
                    key={sizeKey}
                    id={`onboarding-${sizeKey}`}
                    label={finnLabelForStrl(sizeKey)}
                    value={getMeasurementValue(sizeKey)}
                    type="text"
                    placeholder="—"
                    onChange={(e) => setLocalMeasurements(prev => ({ ...prev, [sizeKey]: e.target.value }))}
                    onBlur={(e) => updateMyMeasumentOnProfile(userDbKey, e.target.value, sizeKey)}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-3">
                Felter du lar stå tomme vises ikke for andre.
              </p>
            </div>
          )}

          {/* Steg 3: Velkommen */}
          {step === 3 && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-5">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-3">
                {isExistingUser ? 'Velkommen tilbake!' : 'Du er klar!'}
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                {step3Intro}
              </p>
              <div className="bg-slate-50 rounded-xl p-4 text-left space-y-3 mb-2">
                <div className="flex items-start gap-3">
                  <span className="text-lg">🎁</span>
                  <p className="text-sm text-slate-700"><strong>Min liste</strong> — legg til og rediger ønsker. Trykk på <strong>+</strong> øverst til høyre for å opprette ekstra lister for deg selv eller som kan deles med andre — perfekt for felles ønsker!</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg">👀</span>
                  <p className="text-sm text-slate-700"><strong>Venners lister</strong> — se og «ta» ønsker fra venner</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg">🛒</span>
                  <p className="text-sm text-slate-700"><strong>Mine kjøp</strong> — hold oversikt over hva du har kjøpt og hvor mye du har brukt 💸 Kan også legge til ting kjøpt utenfor listene til folk for egen oversikt 🤓</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg">👤</span>
                  <p className="text-sm text-slate-700"><strong>Profil</strong> — endre hvem som ser listen din og oppdater mål og størrelser</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg">💬</span>
                  <p className="text-sm text-slate-700"><strong>Tilbakemelding</strong> — send oss gjerne en melding om du har innspill eller ønsker nye funksjoner</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 pb-7 flex items-center justify-between gap-3">
          {step > 1 ? (
            <Button variant="outline" size="sm" onClick={() => setStep(s => s - 1)} className="gap-1">
              <ChevronLeft className="w-4 h-4" />
              Tilbake
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2 ml-auto">
            {step > 1 && step < 3 && (
              <button
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors px-2"
                onClick={goToNextStep}
              >
                Hopp over
              </button>
            )}

            {step < 3 ? (
              <Button onClick={goToNextStep} className="gap-1">
                Neste
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={completing}
                className="gap-2 bg-primary-600 hover:bg-primary-700 px-5"
              >
                <Sparkles className="w-4 h-4" />
                {completing ? 'Starter...' : isExistingUser ? 'Til den nye Ønskelisten!' : 'Ta i bruk Ønskelisten min'}
              </Button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

const mapStateToProps = (state: RootState) => ({
  measurements: state.innloggetBruker.measurements,
  userDbKey: state.innloggetBruker.userDbKey,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onComplete: (measurements: Record<string, string>, lastSeenVersion: number) => dispatch(setOnboardingCompleted(measurements, lastSeenVersion) as any),
});

export default connect(mapStateToProps, mapDispatchToProps)(Onboarding);
