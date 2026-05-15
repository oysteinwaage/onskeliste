import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { opprettEkstraListe, leggTilDelingspartner, fjernDelingspartner, slettEkstraListe, forlateEkstraListe, oppdaterEkstraListeNavn } from '../Api';
import { oppdaterEkstraListeMetadata } from '../actions/actions';
import { RootState, Bruker, ExtraListMetadata } from '../types';
import { myUid } from '../config/firebase';
import { Dispatch } from 'redux';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogBody,
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

interface OpprettListeDialogProps {
  open: boolean;
  onClose: () => void;
  alleBrukere: Bruker[];
  myUid: string;
  editListe?: ExtraListMetadata;
  onOpprett?: (name: string, sharedWithUid?: string) => void;
  onSlettListe?: (listId: string, sharedWithUid?: string) => void;
  onForlatListe?: (listId: string) => void;
  onOppdaterListeMetadata?: (liste: ExtraListMetadata) => void;
}

interface OpprettListeDialogState {
  navn: string;
  valgtDelingspartner: Bruker | null;
  bekreftSlett: boolean;
  soek: string;
  soekApen: boolean;
}

class OpprettListeDialog extends Component<OpprettListeDialogProps, OpprettListeDialogState> {
  state: OpprettListeDialogState = { navn: '', valgtDelingspartner: null, bekreftSlett: false, soek: '', soekApen: false };

  initFraProps() {
    const { editListe, alleBrukere } = this.props;
    if (editListe) {
      const partner = editListe.sharedWithUid
        ? alleBrukere.find(b => b.uid === editListe.sharedWithUid) || null
        : null;
      this.setState({ navn: editListe.name, valgtDelingspartner: partner, bekreftSlett: false, soek: partner?.navn || '', soekApen: false });
    } else {
      this.setState({ navn: '', valgtDelingspartner: null, bekreftSlett: false, soek: '', soekApen: false });
    }
  }

  componentDidMount() {
    this.initFraProps();
  }

  componentDidUpdate(prevProps: OpprettListeDialogProps) {
    if (!prevProps.open && this.props.open) {
      this.initFraProps();
    }
  }

  handleLagre = async (): Promise<void> => {
    const { editListe, onOpprett, onClose, onOppdaterListeMetadata } = this.props;
    const { navn, valgtDelingspartner } = this.state;

    if (editListe) {
      const gammelPartnerUid = editListe.sharedWithUid;
      const nyPartnerUid = valgtDelingspartner?.uid;
      const nyttNavn = navn.trim();

      const navnEndret = nyttNavn && nyttNavn !== editListe.name;
      const partnerEndret = gammelPartnerUid !== nyPartnerUid;

      if (navnEndret) {
        await oppdaterEkstraListeNavn(editListe.key, nyttNavn);
      }

      if (partnerEndret) {
        if (gammelPartnerUid) await fjernDelingspartner(editListe.key, gammelPartnerUid);
        if (nyPartnerUid) await leggTilDelingspartner(editListe.key, nyPartnerUid);
      }

      if (navnEndret || partnerEndret) {
        const oppdatert: ExtraListMetadata = {
          key: editListe.key,
          name: navnEndret ? nyttNavn : editListe.name,
          ownerUid: editListe.ownerUid,
          ...(nyPartnerUid ? { sharedWithUid: nyPartnerUid } : {}),
        };
        onOppdaterListeMetadata?.(oppdatert);
      }
    } else {
      if (!navn.trim()) return;
      if (onOpprett) onOpprett(navn.trim(), valgtDelingspartner?.uid);
    }
    onClose();
  };

  handleSlett = (): void => {
    const { editListe, onSlettListe, onForlatListe, onClose, myUid: myUidValue } = this.props;
    if (!editListe) return;
    if (!this.state.bekreftSlett) {
      this.setState({ bekreftSlett: true });
      return;
    }
    const erEier = editListe.ownerUid === myUidValue;
    if (erEier && onSlettListe) {
      onSlettListe(editListe.key, editListe.sharedWithUid);
    } else if (!erEier && onForlatListe) {
      onForlatListe(editListe.key);
    }
    onClose();
  };

  render() {
    const { open, onClose, alleBrukere, myUid: myUidValue, editListe } = this.props;
    const { navn, valgtDelingspartner, bekreftSlett, soek, soekApen } = this.state;
    const erEier = !editListe || editListe.ownerUid === myUidValue;
    const erNy = !editListe;

    const valgbareBrukere = alleBrukere.filter(b => b.uid !== myUidValue && !b.invisible);
    const filtrerteBrukere = soek.trim()
      ? valgbareBrukere.filter(b => b.navn.toLowerCase().includes(soek.toLowerCase()))
      : valgbareBrukere;

    return (
      <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
        <DialogContent showClose={false} className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {erNy ? 'Opprett ny (delt) ønskeliste' : `Administrer: ${editListe?.name}`}
            </DialogTitle>
          </DialogHeader>

          <DialogBody className="flex flex-col gap-4">
            {(erNy || erEier) && (
              <Input
                autoFocus={erNy}
                label="Navn på listen"
                placeholder="F.eks. Julekjøp"
                value={navn}
                onChange={e => this.setState({ navn: e.target.value })}
                onKeyDown={e => { if (e.key === 'Enter' && navn.trim()) this.handleLagre(); }}
              />
            )}

            {erEier && (
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">
                  Del med annen bruker <span className="text-slate-400 font-normal">(valgfritt)</span>
                </label>

                {/* Valgt bruker */}
                {valgtDelingspartner && (
                  <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-primary-50 border border-primary-200 rounded-lg text-sm text-primary-700">
                    <span className="flex-1">{valgtDelingspartner.navn}</span>
                    <button
                      onClick={() => this.setState({ valgtDelingspartner: null, soek: '' })}
                      className="text-primary-400 hover:text-primary-600"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Søk */}
                {!valgtDelingspartner && (
                  <PopoverPrimitive.Root
                    open={soekApen && filtrerteBrukere.length > 0}
                    onOpenChange={() => {}}
                  >
                    <PopoverPrimitive.Trigger asChild onClick={e => e.preventDefault()}>
                      <div className="w-full">
                        <input
                          className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 hover:border-slate-400 transition-colors"
                          placeholder="Søk etter navn..."
                          value={soek}
                          onChange={e => this.setState({ soek: e.target.value, soekApen: true })}
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
                        className="bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden max-h-48 overflow-y-auto"
                      >
                        <ul>
                          {filtrerteBrukere.map(b => (
                            <li key={b.uid}>
                              <button
                                className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                                onMouseDown={e => e.preventDefault()}
                                onClick={() => this.setState({ valgtDelingspartner: b, soek: b.navn, soekApen: false })}
                              >
                                {b.navn}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </PopoverPrimitive.Content>
                    </PopoverPrimitive.Portal>
                  </PopoverPrimitive.Root>
                )}

                {valgtDelingspartner && (
                  <p className="text-xs text-slate-400 mt-1">
                    Begge vil se og kunne redigere listen på sin Min liste-side.
                  </p>
                )}
              </div>
            )}

            {!erEier && editListe && (
              <p className="text-sm text-slate-500">
                Delt av: {alleBrukere.find(b => b.uid === editListe.ownerUid)?.navn || 'ukjent'}
              </p>
            )}
          </DialogBody>

          <DialogFooter className={bekreftSlett ? 'justify-between' : 'justify-end'}>
            {editListe && erEier && (
              <Button variant="destructive" size="sm" onClick={this.handleSlett}>
                {bekreftSlett ? 'Bekreft sletting' : 'Slett liste'}
              </Button>
            )}
            {editListe && !erEier && (
              <Button variant="destructive" size="sm" onClick={this.handleSlett}>
                {bekreftSlett ? 'Bekreft' : 'Forlat liste'}
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onClose}>Avbryt</Button>
              {(erNy || erEier) && (
                <Button onClick={this.handleLagre} disabled={!navn.trim()}>
                  {erNy ? 'Opprett' : 'Lagre'}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  alleBrukere: state.config.brukere,
  myUid: state.innloggetBruker.uid || myUid() || '',
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onOpprett: (name: string, sharedWithUid?: string) =>
    dispatch(opprettEkstraListe(name, sharedWithUid) as any),
  onSlettListe: (listId: string, sharedWithUid?: string) =>
    dispatch(slettEkstraListe(listId, sharedWithUid) as any),
  onForlatListe: (_listId: string) => forlateEkstraListe(_listId),
  onOppdaterListeMetadata: (liste: ExtraListMetadata) => dispatch(oppdaterEkstraListeMetadata(liste)),
});

export default connect(mapStateToProps, mapDispatchToProps)(OpprettListeDialog);
