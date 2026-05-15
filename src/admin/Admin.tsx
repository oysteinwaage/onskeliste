import React, { Component } from 'react';
import { connect } from 'react-redux';
import { endreHeaderTekst } from '../actions/actions';
import { setSlettKjopteOnskerEnabledApi } from '../Api';
import { RootState } from '../types';
import { Dispatch } from 'redux';
import { Switch } from '../components/ui/switch';

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
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Innstillinger</h2>
          <Switch
            id="slettKjopteToggle"
            checked={slettKjopteOnskerEnabled}
            onChange={(e) => setSlettKjopteOnskerEnabledApi((e.target as HTMLInputElement).checked)}
            label="Skru på «Slett kjøpte ønsker»-knapp"
          />
        </div>
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
