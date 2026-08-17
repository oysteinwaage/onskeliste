import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Plus, Settings } from 'lucide-react';

import {
  removeWishFromCurrentList,
  removeWishFromExtraList,
  updateFavorittWithSortOrder,
  slettKjopteOnsker,
  slettKjopteOnskerPaaEkstraListe,
  startAdministrerBruker,
  avsluttAdministrerBruker,
} from '../Api';
import { toggleLenkeDialog, endreHeaderTekst, settAktivListeId, settOpprettListeDialogOpen } from '../actions/actions';
import OnskeDialog from './LeggTilOnskeDialog';
import OpprettListeDialog from './OpprettListeDialog';
import TilbakemeldingModal from '../tilbakemelding/TilbakemeldingModal';
import { SortableOnskeliste } from './SortableOnskeliste';
import { RootState, Onske, ExtraListMetadata, Bruker } from '../types';
import { Dispatch } from 'redux';
import { Button } from '../components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../components/ui/tooltip';
import { nextSortOrder, firstSortOrder } from '../utils/sortUtils';

interface MinListeLocalState {
  administrerListe: ExtraListMetadata | null;
  tilbakemeldingModalOpen: boolean;
}

interface MinListeProps {
  onToggleLenkeDialog: (index: Partial<Onske> | undefined) => void;
  onEndreHeaderTekst: (nyTekst: string) => void;
  onSettAktivListeId: (listId: string | null, ownerUid: string) => void;
  onLukkOpprettListeDialog: () => void;
  onStartAdministrerBruker: (uid: string, navn: string, mainListName?: string) => void;
  onAvsluttAdministrerBruker: () => void;
  innloggetBrukerNavn: string;
  myUid: string;
  mineOnsker: Onske[];
  slettKjopteOnskerEnabled: boolean;
  mineEkstraLister: ExtraListMetadata[];
  alleEkstraListeOnsker: Record<string, Onske[]>;
  opprettListeDialogOpen: boolean;
  alleBrukere: Bruker[];
  mainListName?: string;
  adminListsForMe: string[];
  administrertUid: string | null;
  administrertNavn: string;
  administrertMainListName?: string;
  administrertOnsker: Onske[];
  administrertEkstraLister: ExtraListMetadata[];
  administrertAlleEkstraListeOnsker: Record<string, Onske[]>;
}

class MinListe extends Component<MinListeProps, MinListeLocalState> {
  state: MinListeLocalState = { administrerListe: null, tilbakemeldingModalOpen: false };

  componentDidMount() {
    this.props.onEndreHeaderTekst('Rediger ønskeliste');
  }

  velgAdministrertBruker = (uid: string | null): void => {
    const { alleBrukere, onStartAdministrerBruker, onAvsluttAdministrerBruker } = this.props;
    if (!uid) {
      onAvsluttAdministrerBruker();
      return;
    }
    const bruker = alleBrukere.find(b => b.uid === uid);
    if (!bruker) return;
    onStartAdministrerBruker(uid, bruker.navn, bruker.mainListName);
  };

  getListOwnerUid = (): string => this.props.administrertUid || this.props.myUid;

  aapneDialog = (onske: Partial<Onske> | null, listId: string | null): void => {
    const { onSettAktivListeId, onToggleLenkeDialog } = this.props;
    onSettAktivListeId(listId, this.getListOwnerUid());
    onToggleLenkeDialog(onske || undefined);
  };

  slettOnske = (onske: Onske, listId: string | null): void => {
    if (listId) {
      removeWishFromExtraList(listId, onske.key);
    } else {
      removeWishFromCurrentList(this.getListOwnerUid(), onske.key);
    }
  };

  settFavoritt = (onske: Onske, erFavoritt: boolean, listId: string | null): void => {
    const { administrertUid, mineOnsker, administrertOnsker, alleEkstraListeOnsker, administrertAlleEkstraListeOnsker } = this.props;
    const ekstraListeOnsker = administrertUid ? administrertAlleEkstraListeOnsker : alleEkstraListeOnsker;
    const allOnsker = listId
      ? (ekstraListeOnsker[listId] || [])
      : (administrertUid ? administrertOnsker : mineOnsker);
    const sortOrder = erFavoritt
      ? nextSortOrder(allOnsker, erFavoritt)
      : firstSortOrder(allOnsker, erFavoritt);
    updateFavorittWithSortOrder(onske.key, erFavoritt, sortOrder, listId, this.getListOwnerUid());
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
        ownerUid={this.getListOwnerUid()}
        onSettFavoritt={(onske, erFavoritt) => this.settFavoritt(onske, erFavoritt, listId)}
        onSlett={(onske) => this.slettOnske(onske, listId)}
        onEdit={(onske) => this.aapneDialog(onske, listId)}
        lagAntallOgStrlTekst={this.lagAntallOgStrlTekst}
      />
    );
  }

  render() {
    const {
      mineOnsker, slettKjopteOnskerEnabled,
      mineEkstraLister, alleEkstraListeOnsker,
      opprettListeDialogOpen, onLukkOpprettListeDialog, alleBrukere, mainListName,
      adminListsForMe, administrertUid, administrertNavn, administrertMainListName,
      administrertOnsker, administrertEkstraLister, administrertAlleEkstraListeOnsker,
    } = this.props;
    const { administrerListe } = this.state;

    const listOwnerUid = this.getListOwnerUid();
    const visteOnsker = administrertUid ? administrertOnsker : mineOnsker;
    const visteEkstraLister = administrertUid ? administrertEkstraLister : mineEkstraLister;
    const visteAlleEkstraListeOnsker = administrertUid ? administrertAlleEkstraListeOnsker : alleEkstraListeOnsker;
    const visteMainListName = administrertUid ? (administrertMainListName || `${administrertNavn} sin ønskeliste`) : (mainListName || 'Min ønskeliste');

    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Bytt mellom egen liste og lister man administrerer for andre */}
        {adminListsForMe.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              size="sm"
              variant={administrertUid ? 'outline' : 'default'}
              onClick={() => this.velgAdministrertBruker(null)}
            >
              Meg selv
            </Button>
            {adminListsForMe.map(uid => {
              const bruker = alleBrukere.find(b => b.uid === uid);
              if (!bruker) return null;
              return (
                <Button
                  key={uid}
                  size="sm"
                  variant={administrertUid === uid ? 'default' : 'outline'}
                  onClick={() => this.velgAdministrertBruker(uid)}
                >
                  {bruker.navn}
                </Button>
              );
            })}
          </div>
        )}

        {/* Hovedliste */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-800">{visteMainListName}</h2>
              <div className="flex items-center gap-2">
                {slettKjopteOnskerEnabled && (
                  <Button variant="outline-destructive" size="sm" onClick={() => slettKjopteOnsker(visteOnsker, listOwnerUid)}>
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
            {visteOnsker.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-8">Ingen ønsker lagt til ennå</p>
            ) : (
              this.renderOnskeliste(visteOnsker, null)
            )}
          </div>
        </div>

        {/* Ekstra lister */}
        {visteEkstraLister.map(liste => {
          const onsker = visteAlleEkstraListeOnsker[liste.key] || [];
          const otherUid = liste.sharedWithUid
            ? (liste.ownerUid === listOwnerUid ? liste.sharedWithUid : liste.ownerUid)
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

        <p className="text-center text-xs text-slate-400 mt-2 mb-6">
          Har du forslag til forbedringer, ny funksjonalitet eller vil melde en feil? Det kan du gjøre{' '}
          <button
            onClick={() => this.setState({ tilbakemeldingModalOpen: true })}
            className="underline text-slate-500 hover:text-slate-700 transition-colors"
          >
            her
          </button>.
        </p>

        <TilbakemeldingModal
          open={this.state.tilbakemeldingModalOpen}
          onClose={() => this.setState({ tilbakemeldingModalOpen: false })}
        />

        <OnskeDialog />

        <OpprettListeDialog
          open={opprettListeDialogOpen}
          onClose={onLukkOpprettListeDialog}
          actingAsUid={listOwnerUid}
        />

        {administrerListe && (
          <OpprettListeDialog
            open={true}
            onClose={() => this.setState({ administrerListe: null })}
            editListe={administrerListe}
            actingAsUid={listOwnerUid}
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
  adminListsForMe: state.administrasjon.adminListsForMe,
  administrertUid: state.administrasjon.aktivUid,
  administrertNavn: state.administrasjon.navn,
  administrertMainListName: state.administrasjon.mainListName,
  administrertOnsker: state.administrasjon.onsker,
  administrertEkstraLister: state.administrasjon.ekstraLister,
  administrertAlleEkstraListeOnsker: state.administrasjon.alleEkstraListeOnsker,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onToggleLenkeDialog: (index: Partial<Onske> | undefined) => dispatch(toggleLenkeDialog(index)),
  onEndreHeaderTekst: (nyTekst: string) => dispatch(endreHeaderTekst(nyTekst)),
  onSettAktivListeId: (listId: string | null, ownerUid: string) => dispatch(settAktivListeId(listId, ownerUid)),
  onLukkOpprettListeDialog: () => dispatch(settOpprettListeDialogOpen(false)),
  onStartAdministrerBruker: (uid: string, navn: string, mainListName?: string) =>
    dispatch(startAdministrerBruker(uid, navn, mainListName) as any),
  onAvsluttAdministrerBruker: () => dispatch(avsluttAdministrerBruker() as any),
});

export default connect(mapStateToProps, mapDispatchToProps)(MinListe);
