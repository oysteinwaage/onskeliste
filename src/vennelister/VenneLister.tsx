import React, { Component } from 'react';
import { connect } from 'react-redux';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import Input from '@mui/material/Input';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Slide from '@mui/material/Slide';
import StarIcon from '@mui/icons-material/Star';
import { TransitionProps } from '@mui/material/transitions';

import ListeVelger from './ListeVelger';
import { endreHeaderTekst } from '../actions/actions';
import { updateWishOnListWith } from '../Api';
import {
  alleOnskerTatt, antallAlleredeKjoptAvMeg,
  erInnloggetBrukersUid, finnLabelForStrl,
  inneholderInnloggetBrukersUid, kjoptListe,
  myWishlistId,
  totalValgt
} from '../utils/util';
import { RootState, Onske, Bruker } from '../types';
import { Dispatch } from 'redux';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface VenneListerLocalState {
  dialogOpen: boolean;
  valgtOnske: Partial<Onske>;
  antallValgt: number;
  prisDialogOpen: boolean;
  prisInput: string;
  prisPerStk: number | null;
}

const initLocalState: VenneListerLocalState = { dialogOpen: false, valgtOnske: {}, antallValgt: 0, prisDialogOpen: false, prisInput: '', prisPerStk: null };

interface VenneListerProps {
  valgtVenn: Partial<Bruker>;
  valgtVennsListe: Onske[];
  onEndreHeaderTekst: (nyTekst: string) => void;
  mittNavn: string;
}

class VenneLister extends Component<VenneListerProps, VenneListerLocalState> {
  state = initLocalState;

  resetLocalState = (): void => this.setState(initLocalState);

  componentDidMount() {
    const { onEndreHeaderTekst } = this.props;
    onEndreHeaderTekst('Venners lister');
  }

  kjoptAlleOnskerClassname = (onske: Onske): string =>
    onske.antall === totalValgt(onske) ? inneholderInnloggetBrukersUid(onske.kjoptAvListe) ? 'onskeKjopt kjoptAvDeg' : 'onskeKjopt' : '';
  onskeErFavoritt = (onske: Onske): string => onske.favoritt ? ' fjernPaddingVenstre' : '';

  onMarkerOnskeSomKjopt = (onske: Onske) => (_event: React.ChangeEvent<HTMLInputElement>): void => {
    const { valgtVenn } = this.props;

    if (onske.antall && onske.antall > 1) {
      const currentAntall = antallAlleredeKjoptAvMeg(onske);
      const currentPris = onske.pris;
      const prisPerStk = (currentPris != null && currentAntall > 0) ? currentPris / currentAntall : null;
      const prisInput = currentPris != null && currentAntall > 0 ? String(currentPris) : '';
      this.setState({ dialogOpen: true, valgtOnske: onske, antallValgt: currentAntall, prisInput, prisPerStk });
    } else {
      if (alleOnskerTatt(onske)) {
        updateWishOnListWith({ kjoptAvListe: [], pris: null as any }, onske, valgtVenn.uid as string);
      } else {
        this.setState({ prisDialogOpen: true, valgtOnske: onske, prisInput: '' });
      }
    }
  };

  saveSingleKjoep = (): void => {
    const { valgtVenn, mittNavn } = this.props;
    const { valgtOnske, prisInput } = this.state;
    const parsedPris = prisInput.trim() ? Number(prisInput.replace(',', '.')) : undefined;
    const newValues: Partial<Onske> = {
      kjoptAvListe: [{ antallKjopt: 1, kjoptAv: myWishlistId(), kjoptAvNavn: mittNavn }],
      ...(parsedPris !== undefined && !isNaN(parsedPris) ? { pris: parsedPris } : {}),
    };
    updateWishOnListWith(newValues, valgtOnske as Onske, valgtVenn.uid as string);
    this.resetLocalState();
  };

  lenkeEllerKjoptAv(onske: Onske): React.ReactNode {
    if (alleOnskerTatt(onske)) {
      const tattAvNavn = kjoptListe(onske).reduce((acc: string, bruker) => {
        const navn = erInnloggetBrukersUid(bruker.kjoptAv) ? 'deg' : bruker.kjoptAvNavn;
        const antallTatt = bruker.antallKjopt > 1 ? '('.concat(String(bruker.antallKjopt), ')') : '';
        acc = acc.concat(navn, antallTatt, ', ');
        return acc;
      }, '').slice(0, -2);
      return 'Tatt av ' + (onske.antall === 1 ? erInnloggetBrukersUid(onske.kjoptAvListe![0].kjoptAv) ? 'deg' : onske.kjoptAvListe![0].kjoptAvNavn : tattAvNavn);
    }
    const allUrls = onske.urls || (onske.url ? [onske.url] : []);
    if (allUrls.length === 0) return null;
    if (allUrls.length === 1) return <a href={allUrls[0]} target="_blank" rel="noopener noreferrer">Her kan den kjøpes</a>;
    return (
      <span>
        {allUrls.map((url, i) => (
          <React.Fragment key={i}>
            <a href={url} target="_blank" rel="noopener noreferrer">Lenke {i + 1}</a>
            {i < allUrls.length - 1 && ' · '}
          </React.Fragment>
        ))}
      </span>
    );
  }

  onMarkerOnskerSomKjopt = (): void => {
    const { valgtVenn, mittNavn } = this.props;
    const { antallValgt, valgtOnske, prisInput } = this.state;

    const newKjoptAvListe = [...((valgtOnske.kjoptAvListe || []).filter(vo => vo.kjoptAv !== myWishlistId()))];

    if (antallValgt > 0) {
      newKjoptAvListe.push({ kjoptAv: myWishlistId(), antallKjopt: antallValgt, kjoptAvNavn: mittNavn });
    }
    const parsedPris = prisInput.trim() ? Number(prisInput.replace(',', '.')) : undefined;
    const newValues: Partial<Onske> = {
      kjoptAvListe: newKjoptAvListe,
      ...(parsedPris !== undefined && !isNaN(parsedPris) ? { pris: parsedPris } : {}),
    };

    updateWishOnListWith(newValues, valgtOnske as Onske, valgtVenn.uid as string);
    this.resetLocalState();
  };

  lagAntallOgStrlTekst = (onske: Onske): string => {
    let res = (onske.antall && onske.antall > 1 && !alleOnskerTatt(onske)) ? `Antall tatt: ${totalValgt(onske)}/${onske.antall}` : "";
    if (onske.onskeSize) {
      res = res ? res.concat(` - Strl: ${onske.onskeSize}`) : `Strl: ${onske.onskeSize}`;
    }
    return res;
  };

  populerOnskeliste = (onskeliste: Onske[]): React.ReactNode =>
    onskeliste.sort((a, b) => (!a.favoritt ? 1 : 0) - (!b.favoritt ? 1 : 0)).map(onske =>
      <div key={onske.onskeTekst + onskeliste.indexOf(onske)}>
        <ListItem
          className={this.kjoptAlleOnskerClassname(onske) + this.onskeErFavoritt(onske) + (!alleOnskerTatt(onske) && onske.antall && onske.antall > 1 ? ' fjernPaddingUnder' : '')}>
          {onske.favoritt &&
            <StarIcon className={alleOnskerTatt(onske) ? "stjerne favorittTatt" : "stjerne favoritt"} />
          }
          <ListItemText
            className={alleOnskerTatt(onske) ? 'onskeKjoptTekst ' : onske.antall && onske.antall > 1 ? 'fjernPaddingUnder' : ''}
            primary={onske.onskeTekst}
            secondary={this.lenkeEllerKjoptAv(onske)}
          />
          <ListItemSecondaryAction>
            <Tooltip title='Kjøpt'>
              <Checkbox checked={alleOnskerTatt(onske)}
                disabled={alleOnskerTatt(onske) && !antallAlleredeKjoptAvMeg(onske)}
                onChange={this.onMarkerOnskeSomKjopt(onske)} />
            </Tooltip>
          </ListItemSecondaryAction>
        </ListItem>
        {((onske.antall && onske.antall > 1 && !alleOnskerTatt(onske)) || onske.onskeSize) &&
          <ListItemText
            className={`${this.kjoptAlleOnskerClassname(onske)} ${onske.favoritt ? 'antallOnskerTatt erFavoritt' : 'antallOnskerTatt'}`}
            secondary={this.lagAntallOgStrlTekst(onske)}
          />}
        <Divider />
      </div>,
    );

  velgeAntallDialog = (): React.ReactNode => {
    const { dialogOpen, valgtOnske, antallValgt } = this.state;
    const alleredeValgtAvMeg = antallAlleredeKjoptAvMeg(valgtOnske);
    let tilgjengeligeFortsatt = valgtOnske.antall || 0;

    (valgtOnske.kjoptAvListe || []).forEach(kjopt => tilgjengeligeFortsatt = tilgjengeligeFortsatt - kjopt.antallKjopt);
    const antallTilgjengeligeForMegTotalt = tilgjengeligeFortsatt + alleredeValgtAvMeg;

    return (
      <Dialog
        className="plukkOnskerDialog"
        open={dialogOpen}
        onClose={this.resetLocalState}
        TransitionComponent={Transition}
      >
        <DialogTitle>Det er fortsatt ledig {tilgjengeligeFortsatt} stk av <span
          className="onskeTekstDialog">{valgtOnske.onskeTekst}</span>.
          Hvor mange har du tenkt å kjøpe totalt?
          {alleredeValgtAvMeg > 0 && <span
            className="onskeTekstDialogLiten">(Inkludert de(n) {alleredeValgtAvMeg} du allerede har tatt)</span>}
        </DialogTitle>
        <DialogContent>
          <InputLabel id="antall-dialog-select-label">Antall</InputLabel>
          <Select
            labelId="antall-dialog-select-label"
            id="dialog-select"
            value={antallValgt}
            onChange={(e: SelectChangeEvent<number>) => {
              const newAntall = e.target.value as number;
              const { prisPerStk } = this.state;
              const newPris = prisPerStk != null && newAntall > 0
                ? String(Math.round(prisPerStk * newAntall))
                : this.state.prisInput;
              this.setState({ antallValgt: newAntall, prisInput: newPris });
            }}
            input={<Input />}
          >
            <MenuItem value={0}>{0}</MenuItem>
            {[...Array(antallTilgjengeligeForMegTotalt).keys()].map(nr =>
              <MenuItem key={nr + 1} value={nr + 1}>{nr + 1}</MenuItem>
            )}
          </Select>
          <div style={{ marginTop: 16 }}>
            <TextField
              label={antallValgt > 1 ? 'Totalpris (valgfritt)' : 'Pris (valgfritt)'}
              value={this.state.prisInput}
              inputProps={{ inputMode: 'numeric' }}
              InputProps={{ endAdornment: <span style={{ fontSize: '0.75rem', color: 'gray' }}>kr</span> }}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9,.]/g, '');
                const { antallValgt } = this.state;
                const parsed = Number(val.replace(',', '.'));
                const prisPerStk = val && !isNaN(parsed) && antallValgt > 0 ? parsed / antallValgt : null;
                this.setState({ prisInput: val, prisPerStk });
              }}
              variant="standard"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.resetLocalState}>Avbryt</Button>
          <Button onClick={this.onMarkerOnskerSomKjopt}>Lagre</Button>
        </DialogActions>
      </Dialog>
    );
  };

  prisDialog = (): React.ReactNode => {
    const { prisDialogOpen, valgtOnske, prisInput } = this.state;
    return (
      <Dialog open={prisDialogOpen} onClose={this.resetLocalState} TransitionComponent={Transition}>
        <DialogTitle>
          Kjøpt: <span className="onskeTekstDialog">{valgtOnske.onskeTekst}</span>
          <div style={{ fontSize: '0.75rem', fontStyle: 'italic', fontWeight: 'normal', marginTop: 4, color: 'gray' }}>
            På den nye Mine Kjøp siden din kan du nå i tillegg til å se alle kjøpene dine også se hvor mye du har brukt pr person og totalt
          </div>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Pris (valgfritt)"
            value={prisInput}
            inputProps={{ inputMode: 'numeric' }}
            InputProps={{ endAdornment: <span style={{ fontSize: '0.75rem', color: 'gray' }}>kr</span> }}
            onChange={(e) => this.setState({ prisInput: e.target.value.replace(/[^0-9,.]/g, '') })}
            onKeyDown={(e) => { if (e.key === 'Enter') this.saveSingleKjoep(); }}
            variant="standard"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.resetLocalState}>Avbryt</Button>
          <Button onClick={this.saveSingleKjoep} variant="contained">Lagre</Button>
        </DialogActions>
      </Dialog>
    );
  };

  render() {
    const { valgtVenn, valgtVennsListe } = this.props;
    const harGenerelleMaal = valgtVenn.measurements && Object.values(valgtVenn.measurements).some(k => !!k);
    return (
      <div className="vennerliste-side">
        <ListeVelger />
        <div className="vennerliste-side__liste">
          <div className="vennerliste-side__liste-inner">
            <h2>{valgtVenn && valgtVenn.navn && `Ønskelisten til ${valgtVenn.navn}`}</h2>
            <div className="minOnskeliste">
              <List dense={false}>
                {valgtVennsListe.length > 0 && <Divider />}
                {this.populerOnskeliste(valgtVennsListe)}
              </List>
            </div>
          </div>
        </div>
        {harGenerelleMaal &&
          <div className="vennerliste-side__measurements-container">
            <div className="vennerliste-side__measurements">
              <h4 style={{ textAlign: "center" }}>{`Generelle mål - ${valgtVenn.firstName}`}</h4>
              {Object.keys(valgtVenn.measurements!).filter(key => !!valgtVenn.measurements![key]).map(key => {
                return (
                  <p key={key}>
                    <span className="vennerliste-side__measurements__label">{finnLabelForStrl(key)}</span>
                    {`: ${valgtVenn.measurements![key]}`}
                  </p>);
              })}
            </div>
          </div>
        }
        {this.state.dialogOpen && this.velgeAntallDialog()}
        {this.state.prisDialogOpen && this.prisDialog()}
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  valgtVenn: state.vennersLister.valgtVenn,
  valgtVennsListe: state.vennersLister.valgtVennsListe || [],
  mittNavn: state.innloggetBruker.navn
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onEndreHeaderTekst: (nyTekst: string) => dispatch(endreHeaderTekst(nyTekst)),
});

export default connect(mapStateToProps, mapDispatchToProps)(VenneLister);
