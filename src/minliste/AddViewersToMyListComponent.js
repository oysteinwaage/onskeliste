/* eslint-disable no-use-before-define */

import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Chip from '@material-ui/core/Chip';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';

import {addViewersToMyList} from '../Api';
import {myUid} from "../config/firebase";

const icon = <CheckBoxOutlineBlankIcon fontSize="small"/>;
const checkedIcon = <CheckBoxIcon fontSize="small"/>;

class AddViewersToMyListComponent extends Component {
    handleChange = (option) => {
        const {myAllowedViewers} = this.props;

        const skalFjernes = myAllowedViewers.find(v => v.value === option.value);

        let newAllowedList = [];
        if (skalFjernes) {
            newAllowedList = myAllowedViewers.filter(v => v.value !== option.value);
        } else {
            myAllowedViewers.push(option);
            newAllowedList = myAllowedViewers;
        }

        addViewersToMyList(newAllowedList);
    };

    render() {
        const {alleBrukere, myAllowedViewers} = this.props;

        const people = alleBrukere
            .filter(user => user.uid !== myUid() && !user.invisible)
            .map(b => ({
                value: b.uid,
                label: b.navn,
            }));

        return (
            <Autocomplete
                multiple
                id="myAllowedViewersAutocomplete"
                options={people}
                value={myAllowedViewers}
                disableCloseOnSelect
                getOptionLabel={(option) => option.label}
                renderOption={(option) => (
                    <div style={{width: '100%'}} onClick={() => this.handleChange(option)}>
                        <Checkbox
                            icon={icon}
                            checkedIcon={checkedIcon}
                            style={{marginRight: 8}}
                            checked={!!myAllowedViewers.find(v => v.value === option.value)}
                        />
                        {option.label}
                    </div>
                )}
                renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                        <Chip label={option.label} {...getTagProps({ index })} onDelete={() => this.handleChange(option)} />
                    ))
                }
                style={{marginBottom: 15}}
                renderInput={(params) => (
                    <TextField {...params} variant="standard"
                               placeholder="Søk etter navn"/>
                )}
                fullWidth={true}
            />
        );
    }
}

AddViewersToMyListComponent.propTypes = {
    alleBrukere: PropTypes.array,
    myAllowedViewers: PropTypes.array
};

const mapStateToProps = state => ({
    alleBrukere: state.config.brukere,
    myAllowedViewers: state.innloggetBruker.allowedViewers,
});

export default connect(mapStateToProps, null)(AddViewersToMyListComponent);
