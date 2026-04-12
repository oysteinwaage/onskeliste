import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { endreHeaderTekst } from '../actions/actions';
import { setSlettKjopteOnskerEnabledApi } from '../Api';

class Admin extends Component {
    componentDidMount() {
        this.props.onEndreHeaderTekst('Admin');
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

Admin.propTypes = {
    onEndreHeaderTekst: PropTypes.func,
    slettKjopteOnskerEnabled: PropTypes.bool,
};

const mapStateToProps = state => ({
    slettKjopteOnskerEnabled: state.config.slettKjopteOnskerEnabled,
});

const mapDispatchToProps = dispatch => ({
    onEndreHeaderTekst: () => dispatch(endreHeaderTekst('Admin')),
});

export default connect(mapStateToProps, mapDispatchToProps)(Admin);
