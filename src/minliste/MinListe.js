import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd';
import Grid from '@material-ui/core/Grid';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit'
import Divider from '@material-ui/core/Divider';
import Tooltip from '@material-ui/core/Tooltip';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import StarIcon from '@material-ui/icons/Star';

import {removeWishFromMyList, updateFavorittOnMyWish} from '../Api';
import {toggleLenkeDialog, endreHeaderTekst} from '../actions/actions';
import OnskeDialog from './LeggTilOnskeDialog';

class MinListe extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const {onEndreHeaderTekst} = this.props;
        onEndreHeaderTekst('Rediger ønskeliste');
    }

    slettOnske(onske) {
        removeWishFromMyList(onske.key);
    }

    settFavoritt(onske, erFavoritt) {
        updateFavorittOnMyWish(onske.key, erFavoritt);
    }

    lagAntallOgStrlKomponent = (onske) => {
        let res = (onske.antall && onske.antall > 1) ? `Antall: ${onske.antall}` : "";
        if(onske.onskeSize) {
            res = res ? res.concat(` - Strl: ${onske.onskeSize}`) : `Strl: ${onske.onskeSize}`;
        }
        return res;
    };

    populerMinListe() {
        const {mineOnsker, onToggleLenkeDialog} = this.props;
        mineOnsker.sort((a, b) => !a.favoritt - !b.favoritt);
        return mineOnsker.map(onske =>
            <div key={onske.onskeTekst + mineOnsker.indexOf(onske)}>
                <ListItem
                    className={onske.antall > 1 ? 'fjernPaddingUnder fjernPaddingVenstre' : 'fjernPaddingVenstre'}>
                    {onske.favoritt ?
                        <StarIcon className="stjerne favoritt" onClick={() => this.settFavoritt(onske, false)}/> :
                        <StarBorderIcon className="stjerne" onClick={() => this.settFavoritt(onske, true)}/>
                    }
                    <ListItemText
                        className='wishText'
                        primary={onske.onskeTekst}
                        secondary={onske.url &&
                        <a href={onske.url} target="_blank" rel="noopener noreferrer">Her kan den kjøpes</a>
                        }
                    />
                    <ListItemSecondaryAction className='wishIconMenu'>
                        <Tooltip title='Endre ønske'>
                            <IconButton aria-label="Edit" onClick={() => onToggleLenkeDialog(onske)}>
                                <EditIcon/>
                            </IconButton>
                        </Tooltip>
                        <Tooltip title='Slett'>
                            <IconButton aria-label="Delete" onClick={() => this.slettOnske(onske)}>
                                <DeleteIcon/>
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
                <Divider/>
            </div>,
        );
    }

    render() {
        const {innloggetBrukerNavn, mineOnsker, onToggleLenkeDialog} = this.props;
        return (
            <div className="minListe">
                <p>
                    Velkommen {innloggetBrukerNavn}
                </p>
                <div className="addNewWish">
                    <Button className="addNewWishButton" variant="contained" color="default"
                            onClick={() => onToggleLenkeDialog(null)} startIcon={<PlaylistAddIcon/>}>Legg til
                        ønske </Button>
                </div>

                <div>
                    <Grid>
                        <h2>Min ønskeliste</h2>
                        <div className="minOnskeliste">
                            <List dense={false}>
                                {mineOnsker.length > 0 && <Divider/>}
                                {this.populerMinListe()}
                            </List>
                            <OnskeDialog/>
                        </div>
                    </Grid>
                </div>
            </div>
        );
    }
}

MinListe.propTypes = {
    onToggleLenkeDialog: PropTypes.func,
    onEndreHeaderTekst: PropTypes.func,
    innloggetBrukerNavn: PropTypes.string,
    mineOnsker: PropTypes.array
};

const mapStateToProps = state => ({
    innloggetBrukerNavn: state.innloggetBruker.navn,
    mineOnsker: state.innloggetBruker.mineOnsker,
});

const mapDispatchToProps = dispatch => ({
    onToggleLenkeDialog: (index) => dispatch(toggleLenkeDialog(index)),
    onEndreHeaderTekst: (nyTekst) => dispatch(endreHeaderTekst(nyTekst)),
});

export default connect(mapStateToProps, mapDispatchToProps)(MinListe);
