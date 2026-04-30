import React, { Component } from 'react';
import { connect } from 'react-redux';
import { endreHeaderTekst } from '../actions/actions';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import { addEkstraKjoepForBruker, removeEkstraKjoepForBruker, updateEkstraKjoepPris, updateVanligKjoepPris } from '../Api';
import { finnNavnFraUid, antallAlleredeKjoptAvMeg, myWishlistId } from '../utils/util';
import { RootState, Bruker, Onske } from '../types';
import { Dispatch } from 'redux';

const antallValg = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

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

  closeAddKjoepDialog = (): void => {
    this.setState({ addKjoepDialogOpen: false });
  };

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

  onPrisBlur = (brukerUid: string, kjoep: Onske, erEkstraKjoep: boolean): void => {
    const editKey = `${brukerUid}_${kjoep.key}`;
    const value = this.state.prisInput[editKey];
    if (value === undefined) return;
    const pris = value.trim() === '' ? null : Number(value.replace(',', '.'));
    if (erEkstraKjoep) {
      updateEkstraKjoepPris(brukerUid, kjoep.key, pris);
    } else {
      updateVanligKjoepPris(brukerUid, kjoep, pris);
    }
    this.setState(prev => {
      const { [editKey]: _, ...rest } = prev.prisInput;
      return { prisInput: rest };
    });
  };

  visLenkeOgAntall = (kjoep: Onske): React.ReactNode => {
    const antallKjopt = antallAlleredeKjoptAvMeg(kjoep) || kjoep.antall || 1;
    return (
      <>
        <span>Antall: {antallKjopt}</span>
        {kjoep.url && ' - '}
        {kjoep.url && <a href={kjoep.url} target="_blank" rel="noopener noreferrer">Lenke</a>}
      </>
    );
  };

  renderPrisInput = (brukerUid: string, kjoep: Onske, erEkstraKjoep: boolean): React.ReactNode => {
    const currentPris = erEkstraKjoep
      ? kjoep.pris
      : (kjoep.kjoptAvListe || []).find(e => e.kjoptAv === myWishlistId())?.pris;
    const antall = erEkstraKjoep ? kjoep.antall : antallAlleredeKjoptAvMeg(kjoep);
    return (
      <TextField
        size="small"
        label={antall && antall > 1 ? 'Totalpris' : 'Pris'}
        value={this.getPrisValue(brukerUid, kjoep.key, currentPris)}
        onChange={(e) => this.onPrisChange(brukerUid, kjoep.key, e.target.value)}
        onBlur={() => this.onPrisBlur(brukerUid, kjoep, erEkstraKjoep)}
        inputProps={{ inputMode: 'numeric', style: { width: 60, padding: '4px 6px' } }}
        InputProps={{ endAdornment: <span style={{ fontSize: '0.75rem', color: 'gray' }}>kr</span> }}
        style={{ width: 90, flexShrink: 0, display: 'block' }}
        variant="standard"
      />
    );
  };

  renderAddKjoepDialog = (): React.ReactNode => {
    const { alleBrukere } = this.props;
    const { addKjoepDialogOpen, addKjoepForUid, addKjoepTekst, addKjoepAntall, addKjoepUrl, addKjoepPris } = this.state;
    const personNavn = finnNavnFraUid(addKjoepForUid, alleBrukere);
    const kanLagre = !!addKjoepTekst.trim();

    return (
      <Dialog open={addKjoepDialogOpen} onClose={this.closeAddKjoepDialog} fullWidth maxWidth="xs">
        <DialogTitle>Legg til kjøp for {personNavn}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Hva kjøpte du?"
            value={addKjoepTekst}
            type="text"
            fullWidth
            onChange={(e) => this.setState({ addKjoepTekst: e.target.value })}
            onKeyDown={(e) => { if (e.key === 'Enter' && kanLagre) this.saveEkstraKjoep(); }}
          />
          <FormControl margin="dense" style={{ minWidth: 80 }}>
            <InputLabel id="antall-label">Antall</InputLabel>
            <Select
              labelId="antall-label"
              value={addKjoepAntall}
              label="Antall"
              onChange={(e: SelectChangeEvent<number>) => this.setState({ addKjoepAntall: e.target.value as number })}
            >
              {antallValg.map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Lenke (valgfritt)"
            value={addKjoepUrl}
            type="url"
            fullWidth
            onChange={(e) => this.setState({ addKjoepUrl: e.target.value })}
          />
          <TextField
            margin="dense"
            label={addKjoepAntall > 1 ? 'Totalpris (valgfritt)' : 'Pris (valgfritt)'}
            value={addKjoepPris}
            inputProps={{ inputMode: 'numeric' }}
            InputProps={{ endAdornment: <span style={{ fontSize: '0.75rem', color: 'gray' }}>kr</span> }}
            onChange={(e) => this.setState({ addKjoepPris: this.filtrerPris(e.target.value) })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.closeAddKjoepDialog}>Avbryt</Button>
          <Button onClick={this.saveEkstraKjoep} disabled={!kanLagre} variant="contained">
            Lagre
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  renderPersonGruppe = (brukerUid: string, bgColor: string): React.ReactNode => {
    const { mineKjoep, mineEkstraKjoep, alleBrukere } = this.props;
    const kjoepListe = mineKjoep[brukerUid] || [];
    const ekstraListe = mineEkstraKjoep[brukerUid] || [];
    const harNoe = kjoepListe.length > 0 || ekstraListe.length > 0;

    const kjoepSum = kjoepListe.reduce((acc, k) => acc + ((k.kjoptAvListe || []).find(e => e.kjoptAv === myWishlistId())?.pris || 0), 0);
    const ekstraSum = ekstraListe.reduce((acc, k) => acc + (k.pris || 0), 0);
    const sum = kjoepSum + ekstraSum;

    return harNoe && (
      <div
        key={brukerUid}
        className="ProfilSide__mine-kjoep__liste"
        style={{ backgroundColor: bgColor, borderRadius: 8, marginBottom: 8, padding: '8px 12px', boxSizing: 'border-box', width: '100%', overflow: 'hidden' }}
      >
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 8 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 3 }}>
            <div className="ProfilSide__mine-kjoep__liste-eier" style={{ textAlign: 'center', wordBreak: 'break-word', whiteSpace: 'normal', fontSize: '1rem' }}>
              {finnNavnFraUid(brukerUid, alleBrukere)}
            </div>
            {sum > 0 && (
              <div style={{ fontSize: '0.8rem', color: 'gray', marginTop: 4 }}>{sum} kr</div>
            )}
            <IconButton
              size="small"
              onClick={() => this.openAddKjoepDialog(brukerUid)}
              aria-label={`Legg til kjøp for ${finnNavnFraUid(brukerUid, alleBrukere)}`}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </div>
          <div style={{ flex: 7, minWidth: 0 }} className="ProfilSide__mine-kjoep__onsker">
            {kjoepListe.map((kjoep, idx) => (
              <div key={kjoep.onskeTekst + idx}>
                <ListItem className="ProfilSide__mine-kjoep__liste-kjoep">
                  <ListItemText
                    className="wishText"
                    primary={kjoep.onskeTekst}
                    secondary={this.visLenkeOgAntall(kjoep)}
                  />
                </ListItem>
                <div style={{ paddingLeft: 16, paddingBottom: 4, marginTop: -12 }}>
                  {this.renderPrisInput(brukerUid, kjoep, false)}
                </div>
                {(kjoepListe.length > idx + 1 || ekstraListe.length > 0) &&
                  <Divider className="ProfilSide__mine-kjoep__liste-divider" />}
              </div>
            ))}
            {ekstraListe.map((kjoep, idx) => (
              <div key={kjoep.key}>
                <ListItem className="ProfilSide__mine-kjoep__liste-kjoep">
                  <ListItemText
                    className="wishText"
                    primary={kjoep.onskeTekst}
                    secondary={this.visLenkeOgAntall(kjoep)}
                  />
                  <IconButton
                    size="small"
                    edge="end"
                    aria-label="Slett kjøp"
                    onClick={() => removeEkstraKjoepForBruker(brukerUid, kjoep.key)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </ListItem>
                <div style={{ paddingLeft: 16, paddingBottom: 4, marginTop: -12 }}>
                  {this.renderPrisInput(brukerUid, kjoep, true)}
                </div>
                {ekstraListe.length > idx + 1 &&
                  <Divider className="ProfilSide__mine-kjoep__liste-divider" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  render() {
    const { mineKjoep, mineEkstraKjoep, alleBrukere, allowedListsForMe } = this.props;

    const groupColors = ['#e8f4f8', '#f0f4e8', '#f8f0e8', '#f4e8f4', '#e8f4f0', '#f8f4e0'];
    const allUids = Array.from(new Set([...Object.keys(mineKjoep), ...Object.keys(mineEkstraKjoep)]));
    const harNoenKjoep = allUids.some(uid =>
      (mineKjoep[uid] && mineKjoep[uid].length > 0) ||
      (mineEkstraKjoep[uid] && mineEkstraKjoep[uid].length > 0)
    );

    const totalSum = allUids.reduce((total, uid) => {
      const kjoepListe = mineKjoep[uid] || [];
      const ekstraListe = mineEkstraKjoep[uid] || [];
      const kjoepSum = kjoepListe.reduce((acc, k) => acc + ((k.kjoptAvListe || []).find(e => e.kjoptAv === myWishlistId())?.pris || 0), 0);
      const ekstraSum = ekstraListe.reduce((acc, k) => acc + (k.pris || 0), 0);
      return total + kjoepSum + ekstraSum;
    }, 0);

    return (
      <div className="ProfilSide" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: '0.9rem', color: 'gray', fontStyle: 'italic', marginBottom: 12 }}>
          Her har du oversikt over alle ønsker du har tatt fra venners lister, du kan også legge til ting du har kjøpt/skaffet utenfor ønskelisten til folk og i tillegg få oversikt over hvor mye du har brukt pr person og totalt
        </div>
        {totalSum > 0 && (
          <hr style={{ width: '100%', border: 'none', borderTop: '1px solid rgba(0,0,0,0.12)', margin: '0 0 12px 0' }} />
        )}
        {totalSum > 0 && (
          <div style={{ textAlign: 'center', fontWeight: 500, marginBottom: 12 }}>
            Totalsum: {totalSum} kr
          </div>
        )}
        {totalSum > 0 && (
          <hr style={{ width: '100%', border: 'none', borderTop: '1px solid rgba(0,0,0,0.12)', margin: '0 0 12px 0' }} />
        )}
        {allowedListsForMe.length > 0 && (
          <FormControl size="small" style={{ marginBottom: 12, minWidth: 220, alignSelf: 'center' }}>
            <Select
              displayEmpty
              value=""
              onChange={(e: SelectChangeEvent) => {
                if (e.target.value) this.openAddKjoepDialog(e.target.value);
              }}
              renderValue={() => (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <AddIcon fontSize="small" />
                  Legg til kjøp for...
                </span>
              )}
            >
              {[...allowedListsForMe]
                .sort((a, b) => (finnNavnFraUid(a, alleBrukere) || a).localeCompare(finnNavnFraUid(b, alleBrukere) || b))
                .map(uid => (
                  <MenuItem key={uid} value={uid}>
                    {finnNavnFraUid(uid, alleBrukere) || uid}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        )}
        {allUids.map((brukerUid, colorIndex) =>
          this.renderPersonGruppe(brukerUid, groupColors[colorIndex % groupColors.length])
        )}
        {!harNoenKjoep && (
          <span className="ProfilSide__mine-kjoep__ingen-kjoep">Du har ikke tatt noen ønsker enda</span>
        )}
        {this.renderAddKjoepDialog()}
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  mineKjoep: state.innloggetBruker.mineKjoep,
  mineEkstraKjoep: state.innloggetBruker.mineEkstraKjoep,
  alleBrukere: state.config.brukere,
  allowedListsForMe: state.vennersLister.allowedListsForMe,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onEndreHeaderTekst: (tekst: string) => dispatch(endreHeaderTekst(tekst)),
});

export default connect(mapStateToProps, mapDispatchToProps)(MineKjoep);
