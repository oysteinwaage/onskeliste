import React, { Component } from 'react';
import { connect } from 'react-redux';
import { endreHeaderTekst } from '../actions/actions';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { updateMyMeasumentOnProfile } from '../Api';
import { finnLabelForStrl, finnNavnFraUid, measurementKeys } from '../utils/util';
import AddViewersToMyListComponent from '../minliste/AddViewersToMyListComponent';
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import { RootState, Bruker, Onske } from '../types';
import { Dispatch } from 'redux';

interface ProfilState {
  sko: string | null;
  bukse: string | null;
  genser_tskjorte: string | null;
  skjorte: string | null;
  bh: string | null;
  hansker: string | null;
  boksershorts: string | null;
  hatt: string | null;
  [key: string]: string | null;
}

interface ProfilProps {
  myUserDbKey: string;
  onEndreHeaderTekst: () => void;
  measurements: Record<string, string>;
  mineKjoep: Record<string, Onske[]>;
  alleBrukere: Bruker[];
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
      hatt: null
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

  // TODO gjør dette her litt bedre. Hastet nå for å få det ut med POC på kjøpt liste asap
  visLenkeOgAntall = (kjoep: Onske): React.ReactNode => {
    return <>
      <span>Antall: {kjoep.antall}</span>
      {kjoep.url && " - "}
      {kjoep.url && <a href={kjoep.url} target="_blank" rel="noopener noreferrer">Lenke</a>}
    </>
  };

  render() {
    const { measurements, mineKjoep, alleBrukere } = this.props;
    let harNoenKjoep = false;
    const ingenMaalFyltInn = !measurements || Object.values(measurements).every(v => !v);
    return (
      <div className="ProfilSide">
        <Accordion defaultExpanded sx={{ width: '100%' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <h3 style={{ margin: 0 }}>Mine kjøp</h3>
          </AccordionSummary>
          <AccordionDetails>
            {Object.keys(mineKjoep).map((brukerUid, colorIndex) => {
              const kjoepListe = mineKjoep[brukerUid];
              const groupColors = ['#e8f4f8', '#f0f4e8', '#f8f0e8', '#f4e8f4', '#e8f4f0', '#f8f4e0'];
              const bgColor = groupColors[colorIndex % groupColors.length];
              if (kjoepListe && kjoepListe.length > 0) {
                harNoenKjoep = true;
                return (
                  <div className="ProfilSide__mine-kjoep__liste" key={brukerUid} style={{ backgroundColor: bgColor, borderRadius: 8, marginBottom: 8, padding: '8px 12px', boxSizing: 'border-box', width: '100%', overflow: 'hidden' }}>
                    <div className="ProfilSide__mine-kjoep__liste-eier">{finnNavnFraUid(brukerUid, alleBrukere)}</div>
                    <div className="ProfilSide__mine-kjoep__onsker">
                      {kjoepListe.map((kjoep, idx) => (
                        <div key={kjoep.onskeTekst + idx}>
                          <ListItem className="ProfilSide__mine-kjoep__liste-kjoep">
                            <ListItemText
                              className='wishText'
                              primary={kjoep.onskeTekst}
                              secondary={this.visLenkeOgAntall(kjoep)}
                            />
                          </ListItem>
                          {kjoepListe.length > (idx + 1) &&
                            <Divider className="ProfilSide__mine-kjoep__liste-divider" />}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            })}
            {!harNoenKjoep && <span className="ProfilSide__mine-kjoep__ingen-kjoep">Du har ikke tatt noen ønsker enda</span>}
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
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  myUserDbKey: state.innloggetBruker.userDbKey,
  measurements: state.innloggetBruker.measurements,
  mineKjoep: state.innloggetBruker.mineKjoep,
  alleBrukere: state.config.brukere
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onEndreHeaderTekst: () => dispatch(endreHeaderTekst('Profil')),
});

export default connect(mapStateToProps, mapDispatchToProps)(Profil);
