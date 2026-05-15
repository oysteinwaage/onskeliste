import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import {
  List, Gift, ShoppingCart, User, LogOut,
  Menu, X, PlusSquare, Shield,
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
  onAapneNySide: (id: string) => void;
  onLogOut: () => void;
  onOpprettNyListe: () => void;
}

const navItems = [
  { key: 'minliste', label: 'Min ønskeliste', icon: List },
  { key: 'vennelister', label: 'Venners lister', icon: Gift },
  { key: 'minekjoep', label: 'Mine kjøp', icon: ShoppingCart },
  { key: 'profil', label: 'Profil', icon: User },
];

class AppBarComponent extends Component<AppBarComponentProps, AppBarState> {
  constructor(props: AppBarComponentProps) {
    super(props);
    this.state = { drawerOpen: false };
  }

  menyValgTrykket(valg: string): void {
    switch (valg) {
      case 'vennelister':
      case 'minliste':
      case 'profil':
      case 'minekjoep':
      case 'admin':
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
    const { headerTekst, erAdmin, onOpprettNyListe } = this.props;
    const { drawerOpen } = this.state;
    const visHamburgerMeny = headerTekst !== 'Innlogging' && headerTekst !== 'Opprett ny bruker' && headerTekst !== 'Resett passord';
    const erPaaMinListe = headerTekst === 'Rediger ønskeliste';

    return (
      <>
        <header className="bg-primary-900 text-white shadow-md z-40 relative">
          <div className="flex items-center h-14 px-4 gap-3">
            {visHamburgerMeny && (
              <button
                onClick={() => this.setState({ drawerOpen: true })}
                className="p-2 rounded-lg hover:bg-primary-800 transition-colors -ml-1"
                aria-label="Åpne meny"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
            <h1 className="text-base font-semibold flex-1 text-center">
              {headerTekst}
            </h1>
            {erPaaMinListe && (
              <button
                onClick={onOpprettNyListe}
                className="p-2 rounded-lg hover:bg-primary-800 transition-colors -mr-1"
                aria-label="Ny liste"
              >
                <PlusSquare className="h-5 w-5" />
              </button>
            )}
            {!erPaaMinListe && <div className="w-9" />}
          </div>
        </header>

        {/* Drawer overlay */}
        {drawerOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            onClick={() => this.setState({ drawerOpen: false })}
          />
        )}

        {/* Drawer */}
        <aside
          className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ${
            drawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between px-4 py-4 bg-primary-900 text-white">
            <span className="font-bold text-lg">Ønskeliste</span>
            <button
              onClick={() => this.setState({ drawerOpen: false })}
              className="p-1.5 rounded-lg hover:bg-primary-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 py-2 overflow-y-auto">
            {navItems.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => this.menyValgTrykket(key)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-700 hover:bg-primary-50 hover:text-primary-700 transition-colors text-sm font-medium"
              >
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </button>
            ))}
          </nav>

          <div className="py-2 border-t border-slate-100">
            {erAdmin && (
              <button
                onClick={() => this.menyValgTrykket('admin')}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-700 hover:bg-primary-50 hover:text-primary-700 transition-colors text-sm font-medium"
              >
                <Shield className="h-5 w-5 shrink-0" />
                Admin
              </button>
            )}
            <button
              onClick={() => this.menyValgTrykket('loggUt')}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-rose-600 hover:bg-rose-50 transition-colors text-sm font-medium"
            >
              <LogOut className="h-5 w-5 shrink-0" />
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
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onAapneNySide: (id: string) => dispatch(push(id)),
  onLogOut: () => dispatch(logOut() as any),
  onOpprettNyListe: () => dispatch(settOpprettListeDialogOpen(true)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AppBarComponent);
