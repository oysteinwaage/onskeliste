import React, { Component } from 'react';
import { connect } from 'react-redux';
import { endreHeaderTekst } from '../actions/actions';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
import { updateMyMeasumentOnProfile, addEkstraKjoepForBruker, removeEkstraKjoepForBruker } from '../Api';
import { finnLabelForStrl, finnNavnFraUid, measurementKeys } from '../utils/util';
import AddViewersToMyListComponent from '../minliste/AddViewersToMyListComponent';
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import { RootState, Bruker, Onske } from '../types';
import { Dispatch } from 'redux';

const antallValg = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

interface ProfilState {
  sko: string | null;
  bukse: string | null;
  genser_tskjorte: string | null;
  skjorte: string | null;
  bh: string | null;
  hansker: string | null;
  boksershorts: string | null;
  hatt: string | null;
  [key: string]: string | null | boolean | number;
  addKjoepDialogOpen: boolean;
  addKjoepForUid: string;
  addKjoepTekst: string;
  addKjoepAntall: number;
  addKjoepUrl: string;
}

interface ProfilProps {
  myUserDbKey: string;
  onEndreHeaderTekst: () => void;
  measurements: Record<string, string>;
  mineKjoep: Record<string, Onske[]>;
  mineEkstraKjoep: Record<string, Onske[]>;
  alleBrukere: Bruker[];
  allowedListsForMe: string[];
}

class Profil extends Component<ProfilProps, ProfilState> {
  constructor(props: ProfilProps) {
    super(props);
    this.state = {
      sko: null,
      bukse: null,
      genser_tskjorte: null,
      skjorte: null,
      bh: null,
      hansker: null,
      boksershorts: null,
      hatt: null,
      addKjoepDialogOpen: false,
      addKjoepForUid: '',
      addKjoepTekst: '',
      addKjoepAntall: 1,
      addKjoepUrl: '',
    };
  }

  componentDidMount() {
    const { onEndreHeaderTekst } = this.props;
    onEndreHeaderTekst();
  }

  lagreNyttMaal = (sizeKey: string, newSize: string): void => {
    const { myUserDbKey } = this.props;
    this.setState({ [sizeKey]: newSize });
    updateMyMeasumentOnProfile(myUserDbKey, newSize, sizeKey);
  };

  openAddKjoepDialog = (uid: string): void => {
    this.setState({
      addKjoepDialogOpen: true,
      addKjoepForUid: uid,
      addKjoepTekst: '',
      addKjoepAntall: 1,
      addKjoepUrl: '',
    });
  };

  closeAddKjoepDialog = (): void => {
    this.setState({ addKjoepDialogOpen: false });
  };

  saveEkstraKjoep = (): void => {
    const { addKjoepForUid, addKjoepTekst, addKjoepAntall, addKjoepUrl } = this.state;
    if (!addKjoepForUid || !addKjoepTekst.trim()) return;
    const kjoep: { onskeTekst: string; antall: number; url?: string } = {
      onskeTekst: addKjoepTekst.trim(),
      antall: addKjoepAntall,
    };
    if (addKjoepUrl.trim()) {
      kjoep.url = addKjoepUrl.trim().startsWith('http') ? addKjoepUrl.trim() : 'http://' + addKjoepUrl.trim();
    }
    addEkstraKjoepForBruker(addKjoepForUid, kjoep);
    this.closeAddKjoepDialog();
  };

  visLenkeOgAntall = (kjoep: Onske): React.ReactNode => {
    return <>
      <span>Antall: {kjoep.antall}</span>
      {kjoep.url && " - "}
      {kjoep.url && <a href={kjoep.url} target="_blank" rel="noopener noreferrer">Lenke</a>}
    </>
  };

  renderAddKjoepDialog = (): React.ReactNode => {
    const { alleBrukere } = this.props;
    const { addKjoepDialogOpen, addKjoepForUid, addKjoepTekst, addKjoepAntall, addKjoepUrl } = this.state;
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

    return harNoe && (
      <div
        key={brukerUid}
        className="ProfilSide__mine-kjoep__liste"
        style={{ backgroundColor: bgColor, borderRadius: 8, marginBottom: 8, padding: '8px 12px', boxSizing: 'border-box', width: '100%', overflow: 'hidden' }}
      >
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 8 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 3 }}>
            <div className="ProfilSide__mine-kjoep__liste-eier" style={{ textAlign: 'center', wordBreak: 'break-word', whiteSpace: 'normal', fontSize: '1rem' }}>{finnNavnFraUid(brukerUid, alleBrukere)}</div>
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
                    className='wishText'
                    primary={kjoep.onskeTekst}
                    secondary={this.visLenkeOgAntall(kjoep)}
                  />
                </ListItem>
                {(kjoepListe.length > idx + 1 || ekstraListe.length > 0) &&
                  <Divider className="ProfilSide__mine-kjoep__liste-divider" />}
              </div>
            ))}
            {ekstraListe.map((kjoep, idx) => (
              <div key={kjoep.key}>
                <ListItem className="ProfilSide__mine-kjoep__liste-kjoep">
                  <ListItemText
                    className='wishText'
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
    const { measurements, mineKjoep, mineEkstraKjoep, alleBrukere, allowedListsForMe } = this.props;
    const ingenMaalFyltInn = !measurements || Object.values(measurements).every(v => !v);

    const groupColors = ['#e8f4f8', '#f0f4e8', '#f8f0e8', '#f4e8f4', '#e8f4f0', '#f8f4e0'];
    const allUids = Array.from(new Set([...Object.keys(mineKjoep), ...Object.keys(mineEkstraKjoep)]));
    const harNoenKjoep = allUids.some(uid =>
      (mineKjoep[uid] && mineKjoep[uid].length > 0) ||
      (mineEkstraKjoep[uid] && mineEkstraKjoep[uid].length > 0)
    );

    return (
      <div className="ProfilSide">
        <Accordion defaultExpanded sx={{ width: '100%' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <h3 style={{ margin: 0 }}>Mine kjøp</h3>
          </AccordionSummary>
          <AccordionDetails>
            {allowedListsForMe.length > 0 && (
              <FormControl size="small" style={{ marginBottom: 12, minWidth: 220 }}>
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
                  {allowedListsForMe.map(uid => (
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
          </AccordionDetails>
        </Accordion>

        <Accordion defaultExpanded={ingenMaalFyltInn}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <h3 style={{ margin: 0 }}>Mine generelle mål</h3>
          </AccordionSummary>
          <AccordionDetails>
            <p className="ProfilSide__egne-maal__infotekst">Fyll inn de mål som passer for deg, de du lar stå tomme vil ikke bli vist for andre</p>
            {Object.values(measurementKeys).map(sizeKey => (
              <FormControl style={{ marginRight: 15 }} key={sizeKey}>
                <TextField
                  margin="dense"
                  id={sizeKey}
                  label={finnLabelForStrl(sizeKey)}
                  value={this.state[sizeKey] !== null ? this.state[sizeKey] : (measurements && measurements[sizeKey]) || ''}
                  type="text"
                  onChange={(e) => {
                    this.setState({ [sizeKey]: e.target.value });
                  }}
                  onBlur={(e) => this.lagreNyttMaal(sizeKey, e.target.value)}
                />
              </FormControl>
            ))}
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <h3 style={{ margin: 0 }}>Hvem skal kunne se listen din?</h3>
          </AccordionSummary>
          <AccordionDetails>
            <AddViewersToMyListComponent />
          </AccordionDetails>
        </Accordion>

        {this.renderAddKjoepDialog()}
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  myUserDbKey: state.innloggetBruker.userDbKey,
  measurements: state.innloggetBruker.measurements,
  mineKjoep: state.innloggetBruker.mineKjoep,
  mineEkstraKjoep: state.innloggetBruker.mineEkstraKjoep,
  alleBrukere: state.config.brukere,
  allowedListsForMe: state.vennersLister.allowedListsForMe,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onEndreHeaderTekst: () => dispatch(endreHeaderTekst('Profil')),
});

export default connect(mapStateToProps, mapDispatchToProps)(Profil);
