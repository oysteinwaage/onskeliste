import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Plus, Settings } from 'lucide-react';

import {
  removeWishFromMyList,
  removeWishFromExtraList,
  updateFavorittWithSortOrder,
  slettKjopteOnsker,
  slettKjopteOnskerPaaEkstraListe,
} from '../Api';
import { toggleLenkeDialog, endreHeaderTekst, settAktivListeId, settOpprettListeDialogOpen } from '../actions/actions';
import OnskeDialog from './LeggTilOnskeDialog';
import OpprettListeDialog from './OpprettListeDialog';
import { SortableOnskeliste } from './SortableOnskeliste';
import { RootState, Onske, ExtraListMetadata, Bruker } from '../types';
import { Dispatch } from 'redux';
import { Button } from '../components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../components/ui/tooltip';
import { nextSortOrder, firstSortOrder } from '../utils/sortUtils';

interface MinListeLocalState {
  administrerListe: ExtraListMetadata | null;
}

interface MinListeProps {
  onToggleLenkeDialog: (index: Partial<Onske> | undefined) => void;
  onEndreHeaderTekst: (nyTekst: string) => void;
  onSettAktivListeId: (listId: string | null) => void;
  onLukkOpprettListeDialog: () => void;
  innloggetBrukerNavn: string;
  myUid: string;
  mineOnsker: Onske[];
  slettKjopteOnskerEnabled: boolean;
  mineEkstraLister: ExtraListMetadata[];
  alleEkstraListeOnsker: Record<string, Onske[]>;
  opprettListeDialogOpen: boolean;
  alleBrukere: Bruker[];
  mainListName?: string;
}

class MinListe extends Component<MinListeProps, MinListeLocalState> {
  state: MinListeLocalState = { administrerListe: null };

  componentDidMount() {
    this.props.onEndreHeaderTekst('Rediger ønskeliste');
  }

  aapneDialog = (onske: Partial<Onske> | null, listId: string | null): void => {
    const { onSettAktivListeId, onToggleLenkeDialog } = this.props;
    onSettAktivListeId(listId);
    onToggleLenkeDialog(onske || undefined);
  };

  slettOnske = (onske: Onske, listId: string | null): void => {
    if (listId) {
      removeWishFromExtraList(listId, onske.key);
    } else {
      removeWishFromMyList(onske.key);
    }
  };

  settFavoritt = (onske: Onske, erFavoritt: boolean, listId: string | null): void => {
    const allOnsker = listId
      ? (this.props.alleEkstraListeOnsker[listId] || [])
      : this.props.mineOnsker;
    const sortOrder = erFavoritt
      ? nextSortOrder(allOnsker, erFavoritt)
      : firstSortOrder(allOnsker, erFavoritt);
    updateFavorittWithSortOrder(onske.key, erFavoritt, sortOrder, listId);
  };

  lagAntallOgStrlTekst = (onske: Onske): string => {
    let res = (onske.antall && onske.antall > 1) ? `Antall: ${onske.antall}` : '';
    if (onske.onskeSize) {
      res = res ? res.concat(` · Strl: ${onske.onskeSize}`) : `Strl: ${onske.onskeSize}`;
    }
    return res;
  };

  renderOnskeliste(onsker: Onske[], listId: string | null) {
    return (
      <SortableOnskeliste
        onsker={onsker}
        listId={listId}
        onSettFavoritt={(onske, erFavoritt) => this.settFavoritt(onske, erFavoritt, listId)}
        onSlett={(onske) => this.slettOnske(onske, listId)}
        onEdit={(onske) => this.aapneDialog(onske, listId)}
        lagAntallOgStrlTekst={this.lagAntallOgStrlTekst}
      />
    );
  }

  render() {
    const {
      myUid, mineOnsker, slettKjopteOnskerEnabled,
      mineEkstraLister, alleEkstraListeOnsker,
      opprettListeDialogOpen, onLukkOpprettListeDialog, alleBrukere, mainListName,
    } = this.props;
    const { administrerListe } = this.state;

    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Hovedliste */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-800">{mainListName || 'Min ønskeliste'}</h2>
              <div className="flex items-center gap-2">
                {slettKjopteOnskerEnabled && (
                  <Button variant="outline-destructive" size="sm" onClick={() => slettKjopteOnsker(mineOnsker)}>
                    Slett kjøpte ønsker
                  </Button>
                )}
                <Button size="sm" onClick={() => this.aapneDialog(null, null)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Ønske
                </Button>
              </div>
            </div>
          </div>
          <div>
            {mineOnsker.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-8">Ingen ønsker lagt til ennå</p>
            ) : (
              this.renderOnskeliste(mineOnsker, null)
            )}
          </div>
        </div>

        {/* Ekstra lister */}
        {mineEkstraLister.map(liste => {
          const onsker = alleEkstraListeOnsker[liste.key] || [];
          const otherUid = liste.sharedWithUid
            ? (liste.ownerUid === myUid ? liste.sharedWithUid : liste.ownerUid)
            : null;
          const otherUser = otherUid ? alleBrukere.find(b => b.uid === otherUid) : null;

          return (
            <div key={liste.key} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base font-semibold text-slate-800">{liste.name}</h2>
                    {otherUser && (
                      <p className="text-xs text-slate-400 mt-0.5">Delt liste med {otherUser.navn}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {slettKjopteOnskerEnabled && (
                      <Button variant="outline-destructive" size="sm" onClick={() => slettKjopteOnskerPaaEkstraListe(liste.key, onsker)}>
                        Slett kjøpte ønsker
                      </Button>
                    )}
                    <Button size="sm" onClick={() => this.aapneDialog(null, liste.key)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Ønske
                    </Button>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => this.setState({ administrerListe: liste })}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Administrer liste</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>

              <div>
                {onsker.length === 0 ? (
                  <p className="text-center text-slate-400 text-sm py-6">Ingen ønsker lagt til ennå</p>
                ) : (
                  this.renderOnskeliste(onsker, liste.key)
                )}
              </div>
            </div>
          );
        })}

        <OnskeDialog />

        <OpprettListeDialog
          open={opprettListeDialogOpen}
          onClose={onLukkOpprettListeDialog}
        />

        {administrerListe && (
          <OpprettListeDialog
            open={true}
            onClose={() => this.setState({ administrerListe: null })}
            editListe={administrerListe}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  innloggetBrukerNavn: state.innloggetBruker.navn,
  myUid: state.innloggetBruker.uid || '',
  mineOnsker: state.innloggetBruker.mineOnsker,
  slettKjopteOnskerEnabled: state.config.slettKjopteOnskerEnabled,
  mineEkstraLister: state.innloggetBruker.mineEkstraLister,
  alleEkstraListeOnsker: state.innloggetBruker.alleEkstraListeOnsker,
  opprettListeDialogOpen: state.innloggetBruker.opprettListeDialogOpen,
  alleBrukere: state.config.brukere,
  mainListName: state.innloggetBruker.mainListName,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onToggleLenkeDialog: (index: Partial<Onske> | undefined) => dispatch(toggleLenkeDialog(index)),
  onEndreHeaderTekst: (nyTekst: string) => dispatch(endreHeaderTekst(nyTekst)),
  onSettAktivListeId: (listId: string | null) => dispatch(settAktivListeId(listId)),
  onLukkOpprettListeDialog: () => dispatch(settOpprettListeDialogOpen(false)),
});

export default connect(mapStateToProps, mapDispatchToProps)(MinListe);
