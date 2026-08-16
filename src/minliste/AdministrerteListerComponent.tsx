import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fjernMinAdgangTilAAdministrere } from '../Api';
import { RootState, Bruker } from '../types';
import { Dispatch } from 'redux';
import { Badge } from '../components/ui/badge';

interface AdministrerteListerProps {
  alleBrukere: Bruker[];
  adminListsForMe: string[];
  aktivtAdministrertUid: string | null;
  onFjernAdgang: (ownerUid: string, currentAdminListsForMe: string[], aktivtAdministrertUid: string | null) => void;
}

class AdministrerteListerComponent extends Component<AdministrerteListerProps> {
  render() {
    const { alleBrukere, adminListsForMe, aktivtAdministrertUid, onFjernAdgang } = this.props;

    const personer = adminListsForMe
      .map(uid => alleBrukere.find(b => b.uid === uid))
      .filter((b): b is Bruker => !!b)
      .sort((a, b) => a.navn.localeCompare(b.navn));

    return (
      <div className="w-full">
        <p className="text-xs text-slate-400 mb-3">
          Lister du har fått tilgang til å administrere for andre. Du kan når som helst fjerne din egen tilgang.
        </p>

        {personer.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {personer.map(person => (
              <Badge
                key={person.uid}
                variant="secondary"
                onRemove={() => onFjernAdgang(person.uid, adminListsForMe, aktivtAdministrertUid)}
              >
                {person.navn}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">Du har ikke fått tilgang til å administrere andres lister ennå</p>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  alleBrukere: state.config.brukere,
  adminListsForMe: state.administrasjon.adminListsForMe,
  aktivtAdministrertUid: state.administrasjon.aktivUid,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onFjernAdgang: (ownerUid: string, currentAdminListsForMe: string[], aktivtAdministrertUid: string | null) =>
    dispatch(fjernMinAdgangTilAAdministrere(ownerUid, currentAdminListsForMe, aktivtAdministrertUid) as any),
});

export default connect(mapStateToProps, mapDispatchToProps)(AdministrerteListerComponent);
