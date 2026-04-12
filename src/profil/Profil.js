import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {endreHeaderTekst} from '../actions/actions';
import TextField from '@material-ui/core/TextField/TextField';
import FormControl from '@material-ui/core/FormControl';
import {updateMyMeasumentOnProfile} from '../Api';
import {finnLabelForStrl, finnNavnFraUid, measurementKeys} from '../utils/util';
import AddViewersToMyListComponent from '../minliste/AddViewersToMyListComponent';
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText/ListItemText";
import Divider from "@material-ui/core/Divider";

class Profil extends Component {
    constructor(props) {
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
        const {onEndreHeaderTekst} = this.props;
        onEndreHeaderTekst();
    }

    lagreNyttMaal = (sizeKey, newSize) => {
        const {myUserDbKey} = this.props;
        this.setState({[sizeKey]: newSize});
        updateMyMeasumentOnProfile(myUserDbKey, newSize, sizeKey);
    };

    // TODO gjør dette her litt bedre. Hastet nå for å få det ut med POC på kjøpt liste asap
    visLenkeOgAntall = kjoep => {
        return <>
            <span>Antall: {kjoep.antall}</span>
            {kjoep.url && " - "}
            {kjoep.url && <a href={kjoep.url} target="_blank" rel="noopener noreferrer">Lenke</a>}
        </>
    };

    render() {
        const {measurements, mineKjoep, alleBrukere} = this.props;
        let harNoenKjoep = false;
        return (
            <div className="ProfilSide">
                <div className="ProfilSide__standard-profil-box ProfilSide__mine-kjoep">
                    <h3 className="ProfilSide__mine-kjoep__overskrift">Mine kjøp</h3>
                    {Object.keys(mineKjoep).map(brukerUid => {
                        const kjoepListe = mineKjoep[brukerUid];
                        if (kjoepListe && kjoepListe.length > 0) {
                            harNoenKjoep = true;
                            return (
                                <div className="ProfilSide__mine-kjoep__liste" key={brukerUid}>
                                    <div
                                        className="ProfilSide__mine-kjoep__liste-eier">{finnNavnFraUid(brukerUid, alleBrukere)}</div>
                                    <div className="ProfilSide__mine-kjoep__onsker">
                                        {kjoepListe.map((kjoep, idx) => {
                                            return (
                                                <div key={kjoep.onskeTekst + idx}>
                                                    <ListItem className="ProfilSide__mine-kjoep__liste-kjoep">
                                                        <ListItemText
                                                            className='wishText'
                                                            primary={kjoep.onskeTekst}
                                                            secondary={this.visLenkeOgAntall(kjoep)}
                                                        />
                                                    </ListItem>
                                                    {kjoepListe.length > (idx + 1) &&
                                                    <Divider className="ProfilSide__mine-kjoep__liste-divider"/>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    })}
                    {!harNoenKjoep && <span className="ProfilSide__mine-kjoep__ingen-kjoep">Du har ikke tatt noen ønsker enda</span>}
                </div>
                <div className="ProfilSide__standard-profil-box ProfilSide__egne-maal">
                    <h3>Mine generelle mål</h3>
                    <p className="ProfilSide__egne-maal__infotekst">Fyll inn de mål som passer for deg, de du lar
                        stå tomme vil ikke bli vist for andre</p>
                    {Object.values(measurementKeys).map(sizeKey => {
                        return (
                            <FormControl style={{marginRight: 15}} key={sizeKey}>
                                <TextField
                                    margin="dense"
                                    id={sizeKey}
                                    label={finnLabelForStrl(sizeKey)}
                                    value={this.state[sizeKey] !== null ? this.state[sizeKey] : (measurements && measurements[sizeKey]) || ''}
                                    type="text"
                                    onChange={(e) => {
                                        this.setState({[sizeKey]: e.target.value})
                                    }}
                                    onBlur={(e) => this.lagreNyttMaal(sizeKey, e.target.value)}
                                    onKeyDown={this.onKeyPressed}
                                />
                            </FormControl>
                        );
                    })}
                </div>
                <div className="ProfilSide__standard-profil-box ProfilSide__viewers-list">
                    <h3>Hvem skal kunne se listen din?</h3>
                    <AddViewersToMyListComponent/>
                </div>
            </div>
        );
    }
}

Profil.propTypes = {
    myUserDbKey: PropTypes.string,
    onEndreHeaderTekst: PropTypes.func,
    onFetchUsersMeasurements: PropTypes.func,
    measurements: PropTypes.object,
    mineKjoep: PropTypes.object,
    alleBrukere: PropTypes.array
};

const mapStateToProps = (state) => ({
    myUserDbKey: state.innloggetBruker.userDbKey,
    measurements: state.innloggetBruker.measurements,
    mineKjoep: state.innloggetBruker.mineKjoep,
    alleBrukere: state.config.brukere
});

const mapDispatchToProps = dispatch => ({
    onEndreHeaderTekst: () => dispatch(endreHeaderTekst('Profil')),

});

export default connect(mapStateToProps, mapDispatchToProps)(Profil);

