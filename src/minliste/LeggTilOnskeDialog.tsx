import React, { Component } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import {
  addWishToMyList,
  updateAntallOnMyList,
  updateUrlsOnWishOnMyList,
  updateSizeOnMyList,
  updateWishTextOnMyList
} from "../Api";
import { connect } from 'react-redux';
import { toggleLenkeDialog } from '../actions/actions';
import { opprettUrlAv } from "../utils/util";
import { RootState, Onske } from '../types';
import { Dispatch } from 'redux';
import { sokPrisjakt, PrisjaktProdukt } from '../services/PrisjaktService';

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
    });
  };

  saveChanges = (): void => {
    const { openLenkeDialogOnske, onToggleLenkeDialog } = this.props;
    const effectiveUrls = this.getEffectiveUrls().filter(u => u.trim());
    const cleanedUrls = effectiveUrls.map(u => opprettUrlAv(u) as string).filter(Boolean);

    if (!openLenkeDialogOnske.key) {
      addWishToMyList({
        onskeTekst: this.state.text || '',
        ...(cleanedUrls.length > 0 ? { urls: cleanedUrls } : {}),
        antall: (this.state.antall as number) || 1,
        onskeSize: this.state.size as string | undefined
      });
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
    onToggleLenkeDialog();
    this.resettState();
  };

  endreAntall = (nyttValg: SelectChangeEvent<number | string>): void => {
    this.setState({ antall: nyttValg.target.value, antallChanged: true });
  };

  render() {
    const { openLenkeDialog, onToggleLenkeDialog, openLenkeDialogOnske } = this.props;
    const { text, size, antall, sokeResultater, lasterSok, sokeApen } = this.state;
    const defaultText = openLenkeDialogOnske && openLenkeDialogOnske.onskeTekst;
    const defaultSize = openLenkeDialogOnske && openLenkeDialogOnske.onskeSize;
    const defaultAntall = (openLenkeDialogOnske && openLenkeDialogOnske.antall) || '';
    const erNyttOnske = !(openLenkeDialogOnske && openLenkeDialogOnske.key);
    const effectiveUrls = this.getEffectiveUrls();
    const textVerdi = text !== null ? text : (defaultText || '');

    const isMobile = window.matchMedia('(max-width: 599px)').matches;
    return (
      <div>
        <Dialog
          open={openLenkeDialog}
          fullScreen={isMobile}
          onClose={(event, reason) => {
            if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
              onToggleLenkeDialog();
            }
          }}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">
            {erNyttOnske ? "Legg til ønske" : "Oppdater ønske"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {erNyttOnske ? "Ønsketekst er eneste obligatoriske felt, men jo mer informasjon du legger inn jo bedre!"
                : "Du kan legge til og fjerne lenker ved å bruke knappene under."
              }
            </DialogContentText>

            <Autocomplete
              freeSolo
              open={sokeApen}
              onClose={() => this.setState({ sokeApen: false })}
              options={sokeResultater}
              getOptionLabel={(option) =>
                typeof option === 'string' ? option : option.navn
              }
              filterOptions={(x) => x}
              loading={lasterSok}
              inputValue={textVerdi}
              onInputChange={(_, value, reason) => {
                if (reason === 'clear') {
                  this.setState({ text: '', textChanged: true, urls: [], urlsChanged: true, sokeResultater: [] });
                } else if (reason === 'input') {
                  this.handleTextEndring(value);
                }
              }}
              onChange={(_, value) => {
                if (value && typeof value !== 'string') {
                  this.velgProdukt(value);
                }
              }}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.25 }}>
                    <img
                      src={option.bildeUrl}
                      alt=""
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      style={{ width: 40, height: 40, objectFit: 'contain', flexShrink: 0 }}
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2">{option.navn}</Typography>
                      {option.pris != null && (
                        <Typography variant="caption" color="text.secondary">
                          Fra kr {option.pris.toLocaleString('nb-NO')},-
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </li>
              )}
              PaperComponent={(props) => (
                <Paper {...props}>
                  {sokeResultater.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, pt: 1, pb: 0.5, borderBottom: 1, borderColor: 'divider' }}>
                      <Typography variant="caption" color="text.secondary">
                        Forslag fra prisjakt.no
                      </Typography>
                      <Button
                        size="small"
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => this.setState({ sokeResultater: [], sokeApen: false })}
                        sx={{ fontSize: '0.7rem', py: 0, minWidth: 0 }}
                      >
                        Ikke bruk prisjakt
                      </Button>
                    </Box>
                  )}
                  {props.children}
                </Paper>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  autoFocus
                  margin="dense"
                  label="Hva ønsker du deg"
                  fullWidth
                  onKeyDown={this.onKeyPressed}
                  helperText={sokeResultater.length > 0 ? 'Forslag fra prisjakt.no' : undefined}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {lasterSok ? <CircularProgress color="inherit" size={18} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
              <FormControl style={{ minWidth: 80 }}>
                <InputLabel id="antall-onsker-label">Antall</InputLabel>
                <Select
                  labelId="antall-onsker-label"
                  id="antall-onsker"
                  value={antall || defaultAntall}
                  onChange={this.endreAntall}
                  label="Antall"
                >
                  {antallOnskerValg.map(antall => <MenuItem key={antall} value={antall}>{antall}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl style={{ width: 100 }}>
                <TextField
                  id="size"
                  label='Størrelse'
                  value={size !== null ? size : defaultSize}
                  type="text"
                  onChange={(e) => {
                    this.setState({ size: e.target.value, sizeChanged: true });
                  }}
                  onKeyDown={this.onKeyPressed}
                />
              </FormControl>
            </div>

            <div style={{ marginTop: 12 }}>
              {effectiveUrls.map((url, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <TextField
                    margin="dense"
                    label={effectiveUrls.length > 1 ? `Lenke ${index + 1}` : "Lenke - http://www.eksempel.com"}
                    type="url"
                    value={url}
                    fullWidth
                    onChange={(e) => this.updateUrl(index, e.target.value)}
                    onKeyDown={this.onKeyPressed}
                  />
                  <IconButton size="small" onClick={() => this.removeUrl(index)} aria-label="Fjern lenke">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </div>
              ))}
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={this.addUrl}
                style={{ marginTop: 4 }}
              >
                Legg til lenke
              </Button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <Button onClick={() => this.cancel()} color="primary">
                Avbryt
              </Button>
              <Button disabled={(!text && !openLenkeDialogOnske.onskeTekst) || text === ""}
                onClick={() => this.saveChanges()} color="primary">
                Lagre
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  openLenkeDialog: state.innloggetBruker.openLenkeDialog,
  openLenkeDialogOnske: state.innloggetBruker.openLenkeDialogOnske,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onToggleLenkeDialog: () => dispatch(toggleLenkeDialog()),
});

export default connect(mapStateToProps, mapDispatchToProps)(LeggTilOnskeDialog);
