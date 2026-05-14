import React, { Component } from 'react';
import { connect } from 'react-redux';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import Grid from '@mui/material/Grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import SettingsIcon from '@mui/icons-material/Settings';
import Typography from '@mui/material/Typography';

import {
  removeWishFromMyList,
  removeWishFromExtraList,
  updateFavorittOnMyWish,
  updateWishFieldsOnExtraList,
  slettKjopteOnsker,
  slettKjopteOnskerPaaEkstraListe,
} from '../Api';
import { toggleLenkeDialog, endreHeaderTekst, settAktivListeId, settOpprettListeDialogOpen } from '../actions/actions';
import OnskeDialog from './LeggTilOnskeDialog';
import OpprettListeDialog from './OpprettListeDialog';
import { RootState, Onske, ExtraListMetadata, Bruker } from '../types';
import { Dispatch } from 'redux';

interface MinListeLocalState {
  administrerListe: ExtraListMetadata | null;
}

interface MinListeProps {
  onToggleLenkeDialog: (index: Partial<Onske> | undefined) => void;
  onEndreHeaderTekst: (nyTekst: string) => void;
  onSettAktivListeId: (listId: string | null) => void;
  onLukkOpprettListeDialog: () => void;
  innloggetBrukerNavn: string;
  myUid: string;
  mineOnsker: Onske[];
  slettKjopteOnskerEnabled: boolean;
  mineEkstraLister: ExtraListMetadata[];
  alleEkstraListeOnsker: Record<string, Onske[]>;
  opprettListeDialogOpen: boolean;
  alleBrukere: Bruker[];
  mainListName?: string;
}

class MinListe extends Component<MinListeProps, MinListeLocalState> {
  state: MinListeLocalState = { administrerListe: null };

  componentDidMount() {
    this.props.onEndreHeaderTekst('Rediger ønskeliste');
  }

  aapneDialog = (onske: Partial<Onske> | null, listId: string | null): void => {
    const { onSettAktivListeId, onToggleLenkeDialog } = this.props;
    onSettAktivListeId(listId);
    onToggleLenkeDialog(onske || undefined);
  };

  slettOnske = (onske: Onske, listId: string | null): void => {
    if (listId) {
      removeWishFromExtraList(listId, onske.key);
    } else {
      removeWishFromMyList(onske.key);
    }
  };

  settFavoritt = (onske: Onske, erFavoritt: boolean, listId: string | null): void => {
    if (listId) {
      updateWishFieldsOnExtraList(listId, onske.key, { favoritt: erFavoritt });
    } else {
      updateFavorittOnMyWish(onske.key, erFavoritt);
    }
  };

  lagAntallOgStrlKomponent = (onske: Onske): string => {
    let res = (onske.antall && onske.antall > 1) ? `Antall: ${onske.antall}` : '';
    if (onske.onskeSize) {
      res = res ? res.concat(` - Strl: ${onske.onskeSize}`) : `Strl: ${onske.onskeSize}`;
    }
    return res;
  };

  populerListe(onsker: Onske[], listId: string | null) {
    const sorted = [...onsker].sort((a, b) => (!a.favoritt ? 1 : 0) - (!b.favoritt ? 1 : 0));
    return sorted.map((onske, idx) =>
      <div key={onske.key || idx}>
        <ListItem
          className={onske.antall && onske.antall > 1 ? 'fjernPaddingUnder fjernPaddingVenstre' : 'fjernPaddingVenstre'}>
          {onske.favoritt ?
            <StarIcon className="stjerne favoritt" onClick={() => this.settFavoritt(onske, false, listId)} /> :
            <StarBorderIcon className="stjerne" onClick={() => this.settFavoritt(onske, true, listId)} />
          }
          <ListItemText
            className='wishText'
            primary={onske.onskeTekst}
            secondary={(() => {
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
            })()}
          />
          <ListItemSecondaryAction className='wishIconMenu'>
            <Tooltip title='Endre ønske'>
              <IconButton aria-label="Edit" onClick={() => this.aapneDialog(onske, listId)}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title='Slett'>
              <IconButton aria-label="Delete" onClick={() => this.slettOnske(onske, listId)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </ListItemSecondaryAction>
        </ListItem>
        {((onske.antall && onske.antall > 1) || onske.onskeSize) &&
          <ListItemText
            className='antallOnskerTatt'
            secondary={this.lagAntallOgStrlKomponent(onske)}
          />
        }
        <Divider />
      </div>
    );
  }

  render() {
    const {
      innloggetBrukerNavn, myUid, mineOnsker, slettKjopteOnskerEnabled,
      mineEkstraLister, alleEkstraListeOnsker,
      opprettListeDialogOpen, onLukkOpprettListeDialog, alleBrukere, mainListName,
    } = this.props;
    const { administrerListe } = this.state;

    return (
      <div className="minListe">
        <p>Velkommen {innloggetBrukerNavn}</p>

        {/* Hovedliste */}
        <div className="addNewWish" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <Button className="addNewWishButton" variant="contained" color="inherit"
            onClick={() => this.aapneDialog(null, null)} startIcon={<PlaylistAddIcon />}>
            Legg til ønske
          </Button>
          {slettKjopteOnskerEnabled && (
            <Button variant="outlined" color="error" onClick={() => slettKjopteOnsker(mineOnsker)}>
              Slett kjøpte ønsker
            </Button>
          )}
        </div>

        <Grid>
          <h2>{mainListName || 'Min ønskeliste'}</h2>
          <div className="minOnskeliste">
            <List dense={false}>
              {mineOnsker.length > 0 && <Divider />}
              {this.populerListe(mineOnsker, null)}
            </List>
          </div>
        </Grid>

        {/* Ekstra lister */}
        {mineEkstraLister.map(liste => {
          const onsker = alleEkstraListeOnsker[liste.key] || [];
          const otherUid = liste.sharedWithUid
            ? (liste.ownerUid === myUid ? liste.sharedWithUid : liste.ownerUid)
            : null;
          const otherUser = otherUid ? alleBrukere.find(b => b.uid === otherUid) : null;

          return (
            <div key={liste.key}>
              <Divider style={{ marginTop: 24, borderStyle: 'dashed' }} />
              <Grid>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ textAlign: 'center' }}>
                      <h2 style={{ margin: 0 }}>{liste.name}</h2>
                      {otherUser && (
                        <Typography variant="caption" color="text.secondary">
                          Delt liste med {otherUser.navn}
                        </Typography>
                      )}
                    </div>
                    <Tooltip title="Administrer liste">
                      <IconButton size="small" onClick={() => this.setState({ administrerListe: liste })}>
                        <SettingsIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', margin: '8px 0', justifyContent: 'center' }}>
                    <Button variant="contained" color="inherit" size="small"
                      onClick={() => this.aapneDialog(null, liste.key)} startIcon={<PlaylistAddIcon />}>
                      Legg til ønske
                    </Button>
                    {slettKjopteOnskerEnabled && (
                      <Button variant="outlined" color="error" size="small"
                        onClick={() => slettKjopteOnskerPaaEkstraListe(liste.key, onsker)}>
                        Slett kjøpte ønsker
                      </Button>
                    )}
                  </div>
                </div>

                <div className="minOnskeliste">
                  <List dense={false}>
                    {onsker.length > 0 && <Divider />}
                    {this.populerListe(onsker, liste.key)}
                  </List>
                </div>
              </Grid>
            </div>
          );
        })}

        <OnskeDialog />

        <OpprettListeDialog
          open={opprettListeDialogOpen}
          onClose={onLukkOpprettListeDialog}
        />

        {administrerListe && (
          <OpprettListeDialog
            open={true}
            onClose={() => this.setState({ administrerListe: null })}
            editListe={administrerListe}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  innloggetBrukerNavn: state.innloggetBruker.navn,
  myUid: state.innloggetBruker.uid || '',
  mineOnsker: state.innloggetBruker.mineOnsker,
  slettKjopteOnskerEnabled: state.config.slettKjopteOnskerEnabled,
  mineEkstraLister: state.innloggetBruker.mineEkstraLister,
  alleEkstraListeOnsker: state.innloggetBruker.alleEkstraListeOnsker,
  opprettListeDialogOpen: state.innloggetBruker.opprettListeDialogOpen,
  alleBrukere: state.config.brukere,
  mainListName: state.innloggetBruker.mainListName,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onToggleLenkeDialog: (index: Partial<Onske> | undefined) => dispatch(toggleLenkeDialog(index)),
  onEndreHeaderTekst: (nyTekst: string) => dispatch(endreHeaderTekst(nyTekst)),
  onSettAktivListeId: (listId: string | null) => dispatch(settAktivListeId(listId)),
  onLukkOpprettListeDialog: () => dispatch(settOpprettListeDialogOpen(false)),
});

export default connect(mapStateToProps, mapDispatchToProps)(MinListe);
