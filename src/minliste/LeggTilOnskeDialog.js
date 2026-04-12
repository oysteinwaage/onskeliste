import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';


import {
    addWishToMyList,
    updateAntallOnMyList,
    updateLinkOnWishOnMyList, updateSizeOnMyList,
    updateWishTextOnMyList
} from "../Api";
import connect from "react-redux/es/connect/connect";
import {toggleLenkeDialog} from '../actions/actions';
import {opprettUrlAv} from "../utils/util";

const initState = {
    url: null,
    text: null,
    size: null,
    antall: '',
    antallChanged: false,
    urlChanged: false,
    sizeChanged: false,
    textChanged: false
};
const antallOnskerValg = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

class LeggTilOnskeDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {...initState};
    }

    resettState = () => {
        this.setState(initState)
    };

    cancel = () => {
        const {onToggleLenkeDialog} = this.props;
        onToggleLenkeDialog();
        this.resettState();
    };

    onKeyPressed = event => {
        const {openLenkeDialogOnske} = this.props;
        const harTekst = this.state.text || (openLenkeDialogOnske && openLenkeDialogOnske.onskeTekst);
        if (event.keyCode === 13 && harTekst) {
            this.saveChanges();
        }
    };

    saveChanges = () => {
        const {openLenkeDialogOnske, onToggleLenkeDialog} = this.props;
        if (!openLenkeDialogOnske.key) {
            addWishToMyList(
                {
                    onskeTekst: this.state.text,
                    url: opprettUrlAv(this.state.url),
                    antall: this.state.antall || 1,
                    onskeSize: this.state.size
                }
            )
        } else {
            // TODO undersøk om det heller kan være én funksjon som oppdaterer alle felter?
            if (this.state.urlChanged) {
                updateLinkOnWishOnMyList(this.state.url, openLenkeDialogOnske.key);
            }
            if (this.state.textChanged && this.state.text) {
                updateWishTextOnMyList(this.state.text, openLenkeDialogOnske.key);
            }
            if (this.state.antallChanged) {
                updateAntallOnMyList(this.state.antall, openLenkeDialogOnske.key);
            }
            if (this.state.sizeChanged) {
                updateSizeOnMyList(this.state.size, openLenkeDialogOnske.key);
            }
        }
        onToggleLenkeDialog();
        this.resettState();
    };

    endreAntall = nyttValg => {
        this.setState({antall: nyttValg.target.value, antallChanged: true})
    };

    render() {
        const {openLenkeDialog, onToggleLenkeDialog, openLenkeDialogOnske} = this.props;
        const {text, url, urlChanged, antall, size} = this.state;
        const defaultUrl = openLenkeDialogOnske && openLenkeDialogOnske.url;
        const defaultText = openLenkeDialogOnske && openLenkeDialogOnske.onskeTekst;
        const defaultSize = openLenkeDialogOnske && openLenkeDialogOnske.onskeSize;
        const defaultAntall = openLenkeDialogOnske && openLenkeDialogOnske.antall || '';
        const erNyttOnske = !(openLenkeDialogOnske && openLenkeDialogOnske.key);

        return (
            <div>
                <Dialog
                    open={openLenkeDialog}
                    onClose={onToggleLenkeDialog}
                    aria-labelledby="form-dialog-title"
                    disableBackdropClick
                    disableEscapeKeyDown
                >
                    <DialogTitle id="form-dialog-title">
                        {erNyttOnske ? "Legg til ønske" : "Oppdater ønske"}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {erNyttOnske ? "Ønsketekst er eneste obligatoriske felt, men jo mer informasjon du legger inn jo bedre!"
                                : "Har du lagt inn en lenke og ønsker å fjerne den igjen, bare tøm feltet og trykk lagre."
                            }
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="text"
                            label='Hva ønsker du deg'
                            value={text !== null ? text : defaultText}
                            type="text"
                            fullWidth
                            onChange={(e) => {
                                this.setState({text: e.target.value, textChanged: true})
                            }}
                            onKeyDown={this.onKeyPressed}
                        />
                        <FormControl style={{margin: 10, minWidth: 80,}}>
                            <InputLabel id="antall-onsker-label">Antall</InputLabel>
                            <Select
                                labelId="antall-onsker-label"
                                id="antall-onsker"
                                value={antall || defaultAntall}
                                onChange={this.endreAntall}
                            >
                                {antallOnskerValg.map(antall => <MenuItem key={antall}
                                                                          value={antall}>{antall}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <FormControl style={{margin: 5, width: 100,}}>
                            <TextField
                                margin="dense"
                                id="size"
                                label='Størrelse'
                                value={size !== null ? size : defaultSize}
                                type="text"
                                onChange={(e) => {
                                    this.setState({size: e.target.value, sizeChanged: true})
                                }}
                                onKeyDown={this.onKeyPressed}
                            />
                        </FormControl>
                        <TextField
                            margin="dense"
                            id="link"
                            label="lenke - http://www.eksempel.com"
                            type="url"
                            value={url || (!urlChanged && defaultUrl) || ''}
                            fullWidth
                            onChange={(e) => {
                                this.setState({url: e.target.value, urlChanged: true})
                            }}
                            onKeyDown={this.onKeyPressed}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.cancel()} color="primary">
                            Avbryt
                        </Button>
                        <Button disabled={!text && !openLenkeDialogOnske.onskeTekst || text === ""}
                                onClick={() => this.saveChanges()} color="primary">
                            Lagre
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

LeggTilOnskeDialog.propTypes = {
    openLenkeDialog: PropTypes.bool,
    openLenkeDialogOnske: PropTypes.object,
    onToggleLenkeDialog: PropTypes.func
};

const mapStateToProps = state => ({
    openLenkeDialog: state.innloggetBruker.openLenkeDialog,
    openLenkeDialogOnske: state.innloggetBruker.openLenkeDialogOnske,
});

const mapDispatchToProps = dispatch => ({
    onToggleLenkeDialog: () => dispatch(toggleLenkeDialog()),
});

export default connect(mapStateToProps, mapDispatchToProps)(LeggTilOnskeDialog);
