import React, { Component } from 'react';
import { connect } from 'react-redux';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { endreHeaderTekst } from '../actions/actions';
import { setSlettKjopteOnskerEnabledApi } from '../Api';
import { RootState } from '../types';
import { Dispatch } from 'redux';

interface AdminProps {
  onEndreHeaderTekst: () => void;
  slettKjopteOnskerEnabled: boolean;
}

class Admin extends Component<AdminProps> {
  componentDidMount() {
    this.props.onEndreHeaderTekst();
  }

  render() {
    const { slettKjopteOnskerEnabled } = this.props;
    return (
      <div style={{ padding: 24 }}>
        <FormControlLabel
          control={
            <Switch
              checked={slettKjopteOnskerEnabled}
              onChange={(e) => setSlettKjopteOnskerEnabledApi(e.target.checked)}
              color="primary"
            />
          }
          label="Skru på slett kjøpte ønsker knapp"
        />
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  slettKjopteOnskerEnabled: state.config.slettKjopteOnskerEnabled,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onEndreHeaderTekst: () => dispatch(endreHeaderTekst('Admin')),
});

export default connect(mapStateToProps, mapDispatchToProps)(Admin);
