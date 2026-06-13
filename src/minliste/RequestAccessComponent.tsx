import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Check } from 'lucide-react';
import { sendAccessRequests, trekkTilbakeTilgangsforesporsel } from '../Api';
import { myUid } from '../config/firebase';
import { RootState, Bruker, Viewer, AccessRequest } from '../types';
import { Badge } from '../components/ui/badge';

interface RequestAccessProps {
  alleBrukere: Bruker[];
  allowedListsForMe: string[];
  utgaendeForesporsler: AccessRequest[];
  minUid?: string;
  minNavn: string;
}

interface RequestAccessState {
  soek: string;
  soekApen: boolean;
}

class RequestAccessComponent extends Component<RequestAccessProps, RequestAccessState> {
  state: RequestAccessState = { soek: '', soekApen: false };

  // Sender forespørselen med en gang man velger en bruker, og trekker den tilbake
  // hvis man velger den samme igjen — på samme måte som viewer-modulen lagrer direkte.
  toggleForesporsel = (option: Viewer): void => {
    const { minUid, minNavn, utgaendeForesporsler } = this.props;
    if (!minUid) return;
    const alleredeSendt = utgaendeForesporsler.some(r => r.uid === option.value);
    if (alleredeSendt) {
      trekkTilbakeTilgangsforesporsel(option.value);
    } else {
      sendAccessRequests(minUid, minNavn, [option]);
    }
  };

  render() {
    const { alleBrukere, allowedListsForMe, utgaendeForesporsler } = this.props;
    const { soek, soekApen } = this.state;

    const sendtTilUids = new Set(utgaendeForesporsler.map(r => r.uid));

    const people: Viewer[] = alleBrukere
      .filter(user => user.uid !== myUid() && !user.invisible)
      .filter(user => !allowedListsForMe.includes(user.uid))
      .map(b => ({ value: b.uid, label: b.navn }));

    const filtrert = soek.trim()
      ? people.filter(p => p.label.toLowerCase().includes(soek.toLowerCase()))
      : people;

    return (
      <div className="w-full">
        <p className="text-xs text-slate-400 mb-3">
          Søk opp brukere du vil følge — forespørselen sendes med en gang du velger dem.
        </p>

        {/* Sendte forespørsler som chips (venter på svar) */}
        {utgaendeForesporsler.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {utgaendeForesporsler.map(r => (
              <Badge
                key={r.uid}
                variant="secondary"
                onRemove={() => this.toggleForesporsel({ value: r.uid, label: r.navn })}
              >
                {r.navn}
              </Badge>
            ))}
          </div>
        )}

        {/* Søkefelt med portal-dropdown */}
        <PopoverPrimitive.Root open={soekApen && people.length > 0} onOpenChange={() => {}}>
          <PopoverPrimitive.Trigger asChild>
            <div className="w-full">
              <input
                className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 hover:border-slate-400 transition-colors"
                placeholder="Søk etter navn..."
                value={soek}
                onChange={e => this.setState({ soek: e.target.value, soekApen: true })}
                onClick={() => this.setState({ soekApen: true })}
                onFocus={() => this.setState({ soekApen: true })}
                onBlur={() => setTimeout(() => this.setState({ soekApen: false }), 150)}
              />
            </div>
          </PopoverPrimitive.Trigger>
          <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
              align="start"
              sideOffset={4}
              onOpenAutoFocus={e => e.preventDefault()}
              onInteractOutside={() => this.setState({ soekApen: false })}
              style={{ width: 'var(--radix-popover-trigger-width)', zIndex: 9999 }}
              className="bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden max-h-52 overflow-y-auto"
            >
              <ul>
                {filtrert.map(person => {
                  const erValgt = sendtTilUids.has(person.value);
                  return (
                    <li key={person.value}>
                      <button
                        className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-primary-50 transition-colors"
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => { this.toggleForesporsel(person); this.setState({ soek: '' }); }}
                      >
                        <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${erValgt ? 'bg-primary-600 border-primary-600 text-white' : 'border-slate-300'}`}>
                          {erValgt && <Check className="w-3 h-3" />}
                        </span>
                        <span className={erValgt ? 'text-primary-700 font-medium' : 'text-slate-700'}>{person.label}</span>
                      </button>
                    </li>
                  );
                })}
                {filtrert.length === 0 && (
                  <li className="px-3 py-2 text-sm text-slate-400">Ingen treff</li>
                )}
              </ul>
            </PopoverPrimitive.Content>
          </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>

        {utgaendeForesporsler.length === 0 && (
          <p className="text-xs text-slate-400 mt-2">Du har ingen ventende forespørsler</p>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  alleBrukere: state.config.brukere,
  allowedListsForMe: state.vennersLister.allowedListsForMe,
  utgaendeForesporsler: state.innloggetBruker.utgaendeTilgangsforesporsler,
  minUid: state.innloggetBruker.uid,
  minNavn: state.innloggetBruker.navn,
});

export default connect(mapStateToProps, null)(RequestAccessComponent);
