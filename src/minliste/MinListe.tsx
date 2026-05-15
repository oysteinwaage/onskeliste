import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Plus, Trash2, Edit2, Star, Settings } from 'lucide-react';

import {
  removeWishFromMyList,
  removeWishFromExtraList,
  updateFavorittOnMyWish,
  updateWishFieldsOnExtraList,
  slettKjopteOnsker,
  slettKjopteOnskerPaaEkstraListe,
} from '../Api';
import { toggleLenkeDialog, endreHeaderTekst, settAktivListeId, settOpprettListeDialogOpen } from '../actions/actions';
import OnskeDialog from './LeggTilOnskeDialog';
import OpprettListeDialog from './OpprettListeDialog';
import { RootState, Onske, ExtraListMetadata, Bruker } from '../types';
import { Dispatch } from 'redux';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '../components/ui/tooltip';

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
    if (listId) {
      updateWishFieldsOnExtraList(listId, onske.key, { favoritt: erFavoritt });
    } else {
      updateFavorittOnMyWish(onske.key, erFavoritt);
    }
  };

  lagAntallOgStrlTekst = (onske: Onske): string => {
    let res = (onske.antall && onske.antall > 1) ? `Antall: ${onske.antall}` : '';
    if (onske.onskeSize) {
      res = res ? res.concat(` · Strl: ${onske.onskeSize}`) : `Strl: ${onske.onskeSize}`;
    }
    return res;
  };

  populerListe(onsker: Onske[], listId: string | null) {
    const sorted = [...onsker].sort((a, b) => (!a.favoritt ? 1 : 0) - (!b.favoritt ? 1 : 0));
    return sorted.map((onske, idx) => {
      const allUrls = onske.urls || (onske.url ? [onske.url] : []);
      const metaTekst = this.lagAntallOgStrlTekst(onske);
      return (
        <div key={onske.key || idx}>
          <div className="flex items-start gap-2 py-3 px-2">
            <button
              onClick={() => this.settFavoritt(onske, !onske.favoritt, listId)}
              className="mt-0.5 shrink-0 transition-colors"
              aria-label={onske.favoritt ? 'Fjern favoritt' : 'Merk som favoritt'}
            >
              <Star
                className={`h-5 w-5 ${onske.favoritt ? 'fill-amber-400 text-amber-400' : 'text-slate-300 hover:text-amber-300'} transition-colors`}
              />
            </button>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 break-words">{onske.onskeTekst}</p>
              {allUrls.length === 1 && (
                <a href={allUrls[0]} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-primary-600 hover:text-primary-700 underline underline-offset-1">
                  Her kan den kjøpes
                </a>
              )}
              {allUrls.length > 1 && (
                <span className="text-xs text-primary-600">
                  {allUrls.map((url, i) => (
                    <React.Fragment key={i}>
                      <a href={url} target="_blank" rel="noopener noreferrer"
                        className="hover:text-primary-700 underline underline-offset-1">
                        Lenke {i + 1}
                      </a>
                      {i < allUrls.length - 1 && <span className="mx-1 text-slate-300">·</span>}
                    </React.Fragment>
                  ))}
                </span>
              )}
              {metaTekst && (
                <p className="text-xs text-slate-400 mt-0.5">{metaTekst}</p>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => this.aapneDialog(onske, listId)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                    aria-label="Endre ønske"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Endre ønske</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => this.slettOnske(onske, listId)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    aria-label="Slett"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Slett ønske</TooltipContent>
              </Tooltip>
            </div>
          </div>
          <Separator />
        </div>
      );
    });
  }

  render() {
    const {
      innloggetBrukerNavn, myUid, mineOnsker, slettKjopteOnskerEnabled,
      mineEkstraLister, alleEkstraListeOnsker,
      opprettListeDialogOpen, onLukkOpprettListeDialog, alleBrukere, mainListName,
    } = this.props;
    const { administrerListe } = this.state;

    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <p className="text-center text-slate-500 text-sm mb-4">Velkommen, {innloggetBrukerNavn}</p>

        {/* Legg til ønske / slett-knapper */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          <Button onClick={() => this.aapneDialog(null, null)} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Legg til ønske
          </Button>
          {slettKjopteOnskerEnabled && (
            <Button variant="outline-destructive" size="sm" onClick={() => slettKjopteOnsker(mineOnsker)}>
              Slett kjøpte ønsker
            </Button>
          )}
        </div>

        {/* Hovedliste */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
            <h2 className="text-base font-semibold text-slate-800">{mainListName || 'Min ønskeliste'}</h2>
          </div>
          <div>
            {mineOnsker.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-8">Ingen ønsker lagt til ennå</p>
            ) : (
              this.populerListe(mineOnsker, null)
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

              <div className="px-4 py-2 flex flex-wrap gap-2 justify-center">
                <Button size="sm" onClick={() => this.aapneDialog(null, liste.key)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Legg til ønske
                </Button>
                {slettKjopteOnskerEnabled && (
                  <Button variant="outline-destructive" size="sm"
                    onClick={() => slettKjopteOnskerPaaEkstraListe(liste.key, onsker)}>
                    Slett kjøpte ønsker
                  </Button>
                )}
              </div>

              <div>
                {onsker.length === 0 ? (
                  <p className="text-center text-slate-400 text-sm py-6">Ingen ønsker lagt til ennå</p>
                ) : (
                  this.populerListe(onsker, liste.key)
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
