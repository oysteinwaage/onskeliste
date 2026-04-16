import React, { Component } from 'react';
import { connect } from 'react-redux';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import { fetdhOnskelisteForUid } from '../Api';
import { RootState, Bruker } from '../types';
import { Dispatch } from 'redux';

interface ListeVelgerState {
  valgtVennUid: string;
}

interface ListeVelgerProps {
  allUsers: Bruker[];
  allowedListsForMe: string[];
  onHentValgtVennsListe: (uid: string, venn: Bruker) => void;
}

class ListeVelger extends Component<ListeVelgerProps, ListeVelgerState> {
  constructor(props: ListeVelgerProps) {
    super(props);
    this.state = { valgtVennUid: '' };
  }

  handleChange = () => (event: SelectChangeEvent<string>): void => {
    const valgtBrukerUid = event.target.value;
    if (valgtBrukerUid !== '') {
      this.setState({ valgtVennUid: event.target.value });
      this.props.onHentValgtVennsListe(valgtBrukerUid, this.finnValgtVennObjekt(valgtBrukerUid)[0]);
    }
  };

  finnValgtVennObjekt = (valgtUid: string): Bruker[] => {
    return this.props.allUsers.filter(x => x.uid === valgtUid);
  };

  render() {
    const { allUsers, allowedListsForMe } = this.props;
    const venneliste = allUsers
      .filter(user => allowedListsForMe.includes(user.uid))
      .sort((a, b) => a.navn.localeCompare(b.navn));
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        <FormControl sx={{ m: 1, minWidth: 120 }}>
          <InputLabel htmlFor="navn-native-simple">Velg ønskeliste</InputLabel>
          <Select
            native
            value={this.state.valgtVennUid}
            onChange={this.handleChange()}
            label="Velg ønskeliste"
            inputProps={{
              name: 'navn',
              id: 'navn-native-simple',
            }}
          >
            <option value="" />
            {venneliste.map(venn => {
              return (<option key={venn.uid} value={venn.uid}>{venn.navn}</option>);
            })}
          </Select>
        </FormControl>
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  allUsers: state.config.brukere,
  allowedListsForMe: state.vennersLister.allowedListsForMe,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onHentValgtVennsListe: (uid: string, venn: Bruker) => dispatch(fetdhOnskelisteForUid(uid, venn) as any),
});

export default connect(mapStateToProps, mapDispatchToProps)(ListeVelger);
