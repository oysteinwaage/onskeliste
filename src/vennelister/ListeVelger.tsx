import React, { Component } from 'react';
import { connect } from 'react-redux';

import { fetdhOnskelisteForUid, fetchExtraListsForFriend } from '../Api';
import { settValgtVennsListeId } from '../actions/actions';
import { RootState, Bruker } from '../types';
import { Dispatch } from 'redux';

interface ListeVelgerState {
  valgtVennUid: string;
}

interface ListeVelgerProps {
  allUsers: Bruker[];
  allowedListsForMe: string[];
  onHentValgtVennsListe: (uid: string, venn: Bruker) => void;
  onFetchExtraLists: (uid: string) => void;
  onResetVennsListeId: () => void;
}

class ListeVelger extends Component<ListeVelgerProps, ListeVelgerState> {
  constructor(props: ListeVelgerProps) {
    super(props);
    this.state = { valgtVennUid: '' };
  }

  handleChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const valgtBrukerUid = event.target.value;
    if (valgtBrukerUid !== '') {
      this.setState({ valgtVennUid: valgtBrukerUid });
      const venn = this.props.allUsers.find(x => x.uid === valgtBrukerUid);
      if (!venn) return;
      this.props.onResetVennsListeId();
      this.props.onHentValgtVennsListe(valgtBrukerUid, venn);
      this.props.onFetchExtraLists(valgtBrukerUid);
    }
  };

  render() {
    const { allUsers, allowedListsForMe } = this.props;
    const venneliste = allUsers
      .filter(user => allowedListsForMe.includes(user.uid))
      .sort((a, b) => a.navn.localeCompare(b.navn));

    return (
      <div className="flex justify-center">
        <div className="w-full max-w-xs">
          <label className="text-sm font-medium text-slate-700 block mb-1.5 text-center">
            Velg ønskeliste
          </label>
          <select
            value={this.state.valgtVennUid}
            onChange={this.handleChange}
            className="flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 hover:border-slate-400 transition-colors cursor-pointer appearance-none text-center"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
          >
            <option value="">— Velg person —</option>
            {venneliste.map(venn => (
              <option key={venn.uid} value={venn.uid}>{venn.navn}</option>
            ))}
          </select>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  allUsers: state.config.brukere,
  allowedListsForMe: state.vennersLister.allowedListsForMe,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onHentValgtVennsListe: (uid: string, venn: Bruker) => dispatch(fetdhOnskelisteForUid(uid, venn) as any),
  onFetchExtraLists: (uid: string) => dispatch(fetchExtraListsForFriend(uid) as any),
  onResetVennsListeId: () => dispatch(settValgtVennsListeId(null)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ListeVelger);
