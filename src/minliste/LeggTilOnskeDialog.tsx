import React, { Component } from 'react';
import { Loader2, Plus, X } from 'lucide-react';

import {
  addWishToMyList,
  addWishToExtraList,
  updateAntallOnMyList,
  updateUrlsOnWishOnMyList,
  updateSizeOnMyList,
  updateWishTextOnMyList,
  updateWishFieldsOnExtraList,
} from "../Api";
import { connect } from 'react-redux';
import { toggleLenkeDialog } from '../actions/actions';
import { opprettUrlAv } from "../utils/util";
import { RootState, Onske } from '../types';
import { Dispatch } from 'redux';
import { sokPrisjakt, PrisjaktProdukt } from '../services/PrisjaktService';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogBody,
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

interface DialogState {
  urls: string[] | null;
  text: string | null;
  size: string | null;
  antall: number | string;
  antallChanged: boolean;
  urlsChanged: boolean;
  sizeChanged: boolean;
  textChanged: boolean;
  sokeResultater: PrisjaktProdukt[];
  lasterSok: boolean;
  sokeApen: boolean;
}

const initState: DialogState = {
  urls: null,
  text: null,
  size: null,
  antall: '',
  antallChanged: false,
  urlsChanged: false,
  sizeChanged: false,
  textChanged: false,
  sokeResultater: [],
  lasterSok: false,
  sokeApen: false,
};

const antallOnskerValg = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

interface LeggTilOnskeDialogProps {
  openLenkeDialog: boolean;
  openLenkeDialogOnske: Partial<Onske>;
  onToggleLenkeDialog: () => void;
  aktiveListeId: string | null;
  mineEkstraLister: import('../types').ExtraListMetadata[];
  myUid: string | undefined;
  alleBrukere: import('../types').Bruker[];
}

class LeggTilOnskeDialog extends Component<LeggTilOnskeDialogProps, DialogState> {
  private sokeTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(props: LeggTilOnskeDialogProps) {
    super(props);
    this.state = { ...initState };
  }

  componentWillUnmount() {
    if (this.sokeTimer) clearTimeout(this.sokeTimer);
  }

  resettState = (): void => {
    if (this.sokeTimer) clearTimeout(this.sokeTimer);
    this.setState(initState);
  };

  cancel = (): void => {
    const { onToggleLenkeDialog } = this.props;
    onToggleLenkeDialog();
    this.resettState();
  };

  onKeyPressed = (event: React.KeyboardEvent): void => {
    const { openLenkeDialogOnske } = this.props;
    const harTekst = this.state.text || (openLenkeDialogOnske && openLenkeDialogOnske.onskeTekst);
    if (event.key === 'Enter' && harTekst) {
      event.preventDefault();
      this.saveChanges();
    }
  };

  getEffectiveUrls = (): string[] => {
    const { openLenkeDialogOnske } = this.props;
    const { urls } = this.state;
    if (urls !== null) return urls;
    return openLenkeDialogOnske.urls ||
      (openLenkeDialogOnske.url ? [openLenkeDialogOnske.url] : []);
  };

  addUrl = (): void => {
    const current = this.getEffectiveUrls();
    this.setState({ urls: [...current, ''], urlsChanged: true });
  };

  removeUrl = (index: number): void => {
    const current = this.getEffectiveUrls();
    const updated = current.filter((_, i) => i !== index);
    this.setState({ urls: updated, urlsChanged: true });
  };

  updateUrl = (index: number, value: string): void => {
    const current = this.getEffectiveUrls();
    const updated = current.map((u, i) => i === index ? value : u);
    this.setState({ urls: updated, urlsChanged: true });
  };

  handleTextEndring = (value: string): void => {
    this.setState({ text: value, textChanged: true });

    if (this.sokeTimer) clearTimeout(this.sokeTimer);

    if (value.trim().length >= 2) {
      this.sokeTimer = setTimeout(async () => {
        this.setState({ lasterSok: true });
        const resultater = await sokPrisjakt(value);
        this.setState({ sokeResultater: resultater, lasterSok: false, sokeApen: resultater.length > 0 });
      }, 350);
    } else {
      this.setState({ sokeResultater: [], lasterSok: false, sokeApen: false });
    }
  };

  velgProdukt = (produkt: PrisjaktProdukt): void => {
    const navarendeUrls = this.getEffectiveUrls().filter(u => u.trim());
    const harAlleredeUrl = navarendeUrls.includes(produkt.url);
    const nyeUrls = harAlleredeUrl ? navarendeUrls : [...navarendeUrls, produkt.url];

    this.setState({
      text: produkt.navn,
      textChanged: true,
      urls: nyeUrls,
      urlsChanged: true,
      sokeResultater: [],
      lasterSok: false,
      sokeApen: false,
    });
  };

  saveChanges = (): void => {
    const { openLenkeDialogOnske, onToggleLenkeDialog, aktiveListeId } = this.props;
    const effectiveUrls = this.getEffectiveUrls().filter(u => u.trim());
    const cleanedUrls = effectiveUrls.map(u => opprettUrlAv(u) as string).filter(Boolean);

    if (!openLenkeDialogOnske.key) {
      const newWish = {
        onskeTekst: this.state.text || '',
        ...(cleanedUrls.length > 0 ? { urls: cleanedUrls } : {}),
        antall: (this.state.antall as number) || 1,
        onskeSize: this.state.size as string | undefined
      };
      if (aktiveListeId) {
        addWishToExtraList(aktiveListeId, newWish);
      } else {
        addWishToMyList(newWish);
      }
    } else {
      if (aktiveListeId) {
        const updates: any = {};
        if (this.state.urlsChanged) {
          const cleaned = effectiveUrls.map(u => opprettUrlAv(u) as string).filter(Boolean);
          updates.urls = cleaned.length > 0 ? cleaned : null;
          updates.url = null;
        }
        if (this.state.textChanged && this.state.text) updates.onskeTekst = this.state.text;
        if (this.state.antallChanged) updates.antall = this.state.antall;
        if (this.state.sizeChanged) updates.onskeSize = this.state.size;
        if (Object.keys(updates).length > 0) {
          updateWishFieldsOnExtraList(aktiveListeId, openLenkeDialogOnske.key, updates);
        }
      } else {
        if (this.state.urlsChanged) {
          updateUrlsOnWishOnMyList(effectiveUrls, openLenkeDialogOnske.key);
        }
        if (this.state.textChanged && this.state.text) {
          updateWishTextOnMyList(this.state.text, openLenkeDialogOnske.key);
        }
        if (this.state.antallChanged) {
          updateAntallOnMyList(this.state.antall, openLenkeDialogOnske.key);
        }
        if (this.state.sizeChanged) {
          updateSizeOnMyList(this.state.size, openLenkeDialogOnske.key);
        }
      }
    }
    onToggleLenkeDialog();
    this.resettState();
  };

  render() {
    const { openLenkeDialog, openLenkeDialogOnske, aktiveListeId, mineEkstraLister, myUid, alleBrukere } = this.props;
    const { text, size, antall, sokeResultater, lasterSok, sokeApen } = this.state;
    const defaultText = openLenkeDialogOnske && openLenkeDialogOnske.onskeTekst;
    const defaultSize = openLenkeDialogOnske && openLenkeDialogOnske.onskeSize;
    const defaultAntall = (openLenkeDialogOnske && openLenkeDialogOnske.antall) || '';
    const erNyttOnske = !(openLenkeDialogOnske && openLenkeDialogOnske.key);
    const effectiveUrls = this.getEffectiveUrls();
    const textVerdi = text !== null ? text : (defaultText || '');
    const antallVerdi = antall || defaultAntall;

    const isMobile = window.matchMedia('(max-width: 599px)').matches;

    return (
      <Dialog
        open={openLenkeDialog}
        onOpenChange={(open) => { if (!open) this.cancel(); }}
      >
        <DialogContent fullScreen={isMobile} showClose={false} className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {(() => {
                if (!erNyttOnske) return 'Oppdater ønske';
                if (!aktiveListeId) return 'Legg til ønske';
                const aktivListe = mineEkstraLister.find(l => l.key === aktiveListeId);
                const otherUid = aktivListe?.sharedWithUid
                  ? (aktivListe.ownerUid === myUid ? aktivListe.sharedWithUid : aktivListe.ownerUid)
                  : null;
                const otherNavn = otherUid ? alleBrukere.find(b => b.uid === otherUid)?.navn : null;
                return (
                  <>
                    {`Legg til ønske - ${aktivListe?.name ?? ''}`}
                    {otherNavn && <span className="text-sm font-normal text-slate-400 ml-1">med {otherNavn}</span>}
                  </>
                );
              })()}
            </DialogTitle>
            <DialogDescription>
              {erNyttOnske
                ? 'Ønsketekst er eneste obligatoriske felt, men jo mer informasjon du legger inn jo bedre!'
                : 'Du kan legge til og fjerne lenker ved å bruke knappene under.'}
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="flex flex-col gap-4">
            {/* Tekst-søk med Prisjakt-autofullføring */}
            <div className="relative">
              <div className="relative">
                <input
                  autoFocus
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 hover:border-slate-400 transition-colors pr-8"
                  placeholder="Hva ønsker du deg?"
                  value={textVerdi}
                  onChange={(e) => this.handleTextEndring(e.target.value)}
                  onKeyDown={this.onKeyPressed}
                />
                {lasterSok && (
                  <Loader2 className="absolute right-2.5 top-2.5 h-5 w-5 animate-spin text-slate-400" />
                )}
              </div>

              {/* Prisjakt søkeresultater */}
              {sokeApen && sokeResultater.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-slate-50">
                    <span className="text-xs text-slate-500">Forslag fra prisjakt.no</span>
                    <button
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => this.setState({ sokeResultater: [], sokeApen: false })}
                    >
                      Lukk
                    </button>
                  </div>
                  <ul className="max-h-60 overflow-y-auto py-1">
                    {sokeResultater.map(produkt => (
                      <li key={produkt.id}>
                        <button
                          className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-primary-50 transition-colors"
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => this.velgProdukt(produkt)}
                        >
                          <img
                            src={produkt.bildeUrl}
                            alt=""
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            className="w-10 h-10 object-contain flex-shrink-0 rounded"
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm text-slate-800 truncate">{produkt.navn}</span>
                            {produkt.pris != null && (
                              <span className="text-xs text-slate-500">
                                Fra kr {produkt.pris.toLocaleString('nb-NO')},-
                              </span>
                            )}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Antall og størrelse */}
            <div className="flex items-end gap-3">
              <div className="w-24">
                <label className="text-sm font-medium text-slate-700 block mb-1">Antall</label>
                <Select
                  value={String(antallVerdi)}
                  onValueChange={(val) => this.setState({ antall: Number(val), antallChanged: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    {antallOnskerValg.map(n => (
                      <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-28">
                <Input
                  id="size"
                  label="Størrelse"
                  value={size !== null ? size : (defaultSize || '')}
                  placeholder="M, 42, ..."
                  onChange={(e) => this.setState({ size: e.target.value, sizeChanged: true })}
                  onKeyDown={this.onKeyPressed}
                />
              </div>
            </div>

            {/* Lenker */}
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Lenker</label>
              <div className="flex flex-col gap-2">
                {effectiveUrls.map((url, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      className="flex-1 h-9 rounded-md border border-slate-300 bg-white px-3 py-1.5 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 hover:border-slate-400 transition-colors"
                      type="url"
                      placeholder={effectiveUrls.length > 1 ? `Lenke ${index + 1}` : 'http://www.eksempel.com'}
                      value={url}
                      onChange={(e) => this.updateUrl(index, e.target.value)}
                      onKeyDown={this.onKeyPressed}
                    />
                    <button
                      onClick={() => this.removeUrl(index)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                      aria-label="Fjern lenke"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={this.addUrl}
                  className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium mt-1 self-start"
                >
                  <Plus className="h-4 w-4" />
                  Legg til lenke
                </button>
              </div>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button variant="ghost" onClick={() => this.cancel()}>Avbryt</Button>
            <Button
              disabled={(!text && !openLenkeDialogOnske.onskeTekst) || text === ''}
              onClick={() => this.saveChanges()}
            >
              Lagre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  openLenkeDialog: state.innloggetBruker.openLenkeDialog,
  openLenkeDialogOnske: state.innloggetBruker.openLenkeDialogOnske,
  aktiveListeId: state.innloggetBruker.aktiveListeId,
  mineEkstraLister: state.innloggetBruker.mineEkstraLister,
  myUid: state.innloggetBruker.uid,
  alleBrukere: state.config.brukere,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onToggleLenkeDialog: () => dispatch(toggleLenkeDialog()),
});

export default connect(mapStateToProps, mapDispatchToProps)(LeggTilOnskeDialog);
