import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Star } from 'lucide-react';

import ListeVelger from './ListeVelger';
import { endreHeaderTekst } from '../actions/actions';
import { updateWishOnListWith, updateWishOnExtraListWith } from '../Api';
import {
  alleOnskerTatt, antallAlleredeKjoptAvMeg,
  erInnloggetBrukersUid, finnLabelForStrl,
  inneholderInnloggetBrukersUid, kjoptListe,
  myWishlistId,
  totalValgt
} from '../utils/util';
import { RootState, Onske, Bruker, KjoptAv, ExtraListMetadata } from '../types';
import { Dispatch } from 'redux';
import { Separator } from '../components/ui/separator';
import { Button } from '../components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogBody,
} from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

interface VenneListerLocalState {
  dialogOpen: boolean;
  valgtOnske: Partial<Onske>;
  valgtListeId: string | null;
  antallValgt: number;
  prisDialogOpen: boolean;
  prisInput: string;
  prisPerStk: number | null;
}

const initLocalState: VenneListerLocalState = {
  dialogOpen: false, valgtOnske: {}, valgtListeId: null,
  antallValgt: 0, prisDialogOpen: false, prisInput: '', prisPerStk: null,
};

interface VenneListerProps {
  valgtVenn: Partial<Bruker>;
  valgtVennsListe: Onske[];
  valgtVennsEkstraLister: ExtraListMetadata[];
  valgtVennsAlleEkstraListeOnsker: Record<string, Onske[]>;
  onEndreHeaderTekst: (nyTekst: string) => void;
  mittNavn: string;
  alleBrukere: Bruker[];
}

class VenneLister extends Component<VenneListerProps, VenneListerLocalState> {
  state = initLocalState;

  resetLocalState = (): void => this.setState(initLocalState);

  componentDidMount() {
    this.props.onEndreHeaderTekst('Venners lister');
  }

  updateWishKjoep = (newValues: Partial<Onske>, wish: Onske): void => {
    const { valgtVenn } = this.props;
    const { valgtListeId } = this.state;
    if (valgtListeId) {
      updateWishOnExtraListWith(newValues, wish, valgtListeId);
    } else {
      updateWishOnListWith(newValues, wish, valgtVenn.uid as string);
    }
  };

  onMarkerOnskeSomKjopt = (onske: Onske, listId: string | null) => (_event: React.ChangeEvent<HTMLInputElement>): void => {
    if (onske.antall && onske.antall > 1) {
      const currentAntall = antallAlleredeKjoptAvMeg(onske);
      const myEntry = (onske.kjoptAvListe || []).find(e => erInnloggetBrukersUid(e.kjoptAv));
      const currentPris = myEntry?.pris ?? null;
      const prisPerStk = (currentPris != null && currentAntall > 0) ? currentPris / currentAntall : null;
      const prisInput = currentPris != null && currentAntall > 0 ? String(currentPris) : '';
      this.setState({ dialogOpen: true, valgtOnske: onske, valgtListeId: listId, antallValgt: currentAntall, prisInput, prisPerStk });
    } else {
      if (alleOnskerTatt(onske)) {
        this.setState({ valgtListeId: listId }, () => this.updateWishKjoep({ kjoptAvListe: [] }, onske));
      } else {
        this.setState({ prisDialogOpen: true, valgtOnske: onske, valgtListeId: listId, prisInput: '' });
      }
    }
  };

  saveSingleKjoep = (): void => {
    const { mittNavn } = this.props;
    const { valgtOnske, prisInput } = this.state;
    const parsedPris = prisInput.trim() ? Number(prisInput.replace(',', '.')) : undefined;
    const entry: KjoptAv = { antallKjopt: 1, kjoptAv: myWishlistId(), kjoptAvNavn: mittNavn };
    if (parsedPris !== undefined && !isNaN(parsedPris)) entry.pris = parsedPris;
    this.updateWishKjoep({ kjoptAvListe: [entry] }, valgtOnske as Onske);
    this.resetLocalState();
  };

  lenkeEllerKjoptAv(onske: Onske): React.ReactNode {
    if (alleOnskerTatt(onske)) {
      const tattAvNavn = kjoptListe(onske).reduce((acc: string, bruker) => {
        const navn = erInnloggetBrukersUid(bruker.kjoptAv) ? 'deg' : bruker.kjoptAvNavn;
        const antallTatt = bruker.antallKjopt > 1 ? ` (${bruker.antallKjopt})` : '';
        return acc.concat(navn, antallTatt, ', ');
      }, '').slice(0, -2);
      return 'Tatt av ' + (onske.antall === 1
        ? erInnloggetBrukersUid(onske.kjoptAvListe![0].kjoptAv) ? 'deg' : onske.kjoptAvListe![0].kjoptAvNavn
        : tattAvNavn);
    }
    const allUrls = onske.urls || (onske.url ? [onske.url] : []);
    if (allUrls.length === 0) return null;
    if (allUrls.length === 1) return (
      <a href={allUrls[0]} target="_blank" rel="noopener noreferrer"
        className="text-primary-600 hover:text-primary-700 underline underline-offset-1 text-xs">
        Her kan den kjøpes
      </a>
    );
    return (
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
    );
  }

  onMarkerOnskerSomKjopt = (): void => {
    const { mittNavn } = this.props;
    const { antallValgt, valgtOnske, prisInput } = this.state;
    const newKjoptAvListe = [...((valgtOnske.kjoptAvListe || []).filter(vo => vo.kjoptAv !== myWishlistId()))];
    const parsedPris = prisInput.trim() ? Number(prisInput.replace(',', '.')) : undefined;
    if (antallValgt > 0) {
      const entry: KjoptAv = { kjoptAv: myWishlistId(), antallKjopt: antallValgt, kjoptAvNavn: mittNavn };
      if (parsedPris !== undefined && !isNaN(parsedPris)) entry.pris = parsedPris;
      newKjoptAvListe.push(entry);
    }
    this.updateWishKjoep({ kjoptAvListe: newKjoptAvListe }, valgtOnske as Onske);
    this.resetLocalState();
  };

  lagAntallOgStrlTekst = (onske: Onske): string => {
    let res = '';
    if (onske.antall && onske.antall > 1 && !alleOnskerTatt(onske)) {
      const mittAntall = antallAlleredeKjoptAvMeg(onske);
      res = `Antall tatt: ${totalValgt(onske)}/${onske.antall}`;
      if (mittAntall > 0) res += ` · du har tatt ${mittAntall}`;
    }
    if (onske.onskeSize) {
      res = res ? res.concat(` · Strl: ${onske.onskeSize}`) : `Strl: ${onske.onskeSize}`;
    }
    return res;
  };

  populerOnskeliste = (onskeliste: Onske[], listId: string | null = null): React.ReactNode =>
    onskeliste.sort((a, b) => (!a.favoritt ? 1 : 0) - (!b.favoritt ? 1 : 0)).map((onske, idx) => {
      const erKjopt = alleOnskerTatt(onske);
      const erKjoptAvMeg = erKjopt && !!inneholderInnloggetBrukersUid(onske.kjoptAvListe);
      const metaTekst = this.lagAntallOgStrlTekst(onske);

      return (
        <div
          key={onske.onskeTekst + idx}
          className={erKjoptAvMeg ? 'bg-emerald-50' : erKjopt ? 'bg-rose-50' : ''}
        >
          <div className="flex items-start gap-2 py-3 px-3">
            {onske.favoritt && (
              <Star
                className={`h-5 w-5 shrink-0 mt-0.5 ${erKjopt ? 'fill-amber-300 text-amber-300' : 'fill-amber-400 text-amber-400'}`}
              />
            )}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium break-words ${erKjopt ? 'italic text-slate-500' : 'text-slate-800'}`}>
                {onske.onskeTekst}
              </p>
              <div className="mt-0.5">
                {this.lenkeEllerKjoptAv(onske)}
              </div>
              {metaTekst && (
                <p className="text-xs text-slate-400 mt-0.5">{metaTekst}</p>
              )}
            </div>

            <div className="shrink-0 flex items-center h-6 mt-0.5">
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-2 border-slate-300 checked:bg-primary-600 checked:border-primary-600 cursor-pointer transition-colors accent-indigo-600"
                checked={erKjopt}
                disabled={erKjopt && !antallAlleredeKjoptAvMeg(onske)}
                onChange={this.onMarkerOnskeSomKjopt(onske, listId)}
              />
            </div>
          </div>
          <Separator />
        </div>
      );
    });

  velgeAntallDialog = (): React.ReactNode => {
    const { dialogOpen, valgtOnske, antallValgt } = this.state;
    const alleredeValgtAvMeg = antallAlleredeKjoptAvMeg(valgtOnske);
    const tilgjengeligeFortsatt = Math.max(0, (valgtOnske.antall || 0) - totalValgt(valgtOnske as Onske) + alleredeValgtAvMeg);

    return (
      <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) this.resetLocalState(); }}>
        <DialogContent showClose={false} className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Velg antall
            </DialogTitle>
            <p className="text-sm text-slate-500 mt-1">
              Det er fortsatt ledig <strong>{tilgjengeligeFortsatt}</strong> stk av{' '}
              <em className="font-semibold text-slate-700">{valgtOnske.onskeTekst}</em>.
              Hvor mange har du tenkt å kjøpe totalt?
              {alleredeValgtAvMeg > 0 && (
                <span className="text-xs text-slate-400 block mt-1">
                  (Inkludert de(n) {alleredeValgtAvMeg} du allerede har tatt)
                </span>
              )}
            </p>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Antall</label>
              <Select
                value={String(antallValgt)}
                onValueChange={(val) => {
                  const newAntall = Number(val);
                  const { prisPerStk } = this.state;
                  const newPris = prisPerStk != null && newAntall > 0
                    ? String(Math.round(prisPerStk * newAntall))
                    : this.state.prisInput;
                  this.setState({ antallValgt: newAntall, prisInput: newPris });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0</SelectItem>
                  {[...Array(tilgjengeligeFortsatt).keys()].map(nr => (
                    <SelectItem key={nr + 1} value={String(nr + 1)}>{nr + 1}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">
                {antallValgt > 1 ? 'Totalpris' : 'Pris'}{' '}
                <span className="text-slate-400 font-normal">(valgfritt)</span>
              </label>
              <div className="relative">
                <input
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm pr-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 hover:border-slate-400 transition-colors"
                  inputMode="numeric"
                  value={this.state.prisInput}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9,.]/g, '');
                    const parsed = Number(val.replace(',', '.'));
                    const prisPerStk = val && !isNaN(parsed) && antallValgt > 0 ? parsed / antallValgt : null;
                    this.setState({ prisInput: val, prisPerStk });
                  }}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">kr</span>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={this.resetLocalState}>Avbryt</Button>
            <Button onClick={this.onMarkerOnskerSomKjopt}>Lagre</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  prisDialog = (): React.ReactNode => {
    const { prisDialogOpen, valgtOnske } = this.state;
    return (
      <Dialog open={prisDialogOpen} onOpenChange={(o) => { if (!o) this.resetLocalState(); }}>
        <DialogContent showClose={false} className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Kjøpt: <em className="not-italic font-bold text-primary-600">{valgtOnske.onskeTekst}</em>
            </DialogTitle>
            <p className="text-xs text-slate-400 italic mt-1">
              På Mine Kjøp-siden kan du se alle kjøpene dine og oversikt over hva du har brukt
            </p>
          </DialogHeader>
          <DialogBody>
            <label className="text-sm font-medium text-slate-700 block mb-1">
              Pris <span className="text-slate-400 font-normal">(valgfritt)</span>
            </label>
            <div className="relative">
              <input
                autoFocus
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm pr-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 hover:border-slate-400 transition-colors"
                inputMode="numeric"
                value={this.state.prisInput}
                onChange={(e) => this.setState({ prisInput: e.target.value.replace(/[^0-9,.]/g, '') })}
                onKeyDown={(e) => { if (e.key === 'Enter') this.saveSingleKjoep(); }}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">kr</span>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={this.resetLocalState}>Avbryt</Button>
            <Button onClick={this.saveSingleKjoep}>Lagre</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  render() {
    const { valgtVenn, valgtVennsListe, valgtVennsEkstraLister, valgtVennsAlleEkstraListeOnsker, alleBrukere } = this.props;
    const harGenerelleMaal = valgtVenn.measurements && Object.values(valgtVenn.measurements).some(k => !!k);

    return (
      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">
        <ListeVelger />

        {/* Hovedliste */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
            <h2 className="text-base font-semibold text-slate-800">
              {valgtVenn?.navn && (valgtVenn.mainListName || `Ønskelisten til ${valgtVenn.navn}`)}
            </h2>
          </div>
          <div>
            {valgtVennsListe.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-8">Velg en person for å se tilhørende ønskeliste(r)</p>
            ) : (
              this.populerOnskeliste(valgtVennsListe, null)
            )}
          </div>
        </div>

        {/* Ekstra lister */}
        {valgtVennsEkstraLister.map(liste => {
          const onsker = valgtVennsAlleEkstraListeOnsker[liste.key] || [];
          if (onsker.length === 0) return null;
          const otherUid = liste.sharedWithUid
            ? (liste.ownerUid === valgtVenn.uid ? liste.sharedWithUid : liste.ownerUid)
            : null;
          const otherUser = otherUid ? alleBrukere.find(b => b.uid === otherUid) : null;

          return (
            <div key={liste.key} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                <h2 className="text-base font-semibold text-slate-800">{liste.name}</h2>
                {otherUser && (
                  <p className="text-xs text-slate-400 mt-0.5">Delt med {otherUser.navn}</p>
                )}
              </div>
              <div>{this.populerOnskeliste(onsker, liste.key)}</div>
            </div>
          );
        })}

        {/* Generelle mål */}
        {harGenerelleMaal && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-emerald-200">
              <h3 className="text-sm font-semibold text-emerald-800">
                Generelle mål – {valgtVenn.firstName}
              </h3>
            </div>
            <div className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-1">
              {Object.keys(valgtVenn.measurements!).filter(key => !!valgtVenn.measurements![key]).map(key => (
                <p key={key} className="text-sm text-emerald-900">
                  <span className="font-semibold">{finnLabelForStrl(key)}</span>
                  {`: ${valgtVenn.measurements![key]}`}
                </p>
              ))}
            </div>
          </div>
        )}

        {this.state.dialogOpen && this.velgeAntallDialog()}
        {this.state.prisDialogOpen && this.prisDialog()}
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  valgtVenn: state.vennersLister.valgtVenn,
  valgtVennsListe: state.vennersLister.valgtVennsListe || [],
  valgtVennsEkstraLister: state.vennersLister.valgtVennsEkstraLister,
  valgtVennsAlleEkstraListeOnsker: state.vennersLister.valgtVennsAlleEkstraListeOnsker,
  mittNavn: state.innloggetBruker.navn,
  alleBrukere: state.config.brukere,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onEndreHeaderTekst: (nyTekst: string) => dispatch(endreHeaderTekst(nyTekst)),
});

export default connect(mapStateToProps, mapDispatchToProps)(VenneLister);
