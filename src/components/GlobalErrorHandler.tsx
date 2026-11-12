import React, { Component, ErrorInfo, ReactNode } from 'react';
import { connect } from 'react-redux';
import { sendFeedback } from '../Api';
import { RootState } from '../types';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';

interface GlobalErrorHandlerProps {
  children: ReactNode;
  brukerUid: string;
  brukerNavn: string;
}

interface GlobalErrorHandlerState {
  open: boolean;
  reactCrash: boolean;
  feilmelding: string;
  sender: boolean;
  sendt: boolean;
}

class GlobalErrorHandler extends Component<GlobalErrorHandlerProps, GlobalErrorHandlerState> {
  state: GlobalErrorHandlerState = {
    open: false, reactCrash: false, feilmelding: '', sender: false, sendt: false,
  };

  static getDerivedStateFromError(error: Error) {
    return {
      open: true,
      reactCrash: true,
      feilmelding: error.stack || error.message || String(error),
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Ufanget feil i komponenttre:', error, info);
  }

  componentDidMount() {
    window.addEventListener('error', this.handleWindowError);
    window.addEventListener('unhandledrejection', this.handleRejection);
  }

  componentWillUnmount() {
    window.removeEventListener('error', this.handleWindowError);
    window.removeEventListener('unhandledrejection', this.handleRejection);
  }

  handleWindowError = (event: ErrorEvent) => {
    const feilmelding = event.error?.stack || event.message || 'Ukjent feil';
    this.setState({ open: true, feilmelding, sendt: false });
  };

  handleRejection = (event: PromiseRejectionEvent) => {
    const { reason } = event;
    const feilmelding = reason instanceof Error ? (reason.stack || reason.message) : String(reason);
    this.setState({ open: true, feilmelding: feilmelding || 'Ukjent feil', sendt: false });
  };

  handleSendTilOystein = async (): Promise<void> => {
    const { brukerUid, brukerNavn } = this.props;
    const { feilmelding } = this.state;
    this.setState({ sender: true });
    const tekst = [
      'Automatisk feilrapport',
      `Side: ${window.location.pathname}`,
      `Tidspunkt: ${new Date().toLocaleString('nb-NO')}`,
      '',
      'Feilmelding:',
      feilmelding || 'Ingen feilmelding tilgjengelig',
    ].join('\n');
    await sendFeedback(tekst, brukerUid, brukerNavn);
    this.setState({ sender: false, sendt: true });
  };

  handleOpenChange = (open: boolean): void => {
    if (!open) {
      this.setState({ open: false, sendt: false });
    }
  };

  render() {
    const { open, reactCrash, feilmelding, sender, sendt } = this.state;

    return (
      <>
        {reactCrash ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <p className="text-slate-600 mb-4">Noe gikk galt. Last siden på nytt for å fortsette.</p>
              <Button onClick={() => window.location.reload()}>Last siden på nytt</Button>
            </div>
          </div>
        ) : this.props.children}
        <Dialog open={open} onOpenChange={this.handleOpenChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Det har skjedd en feil</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <div className="mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={this.handleSendTilOystein}
                  disabled={sender || sendt}
                >
                  {sendt ? 'Sendt til Øystein ✓' : sender ? 'Sender...' : 'Send inn feilen til Øystein'}
                </Button>
              </div>
              <p className="text-sm text-slate-600 mb-3">
                Beklager, noe gikk galt. Du kan prøve å laste siden på nytt, eller sende feilen til Øystein over.
              </p>
              {feilmelding && (
                <pre className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3 whitespace-pre-wrap break-words max-h-48 overflow-y-auto">
                  {feilmelding}
                </pre>
              )}
            </DialogBody>
            <DialogFooter>
              <Button variant="outline" onClick={() => this.handleOpenChange(false)}>Lukk</Button>
              <Button onClick={() => window.location.reload()}>Last siden på nytt</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  brukerUid: state.innloggetBruker.uid || '',
  brukerNavn: state.innloggetBruker.navn,
});

export default connect(mapStateToProps)(GlobalErrorHandler);
