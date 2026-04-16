import React, { Component } from 'react';
import Button from '@mui/material/Button';
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

interface DialogState {
  urls: string[] | null;
  text: string | null;
  size: string | null;
  antall: number | string;
  antallChanged: boolean;
  urlsChanged: boolean;
  sizeChanged: boolean;
  textChanged: boolean;
}

const initState: DialogState = {
  urls: null,
  text: null,
  size: null,
  antall: '',
  antallChanged: false,
  urlsChanged: false,
  sizeChanged: false,
  textChanged: false
};

const antallOnskerValg = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

interface LeggTilOnskeDialogProps {
  openLenkeDialog: boolean;
  openLenkeDialogOnske: Partial<Onske>;
  onToggleLenkeDialog: () => void;
}

class LeggTilOnskeDialog extends Component<LeggTilOnskeDialogProps, DialogState> {
  constructor(props: LeggTilOnskeDialogProps) {
    super(props);
    this.state = { ...initState };
  }

  resettState = (): void => {
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

  saveChanges = (): void => {
    const { openLenkeDialogOnske, onToggleLenkeDialog } = this.props;
    const effectiveUrls = this.getEffectiveUrls().filter(u => u.trim());
    const cleanedUrls = effectiveUrls.map(u => opprettUrlAv(u) as string).filter(Boolean);

    if (!openLenkeDialogOnske.key) {
      addWishToMyList(
        {
          onskeTekst: this.state.text || '',
          urls: cleanedUrls.length > 0 ? cleanedUrls : undefined,
          antall: (this.state.antall as number) || 1,
          onskeSize: this.state.size as string | undefined
        }
      );
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
    const { text, size, antall } = this.state;
    const defaultText = openLenkeDialogOnske && openLenkeDialogOnske.onskeTekst;
    const defaultSize = openLenkeDialogOnske && openLenkeDialogOnske.onskeSize;
    const defaultAntall = (openLenkeDialogOnske && openLenkeDialogOnske.antall) || '';
    const erNyttOnske = !(openLenkeDialogOnske && openLenkeDialogOnske.key);
    const effectiveUrls = this.getEffectiveUrls();

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
            <TextField
              autoFocus
              margin="dense"
              id="text"
              label='Hva ønsker du deg'
              value={text !== null ? text : defaultText}
              type="text"
              fullWidth
              onChange={(e) => {
                this.setState({ text: e.target.value, textChanged: true });
              }}
              onKeyDown={this.onKeyPressed}
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
