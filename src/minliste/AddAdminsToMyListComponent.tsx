import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { setAdminsForMyList } from '../Api';
import { myUid } from "../config/firebase";
import { RootState, Bruker, Viewer } from '../types';
import { Badge } from '../components/ui/badge';

interface AddAdminsProps {
  alleBrukere: Bruker[];
  myAllowedAdmins: Viewer[];
}

interface AddAdminsState {
  soek: string;
  soekApen: boolean;
}

class AddAdminsToMyListComponent extends Component<AddAdminsProps, AddAdminsState> {
  state: AddAdminsState = { soek: '', soekApen: false };

  handleChange = (option: Viewer): void => {
    const { myAllowedAdmins } = this.props;
    const skalFjernes = myAllowedAdmins.find(a => a.value === option.value);
    let newAdminList: Viewer[];
    if (skalFjernes) {
      newAdminList = myAllowedAdmins.filter(a => a.value !== option.value);
    } else {
      newAdminList = [...myAllowedAdmins, option];
    }
    setAdminsForMyList(newAdminList);
  };

  render() {
    const { alleBrukere, myAllowedAdmins } = this.props;
    const { soek, soekApen } = this.state;

    const people: Viewer[] = alleBrukere
      .filter(user => user.uid !== myUid() && !user.invisible)
      .map(b => ({ value: b.uid, label: b.navn }));

    const filtrert = soek.trim()
      ? people.filter(p => p.label.toLowerCase().includes(soek.toLowerCase()))
      : people;

    return (
      <div className="w-full">
        <p className="text-xs text-slate-400 mb-3">
          Disse brukerne kan legge til, redigere, slette og sortere ønsker på listen din — ikke bare se den.
        </p>

        {/* Valgte brukere som chips */}
        {myAllowedAdmins.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {myAllowedAdmins.map(admin => (
              <Badge
                key={admin.value}
                variant="secondary"
                onRemove={() => this.handleChange(admin)}
              >
                {admin.label}
              </Badge>
            ))}
          </div>
        )}

        {/* Søkefelt med portal-dropdown */}
        <PopoverPrimitive.Root
          open={soekApen && people.length > 0}
          onOpenChange={() => {}}
        >
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
                  const erValgt = !!myAllowedAdmins.find(a => a.value === person.value);
                  return (
                    <li key={person.value}>
                      <button
                        className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-primary-50 transition-colors"
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => { this.handleChange(person); this.setState({ soek: '' }); }}
                      >
                        <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${erValgt ? 'bg-primary-600 border-primary-600 text-white' : 'border-slate-300'}`}>
                          {erValgt && <span className="text-xs">✓</span>}
                        </span>
                        <span className={erValgt ? 'text-primary-700 font-medium' : 'text-slate-700'}>{person.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </PopoverPrimitive.Content>
          </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>

        {myAllowedAdmins.length === 0 && (
          <p className="text-xs text-slate-400 mt-2">Ingen kan administrere listen din ennå</p>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  alleBrukere: state.config.brukere,
  myAllowedAdmins: state.innloggetBruker.allowedAdmins,
});

export default connect(mapStateToProps, null)(AddAdminsToMyListComponent);
