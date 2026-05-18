import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import {
  List, Gift, ShoppingCart, User, LogOut,
  X, PlusSquare, Shield, MessageSquare, Settings,
} from 'lucide-react';
import { logOut } from '../Api';
import { settOpprettListeDialogOpen } from '../actions/actions';
import { RootState } from '../types';
import { Dispatch } from 'redux';

interface AppBarState {
  drawerOpen: boolean;
}

interface AppBarComponentProps {
  headerTekst: string;
  erAdmin: boolean;
  innloggetBrukerNavn: string;
  ulesteFeedback: number;
  tilbakemeldingEnabled: boolean;
  pathname: string;
  onAapneNySide: (id: string) => void;
  onLogOut: () => void;
  onOpprettNyListe: () => void;
}

const bottomNavItems = [
  { key: 'minliste', label: 'Min liste', icon: List },
  { key: 'vennelister', label: 'Vennelister', icon: Gift },
  { key: 'minekjoep', label: 'Mine kjøp', icon: ShoppingCart },
  { key: 'profil', label: 'Profil', icon: User },
];

const LOGIN_HEADERS = ['Innlogging', 'Opprett ny bruker', 'Resett passord'];

class AppBarComponent extends Component<AppBarComponentProps, AppBarState> {
  constructor(props: AppBarComponentProps) {
    super(props);
    this.state = { drawerOpen: false };
  }

  navigate(valg: string): void {
    switch (valg) {
      case 'vennelister':
      case 'minliste':
      case 'profil':
      case 'minekjoep':
      case 'admin':
      case 'tilbakemelding':
        this.props.onAapneNySide(valg);
        break;
      case 'loggUt':
        this.props.onLogOut();
        break;
      default:
        break;
    }
    this.setState({ drawerOpen: false });
  }

  render() {
    const { headerTekst, erAdmin, innloggetBrukerNavn, onOpprettNyListe, ulesteFeedback, tilbakemeldingEnabled, pathname } = this.props;
    const { drawerOpen } = this.state;

    const erPaaLoginSide = LOGIN_HEADERS.includes(headerTekst);
    const erPaaOnboarding = pathname === '/onboarding';
    const visNav = !erPaaLoginSide && !erPaaOnboarding;
    const erPaaMinListe = headerTekst === 'Rediger ønskeliste';
    const visSettings = visNav && (erAdmin || tilbakemeldingEnabled);

    const activeTab = pathname === '/minliste' ? 'minliste'
      : pathname === '/vennelister' ? 'vennelister'
      : pathname === '/minekjoep' ? 'minekjoep'
      : pathname === '/profil' ? 'profil'
      : '';

    return (
      <>
        {/* Top header */}
        <header
          className="bg-primary-600 z-40 relative"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          <div className="flex items-center h-14 px-3">
            {/* Left slot */}
            <div className="w-10 flex items-center justify-start">
              {visSettings && (
                <button
                  onClick={() => this.setState({ drawerOpen: true })}
                  className="relative p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/20 transition-colors"
                  aria-label="Innstillinger og mer"
                >
                  <Settings className="h-5 w-5" />
                  {erAdmin && ulesteFeedback > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
                      {ulesteFeedback}
                    </span>
                  )}
                </button>
              )}
            </div>

            {/* Center: title */}
            <div className="flex-1 text-center">
              <h1 className="text-[15px] font-semibold text-white leading-tight">{headerTekst}</h1>
              {erPaaMinListe && innloggetBrukerNavn && (
                <p className="text-[11px] text-white/70 leading-tight">{innloggetBrukerNavn}</p>
              )}
            </div>

            {/* Right slot */}
            <div className="w-10 flex items-center justify-end">
              {erPaaMinListe && !erPaaOnboarding && (
                <button
                  onClick={onOpprettNyListe}
                  className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/20 transition-colors"
                  aria-label="Ny liste"
                >
                  <PlusSquare className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Bottom navigation */}
        {visNav && (
          <nav
            className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100"
            style={{ boxShadow: '0 -1px 12px rgba(0,0,0,0.06)', paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="flex items-stretch h-16">
              {bottomNavItems.map(({ key, label, icon: Icon }) => {
                const isActive = activeTab === key;
                return (
                  <button
                    key={key}
                    onClick={() => this.navigate(key)}
                    className={`flex-1 flex flex-col items-center justify-center gap-1 relative transition-colors ${
                      isActive ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary-600 rounded-b-full" />
                    )}
                    <Icon
                      className="h-[22px] w-[22px]"
                      strokeWidth={isActive ? 2.5 : 1.75}
                    />
                    <span className={`text-[10px] leading-none tracking-wide ${isActive ? 'font-semibold' : 'font-normal'}`}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>
        )}

        {/* Overlay */}
        {drawerOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
            onClick={() => this.setState({ drawerOpen: false })}
          />
        )}

        {/* Settings drawer (slides in from left) */}
        <aside
          className={`fixed top-0 left-0 h-full w-60 bg-white z-50 flex flex-col transition-transform duration-300 ${
            drawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={drawerOpen ? { boxShadow: '4px 0 24px rgba(0,0,0,0.10)' } : undefined}
        >
          <div
            className="flex items-center justify-between px-5 pb-4 border-b border-slate-100 bg-primary-600"
            style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' }}
          >
            <span className="font-semibold text-white text-sm">Meny</span>
            <button
              onClick={() => this.setState({ drawerOpen: false })}
              className="p-1.5 rounded-lg text-white/70 hover:bg-white/20 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex-1 py-3">
            {(erAdmin || tilbakemeldingEnabled) && (
              <button
                onClick={() => this.navigate('tilbakemelding')}
                className="w-full flex items-center gap-3 px-5 py-3 text-left text-slate-700 hover:bg-slate-50 transition-colors text-sm"
              >
                <MessageSquare className="h-4 w-4 shrink-0 text-slate-400" />
                Tilbakemelding
                {erAdmin && ulesteFeedback > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                    {ulesteFeedback}
                  </span>
                )}
              </button>
            )}
            {erAdmin && (
              <button
                onClick={() => this.navigate('admin')}
                className="w-full flex items-center gap-3 px-5 py-3 text-left text-slate-700 hover:bg-slate-50 transition-colors text-sm"
              >
                <Shield className="h-4 w-4 shrink-0 text-slate-400" />
                Admin
              </button>
            )}
          </nav>

          <div className="border-t border-slate-100 py-3">
            <button
              onClick={() => this.navigate('loggUt')}
              className="w-full flex items-center gap-3 px-5 py-3 text-left text-rose-500 hover:bg-rose-50 transition-colors text-sm font-medium"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Logg ut
            </button>
          </div>
        </aside>
      </>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  headerTekst: state.config.headerTekst,
  erAdmin: state.innloggetBruker.erAdmin || false,
  innloggetBrukerNavn: state.innloggetBruker.navn,
  ulesteFeedback: state.innloggetBruker.ulesteFeedback,
  tilbakemeldingEnabled: state.config.tilbakemeldingEnabled,
  pathname: (state.router as any)?.location?.pathname || window.location.pathname,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onAapneNySide: (id: string) => dispatch(push(id)),
  onLogOut: () => dispatch(logOut() as any),
  onOpprettNyListe: () => dispatch(settOpprettListeDialogOpen(true)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AppBarComponent);
