import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { RootState, AccessRequest } from '../types';
import { Dispatch } from 'redux';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogBody,
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';

interface AccessRequestNotificationProps {
  innkommendeForesporsler: AccessRequest[];
  pathname: string;
  onTaMegDit: () => void;
}

interface AccessRequestNotificationState {
  avvist: boolean;
}

class AccessRequestNotification extends Component<AccessRequestNotificationProps, AccessRequestNotificationState> {
  state: AccessRequestNotificationState = { avvist: false };

  componentDidUpdate(prevProps: AccessRequestNotificationProps) {
    // Nullstill «avvist» når forespørsler går fra tom → ikke-tom. Ved logg ut tømmer
    // RESET_ALL_DATA listen, og ny innlogging fyller den igjen, så modalen vises på nytt
    // ved hver innlogging selv om komponenten aldri re-monteres.
    if (prevProps.innkommendeForesporsler.length === 0 && this.props.innkommendeForesporsler.length > 0) {
      this.setState({ avvist: false });
    }
  }

  render() {
    const { innkommendeForesporsler, pathname, onTaMegDit } = this.props;
    const { avvist } = this.state;

    const skjulPaaSide = pathname === '/' || pathname === '/onboarding' || pathname === '/profil';
    const erApen = innkommendeForesporsler.length > 0 && !skjulPaaSide && !avvist;

    return (
      <Dialog open={erApen} onOpenChange={(o) => { if (!o) this.setState({ avvist: true }); }}>
        <DialogContent showClose={false} className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary-700">🎁 Noen vil se listen din!</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-sm text-slate-700 leading-relaxed">
              Noen har søkt om tilgang til å få se på din(e) ønskeliste(r). Du må godkjenne eller
              avvise forespørselen inne på din Profil-side.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => this.setState({ avvist: true })}>Senere</Button>
            <Button onClick={() => { this.setState({ avvist: true }); onTaMegDit(); }}>Ta meg dit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  innkommendeForesporsler: state.innloggetBruker.innkommendeTilgangsforesporsler,
  pathname: state.router?.location?.pathname || window.location.pathname,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onTaMegDit: () => dispatch(push('/profil')),
});

export default connect(mapStateToProps, mapDispatchToProps)(AccessRequestNotification);
