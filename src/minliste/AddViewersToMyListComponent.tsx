/* eslint-disable no-use-before-define */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

import { addViewersToMyList } from '../Api';
import { myUid } from "../config/firebase";
import { RootState, Bruker, Viewer } from '../types';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

interface AddViewersProps {
  alleBrukere: Bruker[];
  myAllowedViewers: Viewer[];
}

class AddViewersToMyListComponent extends Component<AddViewersProps> {
  handleChange = (option: Viewer): void => {
    const { myAllowedViewers } = this.props;

    const skalFjernes = myAllowedViewers.find(v => v.value === option.value);

    let newAllowedList: Viewer[] = [];
    if (skalFjernes) {
      newAllowedList = myAllowedViewers.filter(v => v.value !== option.value);
    } else {
      myAllowedViewers.push(option);
      newAllowedList = myAllowedViewers;
    }

    addViewersToMyList(newAllowedList);
  };

  render() {
    const { alleBrukere, myAllowedViewers } = this.props;

    const people: Viewer[] = alleBrukere
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
        renderOption={(props, option) => (
          <li {...props} style={{ width: '100%' }} onClick={() => this.handleChange(option)}>
            <Checkbox
              icon={icon}
              checkedIcon={checkedIcon}
              style={{ marginRight: 8 }}
              checked={!!myAllowedViewers.find(v => v.value === option.value)}
            />
            {option.label}
          </li>
        )}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip label={option.label} {...getTagProps({ index })} onDelete={() => this.handleChange(option)} />
          ))
        }
        style={{ marginBottom: 15 }}
        renderInput={(params) => (
          <TextField {...params} variant="standard"
            placeholder="Søk etter navn" />
        )}
        fullWidth={true}
      />
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  alleBrukere: state.config.brukere,
  myAllowedViewers: state.innloggetBruker.allowedViewers,
});

export default connect(mapStateToProps, null)(AddViewersToMyListComponent);
