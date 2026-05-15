import React, { Component } from 'react';
import { connect } from 'react-redux';
import { endreHeaderTekst } from '../actions/actions';
import { addEkstraKjoepForBruker, removeEkstraKjoepForBruker, updateEkstraKjoepPris, updateVanligKjoepPris, updateEkstraListeWishPris } from '../Api';
import { finnNavnFraUid, antallAlleredeKjoptAvMeg, myWishlistId } from '../utils/util';
import { RootState, Bruker, Onske } from '../types';
import { Dispatch } from 'redux';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogBody,
} from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const antallValg = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const groupColors = [
  'bg-sky-50 border-sky-200',
  'bg-lime-50 border-lime-200',
  'bg-orange-50 border-orange-200',
  'bg-violet-50 border-violet-200',
  'bg-teal-50 border-teal-200',
  'bg-amber-50 border-amber-200',
];

interface MineKjoepState {
  addKjoepDialogOpen: boolean;
  addKjoepForUid: string;
  addKjoepTekst: string;
  addKjoepAntall: number;
  addKjoepUrl: string;
  addKjoepPris: string;
  prisInput: Record<string, string>;
}

interface MineKjoepProps {
  onEndreHeaderTekst: (tekst: string) => void;
  mineKjoep: Record<string, Onske[]>;
  mineEkstraKjoep: Record<string, Onske[]>;
  mineEkstraListeKjoep: Record<string, { listId: string; listName: string; sharedWithUid?: string; onsker: Onske[] }[]>;
  alleBrukere: Bruker[];
  allowedListsForMe: string[];
}

class MineKjoep extends Component<MineKjoepProps, MineKjoepState> {
  state: MineKjoepState = {
    addKjoepDialogOpen: false,
    addKjoepForUid: '',
    addKjoepTekst: '',
    addKjoepAntall: 1,
    addKjoepUrl: '',
    addKjoepPris: '',
    prisInput: {},
  };

  componentDidMount() {
    this.props.onEndreHeaderTekst('Mine kjøp');
  }

  openAddKjoepDialog = (uid: string): void => {
    this.setState({ addKjoepDialogOpen: true, addKjoepForUid: uid, addKjoepTekst: '', addKjoepAntall: 1, addKjoepUrl: '', addKjoepPris: '' });
  };

  closeAddKjoepDialog = (): void => this.setState({ addKjoepDialogOpen: false });

  saveEkstraKjoep = (): void => {
    const { addKjoepForUid, addKjoepTekst, addKjoepAntall, addKjoepUrl, addKjoepPris } = this.state;
    if (!addKjoepForUid || !addKjoepTekst.trim()) return;
    const kjoep: { onskeTekst: string; antall: number; url?: string; pris?: number } = {
      onskeTekst: addKjoepTekst.trim(),
      antall: addKjoepAntall,
    };
    if (addKjoepUrl.trim()) {
      kjoep.url = addKjoepUrl.trim().startsWith('http') ? addKjoepUrl.trim() : 'http://' + addKjoepUrl.trim();
    }
    if (addKjoepPris.trim()) {
      const pris = Number(addKjoepPris.replace(',', '.'));
      if (!isNaN(pris)) kjoep.pris = pris;
    }
    addEkstraKjoepForBruker(addKjoepForUid, kjoep);
    this.closeAddKjoepDialog();
  };

  getPrisValue = (brukerUid: string, itemKey: string, currentPris: number | undefined): string => {
    const editKey = `${brukerUid}_${itemKey}`;
    if (editKey in this.state.prisInput) return this.state.prisInput[editKey];
    return currentPris != null ? String(currentPris) : '';
  };

  filtrerPris = (value: string): string => value.replace(/[^0-9,.]/g, '');

  onPrisChange = (brukerUid: string, itemKey: string, value: string): void => {
    const editKey = `${brukerUid}_${itemKey}`;
    this.setState(prev => ({ prisInput: { ...prev.prisInput, [editKey]: this.filtrerPris(value) } }));
  };

  onPrisBlur = (brukerUid: string, kjoep: Onske, erEkstraKjoep: boolean, ekstraListeId?: string): void => {
    const editKey = `${brukerUid}_${kjoep.key}`;
    const value = this.state.prisInput[editKey];
    if (value === undefined) return;
    const pris = value.trim() === '' ? null : Number(value.replace(',', '.'));
    if (ekstraListeId) {
      updateEkstraListeWishPris(ekstraListeId, kjoep, pris);
    } else if (erEkstraKjoep) {
      updateEkstraKjoepPris(brukerUid, kjoep.key, pris);
    } else {
      updateVanligKjoepPris(brukerUid, kjoep, pris);
    }
    this.setState(prev => {
      const { [editKey]: _, ...rest } = prev.prisInput;
      return { prisInput: rest };
    });
  };

  renderPrisInput = (brukerUid: string, kjoep: Onske, erEkstraKjoep: boolean, ekstraListeId?: string): React.ReactNode => {
    const currentPris = ekstraListeId
      ? (kjoep.kjoptAvListe || []).find((e: any) => e.kjoptAv === myWishlistId())?.pris
      : erEkstraKjoep
        ? kjoep.pris
        : (kjoep.kjoptAvListe || []).find(e => e.kjoptAv === myWishlistId())?.pris;
    const antall = ekstraListeId
      ? antallAlleredeKjoptAvMeg(kjoep)
      : erEkstraKjoep ? kjoep.antall : antallAlleredeKjoptAvMeg(kjoep);
    return (
      <div className="relative w-24 shrink-0">
        <input
          className="h-7 w-full rounded border border-slate-200 bg-white px-2 text-xs pr-7 focus:outline-none focus:ring-1 focus:ring-primary-400 hover:border-slate-300 transition-colors"
          inputMode="numeric"
          placeholder={antall && antall > 1 ? 'Totalpris' : 'Pris'}
          value={this.getPrisValue(brukerUid, kjoep.key, currentPris)}
          onChange={(e) => this.onPrisChange(brukerUid, kjoep.key, e.target.value)}
          onBlur={() => this.onPrisBlur(brukerUid, kjoep, erEkstraKjoep, ekstraListeId)}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">kr</span>
      </div>
    );
  };

  renderPersonGruppe = (brukerUid: string, colorClass: string): React.ReactNode => {
    const { mineKjoep, mineEkstraKjoep, mineEkstraListeKjoep, alleBrukere } = this.props;
    const kjoepListe = mineKjoep[brukerUid] || [];
    const ekstraListe = mineEkstraKjoep[brukerUid] || [];
    const ekstraListeLister = mineEkstraListeKjoep[brukerUid] || [];
    const harNoe = kjoepListe.length > 0 || ekstraListe.length > 0 || ekstraListeLister.some(l => l.onsker.length > 0);
    if (!harNoe) return null;

    const kjoepSum = kjoepListe.reduce((acc, k) => acc + ((k.kjoptAvListe || []).find(e => e.kjoptAv === myWishlistId())?.pris || 0), 0);
    const ekstraSum = ekstraListe.reduce((acc, k) => acc + (k.pris || 0), 0);
    const ekstraListeSum = ekstraListeLister.reduce((acc, l) =>
      acc + l.onsker.reduce((a, k) => a + ((k.kjoptAvListe || []).find((e: any) => e.kjoptAv === myWishlistId())?.pris || 0), 0), 0);
    const sum = kjoepSum + ekstraSum + ekstraListeSum;

    return (
      <div key={brukerUid} className={`border rounded-2xl overflow-hidden ${colorClass}`}>
        <div className="flex items-stretch">
          {/* Venstre kolonne - navn + total */}
          <div className="w-28 shrink-0 flex flex-col items-center justify-center p-3 border-r border-current border-opacity-20 gap-1.5">
            <span className="text-sm font-semibold text-slate-700 text-center break-words leading-tight">
              {finnNavnFraUid(brukerUid, alleBrukere)}
            </span>
            {sum > 0 && (
              <span className="text-xs text-slate-500">{sum} kr</span>
            )}
            <button
              onClick={() => this.openAddKjoepDialog(brukerUid)}
              className="mt-1 p-1.5 rounded-full border border-slate-300 text-slate-500 hover:text-primary-600 hover:border-primary-400 hover:bg-white/60 transition-colors"
              aria-label="Legg til kjøp"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Høyre kolonne - kjøpsliste */}
          <div className="flex-1 min-w-0 divide-y divide-slate-100/60">
            {kjoepListe.map((kjoep, idx) => (
              <div key={kjoep.onskeTekst + idx} className="flex items-center gap-2 px-3 py-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800 font-medium truncate">{kjoep.onskeTekst}</p>
                  <p className="text-xs text-slate-400">
                    Antall: {antallAlleredeKjoptAvMeg(kjoep) || kjoep.antall || 1}
                    {kjoep.url && <> · <a href={kjoep.url} target="_blank" rel="noopener noreferrer" className="text-primary-500 underline">Lenke</a></>}
                  </p>
                </div>
                {this.renderPrisInput(brukerUid, kjoep, false)}
              </div>
            ))}
            {ekstraListe.map((kjoep) => (
              <div key={kjoep.key} className="flex items-center gap-2 px-3 py-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800 font-medium truncate">{kjoep.onskeTekst}</p>
                  <p className="text-xs text-slate-400">
                    Antall: {kjoep.antall || 1}
                    {kjoep.url && <> · <a href={kjoep.url} target="_blank" rel="noopener noreferrer" className="text-primary-500 underline">Lenke</a></>}
                  </p>
                </div>
                {this.renderPrisInput(brukerUid, kjoep, true)}
                <button
                  onClick={() => removeEkstraKjoepForBruker(brukerUid, kjoep.key)}
                  className="p-1 rounded text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors shrink-0"
                  aria-label="Slett kjøp"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {ekstraListeLister.map((listGruppe, _lgIdx) => {
              const deltMedBruker = listGruppe.sharedWithUid
                ? alleBrukere.find(b => b.uid === listGruppe.sharedWithUid)
                : null;
              return (
                <div key={listGruppe.listId}>
                  <div className="px-3 py-1.5 bg-slate-50/60 border-t border-slate-100/60">
                    <p className="text-xs text-slate-500 font-semibold">
                      {listGruppe.listName}
                      {deltMedBruker && <span className="font-normal"> (delt med {deltMedBruker.navn})</span>}
                    </p>
                  </div>
                  {listGruppe.onsker.map((kjoep) => (
                    <div key={kjoep.key} className="flex items-center gap-2 px-3 py-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-800 font-medium truncate">{kjoep.onskeTekst}</p>
                        <p className="text-xs text-slate-400">
                          Antall: {antallAlleredeKjoptAvMeg(kjoep) || kjoep.antall || 1}
                        </p>
                      </div>
                      {this.renderPrisInput(brukerUid, kjoep, false, listGruppe.listId)}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  render() {
    const { mineKjoep, mineEkstraKjoep, mineEkstraListeKjoep, alleBrukere, allowedListsForMe } = this.props;
    const { addKjoepDialogOpen, addKjoepForUid, addKjoepTekst, addKjoepAntall, addKjoepUrl, addKjoepPris } = this.state;

    const allUids = Array.from(new Set([
      ...Object.keys(mineKjoep),
      ...Object.keys(mineEkstraKjoep),
      ...Object.keys(mineEkstraListeKjoep),
    ]));
    const harNoenKjoep = allUids.some(uid =>
      (mineKjoep[uid] && mineKjoep[uid].length > 0) ||
      (mineEkstraKjoep[uid] && mineEkstraKjoep[uid].length > 0) ||
      (mineEkstraListeKjoep[uid] && mineEkstraListeKjoep[uid].some(l => l.onsker.length > 0))
    );

    const totalSum = allUids.reduce((total, uid) => {
      const kjoepListe = mineKjoep[uid] || [];
      const ekstraListe = mineEkstraKjoep[uid] || [];
      const ekstraListeLister = mineEkstraListeKjoep[uid] || [];
      const kjoepSum = kjoepListe.reduce((acc, k) => acc + ((k.kjoptAvListe || []).find(e => e.kjoptAv === myWishlistId())?.pris || 0), 0);
      const ekstraSum = ekstraListe.reduce((acc, k) => acc + (k.pris || 0), 0);
      const ekstraListeSum = ekstraListeLister.reduce((acc, l) =>
        acc + l.onsker.reduce((a, k) => a + ((k.kjoptAvListe || []).find((e: any) => e.kjoptAv === myWishlistId())?.pris || 0), 0), 0);
      return total + kjoepSum + ekstraSum + ekstraListeSum;
    }, 0);

    const personNavn = finnNavnFraUid(addKjoepForUid, alleBrukere);

    return (
      <div className="max-w-xl mx-auto px-4 py-6 flex flex-col gap-4">
        <p className="text-sm text-slate-400 italic text-center">
          Her har du oversikt over alle ønsker du har tatt fra venners lister. Du kan også legge til kjøp gjort utenfor ønskelisten.
        </p>

        {totalSum > 0 && (
          <div className="bg-primary-50 border border-primary-200 rounded-xl px-4 py-2 text-center">
            <p className="text-sm font-semibold text-primary-800">Totalsum: {totalSum} kr</p>
          </div>
        )}

        {allowedListsForMe.length > 0 && (
          <div className="flex justify-center">
            <div className="relative">
              <select
                value=""
                onChange={(e) => { if (e.target.value) this.openAddKjoepDialog(e.target.value); }}
                className="h-9 rounded-xl border border-slate-300 bg-white pl-8 pr-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 hover:border-slate-400 transition-colors appearance-none cursor-pointer"
              >
                <option value="">Legg til kjøp for...</option>
                {[...allowedListsForMe]
                  .sort((a, b) => (finnNavnFraUid(a, alleBrukere) || a).localeCompare(finnNavnFraUid(b, alleBrukere) || b))
                  .map(uid => (
                    <option key={uid} value={uid}>{finnNavnFraUid(uid, alleBrukere) || uid}</option>
                  ))}
              </select>
              <Plus className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {allUids.map((brukerUid, colorIndex) =>
            this.renderPersonGruppe(brukerUid, groupColors[colorIndex % groupColors.length])
          )}
        </div>

        {!harNoenKjoep && (
          <p className="text-center text-slate-400 text-sm py-8">Du har ikke tatt noen ønsker enda</p>
        )}

        {/* Dialog: Legg til kjøp */}
        <Dialog open={addKjoepDialogOpen} onOpenChange={(o) => { if (!o) this.closeAddKjoepDialog(); }}>
          <DialogContent showClose={false} className="max-w-xs">
            <DialogHeader>
              <DialogTitle>Legg til kjøp for {personNavn}</DialogTitle>
            </DialogHeader>
            <DialogBody className="flex flex-col gap-3">
              <Input
                autoFocus
                label="Hva kjøpte du?"
                value={addKjoepTekst}
                type="text"
                onChange={(e) => this.setState({ addKjoepTekst: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter' && addKjoepTekst.trim()) this.saveEkstraKjoep(); }}
              />
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Antall</label>
                <Select
                  value={String(addKjoepAntall)}
                  onValueChange={(val) => this.setState({ addKjoepAntall: Number(val) })}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {antallValg.map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Input
                label="Lenke (valgfritt)"
                value={addKjoepUrl}
                type="url"
                placeholder="https://..."
                onChange={(e) => this.setState({ addKjoepUrl: e.target.value })}
              />
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">
                  {addKjoepAntall > 1 ? 'Totalpris' : 'Pris'}{' '}
                  <span className="text-slate-400 font-normal">(valgfritt)</span>
                </label>
                <div className="relative">
                  <input
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm pr-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 hover:border-slate-400 transition-colors"
                    inputMode="numeric"
                    value={addKjoepPris}
                    onChange={(e) => this.setState({ addKjoepPris: this.filtrerPris(e.target.value) })}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">kr</span>
                </div>
              </div>
            </DialogBody>
            <DialogFooter>
              <Button variant="ghost" onClick={this.closeAddKjoepDialog}>Avbryt</Button>
              <Button onClick={this.saveEkstraKjoep} disabled={!addKjoepTekst.trim()}>
                Lagre
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  mineKjoep: state.innloggetBruker.mineKjoep,
  mineEkstraKjoep: state.innloggetBruker.mineEkstraKjoep,
  mineEkstraListeKjoep: state.innloggetBruker.mineEkstraListeKjoep,
  alleBrukere: state.config.brukere,
  allowedListsForMe: state.vennersLister.allowedListsForMe,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onEndreHeaderTekst: (tekst: string) => dispatch(endreHeaderTekst(tekst)),
});

export default connect(mapStateToProps, mapDispatchToProps)(MineKjoep);
