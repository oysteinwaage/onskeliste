import React, { Component } from 'react';
import { connect } from 'react-redux';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Typography from '@mui/material/Typography';

import { opprettEkstraListe, leggTilDelingspartner, fjernDelingspartner, slettEkstraListe, forlateEkstraListe } from '../Api';
import { oppdaterEkstraListeMetadata } from '../actions/actions';
import { RootState, Bruker, ExtraListMetadata } from '../types';
import { myUid } from '../config/firebase';
import { Dispatch } from 'redux';

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
}

class OpprettListeDialog extends Component<OpprettListeDialogProps, OpprettListeDialogState> {
  state: OpprettListeDialogState = { navn: '', valgtDelingspartner: null, bekreftSlett: false };

  initFraProps() {
    const { editListe, alleBrukere } = this.props;
    if (editListe) {
      const partner = editListe.sharedWithUid
        ? alleBrukere.find(b => b.uid === editListe.sharedWithUid) || null
        : null;
      this.setState({ navn: editListe.name, valgtDelingspartner: partner, bekreftSlett: false });
    } else {
      this.setState({ navn: '', valgtDelingspartner: null, bekreftSlett: false });
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

      if (gammelPartnerUid !== nyPartnerUid) {
        if (gammelPartnerUid) await fjernDelingspartner(editListe.key, gammelPartnerUid);
        if (nyPartnerUid) await leggTilDelingspartner(editListe.key, nyPartnerUid);

        const oppdatert: ExtraListMetadata = {
          key: editListe.key,
          name: editListe.name,
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
    const { navn, valgtDelingspartner, bekreftSlett } = this.state;
    const erEier = !editListe || editListe.ownerUid === myUidValue;
    const erNy = !editListe;

    const valgbareBrukere = alleBrukere.filter(b => b.uid !== myUidValue && !b.invisible);

    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
        <DialogTitle>{erNy ? 'Opprett ny (delt) ønskeliste' : `Administrer: ${editListe?.name}`}</DialogTitle>
        <DialogContent>
          {erNy && (
            <TextField
              autoFocus
              margin="dense"
              label="Navn på listen"
              fullWidth
              value={navn}
              onChange={e => this.setState({ navn: e.target.value })}
              onKeyDown={e => { if (e.key === 'Enter' && navn.trim()) this.handleLagre(); }}
              variant="standard"
            />
          )}

          {erEier && (
            <>
              <Typography variant="body2" sx={{ mt: erNy ? 2 : 0, mb: 0.5, color: 'text.secondary' }}>
                Del listen med en annen bruker (valgfritt)
              </Typography>
              <Autocomplete
                options={valgbareBrukere}
                getOptionLabel={b => b.navn}
                value={valgtDelingspartner}
                onChange={(_, val) => this.setState({ valgtDelingspartner: val })}
                renderInput={params => (
                  <TextField {...params} variant="standard" placeholder="Søk etter navn" />
                )}
              />
              {valgtDelingspartner && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Begge vil se og kunne redigere listen på sin Min liste-side.
                </Typography>
              )}
            </>
          )}

          {!erEier && editListe && (
            <Typography variant="body2" color="text.secondary">
              Delt av: {alleBrukere.find(b => b.uid === editListe.ownerUid)?.navn || 'ukjent'}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: bekreftSlett ? 'space-between' : 'flex-end' }}>
          {editListe && erEier && (
            <Button
              color="error"
              onClick={this.handleSlett}
            >
              {bekreftSlett ? 'Bekreft sletting' : 'Slett liste'}
            </Button>
          )}
          {editListe && !erEier && (
            <Button color="error" onClick={this.handleSlett}>
              {bekreftSlett ? 'Bekreft' : 'Forlat liste'}
            </Button>
          )}
          <div>
            <Button onClick={onClose}>Avbryt</Button>
            {(erNy || erEier) && (
              <Button
                onClick={this.handleLagre}
                disabled={erNy && !navn.trim()}
                variant="contained"
              >
                {erNy ? 'Opprett' : 'Lagre'}
              </Button>
            )}
          </div>
        </DialogActions>
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
