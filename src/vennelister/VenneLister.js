import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import Tooltip from '@material-ui/core/Tooltip';
import Checkbox from '@material-ui/core/Checkbox';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Slide from '@material-ui/core/Slide';
import StarIcon from '@material-ui/icons/Star';

import ListeVelger from './ListeVelger';
import {endreHeaderTekst} from '../actions/actions';
import {updateWishOnListWith} from '../Api';
import {
    alleOnskerTatt, antallAlleredeKjoptAvMeg,
    erInnloggetBrukersUid, finnLabelForStrl,
    inneholderInnloggetBrukersUid, kjoptListe,
    myName,
    myWishlistId,
    totalValgt
} from '../utils/util';


const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const initLocalState = {dialogOpen: false, valgtOnske: {}, antallValgt: 0};

class VenneLister extends Component {
    state = initLocalState;

    resetLocalState = () => this.setState(initLocalState);

    componentDidMount() {
        const {onEndreHeaderTekst} = this.props;
        onEndreHeaderTekst('Venners lister');
    }

    kjoptAlleOnskerClassname = onske => onske.antall === totalValgt(onske) ? inneholderInnloggetBrukersUid(onske.kjoptAvListe) ? 'onskeKjopt kjoptAvDeg' : 'onskeKjopt' : '';
    onskeErFavoritt = onske => onske.favoritt ? ' fjernPaddingVenstre' : '';

    onMarkerOnskeSomKjopt = onske => event => {
        const {valgtVenn} = this.props;

        if (onske.antall > 1) {
            this.setState({dialogOpen: true, valgtOnske: onske, antallValgt: antallAlleredeKjoptAvMeg(onske)});
        } else {
            const newValues = alleOnskerTatt(onske) ? {kjoptAvListe: []} :
                {
                    kjoptAvListe: [{
                        antallKjopt: 1,
                        kjoptAv: event.target.checked ? myWishlistId() : '',
                        kjoptAvNavn: event.target.checked ? myName() : '',
                    }]
                };
            updateWishOnListWith(newValues, onske, valgtVenn.uid);
        }
    };

    lenkeEllerKjoptAv(onske) {
        if (alleOnskerTatt(onske)) {
            const tattAvNavn = kjoptListe(onske).reduce((acc, bruker) => {
                const navn = erInnloggetBrukersUid(bruker.kjoptAv) ? 'deg' : bruker.kjoptAvNavn;
                const antallTatt = bruker.antallKjopt > 1 ? '('.concat(bruker.antallKjopt, ')') : '';
                acc = acc.concat(navn, antallTatt, ', ');
                return acc;
            }, '').slice(0, -2);
            return 'Tatt av ' + (onske.antall === 1 ? erInnloggetBrukersUid(onske.kjoptAvListe[0].kjoptAv) ? 'deg' : onske.kjoptAvListe[0].kjoptAvNavn : tattAvNavn);
        }
        return onske.url && (<a href={onske.url} target="_blank" rel="noopener noreferrer">Her kan den kjøpes</a>);
    }

    onMarkerOnskerSomKjopt = () => {
        const {valgtVenn, mittNavn} = this.props;
        const {antallValgt, valgtOnske} = this.state;

        const newKjoptAvListe = [...((valgtOnske.kjoptAvListe || []).filter(vo => vo.kjoptAv !== myWishlistId()))];

        if (antallValgt > 0) {
            newKjoptAvListe.push({kjoptAv: myWishlistId(), antallKjopt: antallValgt, kjoptAvNavn: mittNavn});
        }
        const newValues = {kjoptAvListe: newKjoptAvListe};

        updateWishOnListWith(newValues, valgtOnske, valgtVenn.uid);
        this.resetLocalState();
    };

    lagAntallOgStrlTekst = (onske) => {
        let res = (onske.antall && onske.antall > 1 && !alleOnskerTatt(onske)) ? `Antall tatt: ${totalValgt(onske)}/${onske.antall}` : "";
        if (onske.onskeSize) {
            res = res ? res.concat(` - Strl: ${onske.onskeSize}`) : `Strl: ${onske.onskeSize}`;
        }
        return res;
    };

    populerOnskeliste = (onskeliste) =>
        onskeliste.sort((a, b) => !a.favoritt - !b.favoritt).map(onske =>
            <div key={onske.onskeTekst + onskeliste.indexOf(onske)}>
                <ListItem
                    className={this.kjoptAlleOnskerClassname(onske) + this.onskeErFavoritt(onske) + (!alleOnskerTatt(onske) && onske.antall > 1 ? ' fjernPaddingUnder' : '')}>
                    {onske.favoritt &&
                    <StarIcon className={alleOnskerTatt(onske) ? "stjerne favorittTatt" : "stjerne favoritt"}/>
                    }
                    <ListItemText
                        className={alleOnskerTatt(onske) ? 'onskeKjoptTekst ' : onske.antall > 1 ? 'fjernPaddingUnder' : ''}
                        primary={onske.onskeTekst}
                        secondary={this.lenkeEllerKjoptAv(onske)}
                    />
                    <ListItemSecondaryAction>
                        <Tooltip title='Kjøpt'>
                            <Checkbox checked={alleOnskerTatt(onske)}
                                      disabled={alleOnskerTatt(onske) && !antallAlleredeKjoptAvMeg(onske)}
                                      onChange={this.onMarkerOnskeSomKjopt(onske)}/>
                        </Tooltip>
                        {/*<Tooltip title='Slett'>*/}
                        {/*    <IconButton aria-label="Delete" onClick={() => removeWishFromCurrentList(this.props.valgtVenn.uid, onske.key)}>*/}
                        {/*        <DeleteIcon/>*/}
                        {/*    </IconButton>*/}
                        {/*</Tooltip>*/}
                    </ListItemSecondaryAction>
                </ListItem>
                {(onske.antall && onske.antall > 1 && !alleOnskerTatt(onske) || onske.onskeSize) &&
                <ListItemText
                    className={`${this.kjoptAlleOnskerClassname(onske)} ${onske.favoritt ? 'antallOnskerTatt erFavoritt' : 'antallOnskerTatt'}`}
                    secondary={this.lagAntallOgStrlTekst(onske)}
                />}
                <Divider/>
            </div>,
        );

    velgeAntallDialog = () => {
        const {dialogOpen, valgtOnske, antallValgt} = this.state;
        const alleredeValgtAvMeg = antallAlleredeKjoptAvMeg(valgtOnske);
        let tilgjengeligeFortsatt = valgtOnske.antall;

        (valgtOnske.kjoptAvListe || []).forEach(kjopt => tilgjengeligeFortsatt = tilgjengeligeFortsatt - kjopt.antallKjopt);
        const antallTilgjengeligeForMegTotalt = tilgjengeligeFortsatt + alleredeValgtAvMeg;

        return (
            <Dialog
                className="plukkOnskerDialog"
                open={dialogOpen}
                onClose={this.resetLocalState}
                TransitionComponent={Transition}
            >
                <DialogTitle>Det er fortsatt ledig {tilgjengeligeFortsatt} stk av <span
                    className="onskeTekstDialog">{valgtOnske.onskeTekst}</span>.
                    Hvor mange har du tenkt å kjøpe totalt?
                    {alleredeValgtAvMeg > 0 && <span
                        className="onskeTekstDialogLiten">(Inkludert de(n) {alleredeValgtAvMeg} du allerede har tatt)</span>}
                </DialogTitle>
                <DialogContent>
                    <InputLabel id="antall-dialog-select-label">Antall</InputLabel>
                    <Select
                        labelId="antall-dialog-select-label"
                        id="dialog-select"
                        value={antallValgt}
                        onChange={(e) => this.setState({antallValgt: e.target.value})}
                        input={<Input/>}
                    >
                        <MenuItem value={0}>{0}</MenuItem>
                        {[...Array(antallTilgjengeligeForMegTotalt).keys()].map(nr =>
                            <MenuItem key={nr + 1} value={nr + 1}>{nr + 1}</MenuItem>
                        )}
                    </Select>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.resetLocalState}>Avbryt</Button>
                    <Button onClick={this.onMarkerOnskerSomKjopt}>Lagre</Button>
                </DialogActions>
            </Dialog>
        );
    };

    render() {
        const {valgtVenn, valgtVennsListe} = this.props;
        const harGenerelleMaal = valgtVenn.measurements && Object.values(valgtVenn.measurements).some(k => !!k);
        return (
            <div className="vennerliste-side">
                <ListeVelger/>
                <div className="vennerliste-side__liste">
                    <Grid item xs={12} md={6}>
                        <h2>{valgtVenn && valgtVenn.navn && `Ønskelisten til ${valgtVenn.navn}`}</h2>
                        <div className="minOnskeliste">
                            <List dense={false}>
                                {valgtVennsListe.length > 0 && <Divider/>}
                                {this.populerOnskeliste(valgtVennsListe)}
                            </List>
                        </div>
                    </Grid>
                </div>
                {harGenerelleMaal &&
                <div className="vennerliste-side__measurements-container">
                    <div className="vennerliste-side__measurements">
                        <h4 style={{textAlign: "center"}}>{`Generelle mål - ${valgtVenn.firstName}`}</h4>
                        {Object.keys(valgtVenn.measurements)
                            .filter(key => !!valgtVenn.measurements[key]).map(key => {
                                return (
                                    <p key={key}>
                                    <span
                                        className="vennerliste-side__measurements__label">{finnLabelForStrl(key)}</span>
                                        {`: ${valgtVenn.measurements[key]}`}
                                    </p>);
                            })}
                    </div>
                </div>
                }
                {this.state.dialogOpen && this.velgeAntallDialog()}
            </div>
        );
    }
}

VenneLister.propTypes = {
    valgtVenn: PropTypes.object,
    valgtVenneListe: PropTypes.array,
    onEndreHeaderTekst: PropTypes.func,
    mittNavn: PropTypes.string
};

const mapStateToProps = state => ({
    valgtVenn: state.vennersLister.valgtVenn,
    valgtVennsListe: state.vennersLister.valgtVennsListe || [],
    mittNavn: state.innloggetBruker.navn
});

const mapDispatchToProps = dispatch => ({
    onEndreHeaderTekst: (nyTekst) => dispatch(endreHeaderTekst(nyTekst)),
});

export default connect(mapStateToProps, mapDispatchToProps)(VenneLister);

