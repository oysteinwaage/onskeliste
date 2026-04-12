import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import {updateLastSeenVersion} from '../Api';

const currentVersion = 2.6;

const changes = [
    {
        version: 2.0,
        releaseDate: "19.11.2020",
        changes: [
            "Single-sign-on: Forblir nå pålogget til man eksplisitt logger ut slik at man ikke trenger å logge inn på nytt hver gang",
            "Antall: Kan nå legge til antall på et ønske",
            "Vennevelger: Oppdatert velgeren av hvem som kan se din liste til å bli enklere og finere"
        ]
    },
    {
        version: 2.1,
        releaseDate: "21.11.2020",
        changes: ["Spinner: Viser nå spinner mens data laster eller man venter på sjekken om man er logget inn fra før"]
    },
    {
        version: 2.2,
        releaseDate: "22.11.2020",
        changes: [
            "Endringer-liste: Denne listen du ser nå med endringer siden sist innlogging",
            "Favoritter: Mulig å stjerne-markere de ønskene du har mest lyst på. Disse vil også legges øverst i listen din for å videre fremheve dem"
        ]
    },
    {
        version: 2.3,
        releaseDate: "01.12.2020",
        changes: [
            "Wenche-bug: Hver gang Wenche tok et ønske ble det registrert som 'tatt av undefined', dette skal nå være fikset",
        ]
    },
    {
        version: 2.4,
        releaseDate: "19.11.2021",
        changes: [
            "Kan nå legge inn størrelse (på klær, sko osv) i eget felt på hvert enkelt ønske, så vises det på samme måte som 'Antall' i ønskelisten din. Kan også oppdatere eksisterende ønsker med størrelse ved å trykke på blyanten på ønsket du vil endre på",
        ]
    },
    {
        version: 2.5,
        releaseDate: "19.11.2021",
        changes: [
            "Kan nå legge inn dine generelle størrelser (på klær, sko osv) inne på din egen Profil-side (Hamburgermeny -> Profil -> Mine generelle mål). Disse generelle målene vil bli vist samtidig som folk ser på din ønskeliste, og vil gjøre det enklere for alle å kjøpe riktige størrelser på både konkrete ønsker du har i listen din, men også om noen vil gå off-list og prøve seg på egen hånd :)",
            "Har flyttet listen hvor man legger til de som kan se på ønskelisten din inn til Profil-siden"
        ]
    },
    {
        version: 2.6,
        releaseDate: "27.11.2021",
        changes: [
            "Mine kjøp: Her blir det listet opp alle ønsker du har krysset ut fra noen andres ønskelister. Denne oversikten finner du inne på din Profil side. Dette er en første versjon og vil utvides etterhvert med flere funksjoner."
        ]
    }
];

class ChangesSinceLastLogin extends Component {

    handleClose = () => this.props.onUpdateLastSeenVersion(currentVersion, this.props.myUserDbKey);

    render() {
        const {lastSeenVersion} = this.props;
        return (
            <Dialog
                open={currentVersion > lastSeenVersion && window.location.pathname !== '/'}
                scroll='paper'
                aria-labelledby="scroll-dialog-title"
                aria-describedby="scroll-dialog-description"
            >
                <DialogTitle id="scroll-dialog-title">Endringer siden sist du logget inn!</DialogTitle>
                <DialogContent dividers={true}>
                    {changes.map(change => change.version > lastSeenVersion &&
                        <DialogContentText
                            id="scroll-dialog-description"
                            tabIndex={-1}
                            className="changesContent"
                            key={change.version}
                        >
                            <span className="changesHeader">
                                {"v.".concat(change.version, " - ", change.releaseDate)}
                            </span>
                            {change.changes.map(text =>
                                <li className="changesText" key={text.split(':')[0]}>
                                  <span className="header">{text.split(':')[0].concat(":")}</span>
                                  <span className="text">{text.split(':')[1]}</span>
                                </li>
                            )}
                        </DialogContentText>
                    )
                    }
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => this.handleClose()} color="primary">
                        Lukk
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

ChangesSinceLastLogin.propTypes = {
    onUpdateLastSeenVersion: PropTypes.func,
    lastSeenVersion: PropTypes.number,
    myUserDbKey: PropTypes.string
};

const mapStateToProps = state => ({
    lastSeenVersion: state.innloggetBruker.lastSeenVersion,
    myUserDbKey: state.innloggetBruker.userDbKey
});

const mapDispatchToProps = dispatch => ({
    onUpdateLastSeenVersion: (currentVersion, dbKey) => dispatch(updateLastSeenVersion(currentVersion, dbKey)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ChangesSinceLastLogin);

