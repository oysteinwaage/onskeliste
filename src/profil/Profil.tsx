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
import { finnLabelForStrl, measurementKeys } from '../utils/util';
import AddViewersToMyListComponent from '../minliste/AddViewersToMyListComponent';
import { RootState } from '../types';
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
    };
  }

  componentDidMount() {
    this.props.onEndreHeaderTekst();
  }

  lagreNyttMaal = (sizeKey: string, newSize: string): void => {
    const { myUserDbKey } = this.props;
    this.setState({ [sizeKey]: newSize });
    updateMyMeasumentOnProfile(myUserDbKey, newSize, sizeKey);
  };

  render() {
    const { measurements } = this.props;

    return (
      <div className="ProfilSide">
        <Accordion defaultExpanded>
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
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onEndreHeaderTekst: () => dispatch(endreHeaderTekst('Profil')),
});

export default connect(mapStateToProps, mapDispatchToProps)(Profil);
