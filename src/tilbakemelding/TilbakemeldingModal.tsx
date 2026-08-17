import React, { Component } from 'react';
import { connect } from 'react-redux';
import { sendFeedback } from '../Api';
import { RootState } from '../types';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody,
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';

interface TilbakemeldingModalOwnProps {
  open: boolean;
  onClose: () => void;
}

interface TilbakemeldingModalProps extends TilbakemeldingModalOwnProps {
  brukerUid: string;
  brukerNavn: string;
}

interface TilbakemeldingModalState {
  tekst: string;
  sendt: boolean;
  sender: boolean;
}

class TilbakemeldingModal extends Component<TilbakemeldingModalProps, TilbakemeldingModalState> {
  state: TilbakemeldingModalState = { tekst: '', sendt: false, sender: false };

  handleOpenChange = (open: boolean): void => {
    if (!open) {
      this.props.onClose();
      this.setState({ tekst: '', sendt: false, sender: false });
    }
  };

  handleSend = async (): Promise<void> => {
    const { brukerUid, brukerNavn } = this.props;
    const { tekst } = this.state;
    if (!tekst.trim()) return;
    this.setState({ sender: true });
    await sendFeedback(tekst.trim(), brukerUid, brukerNavn);
    this.setState({ tekst: '', sendt: true, sender: false });
  };

  render() {
    const { open } = this.props;
    const { tekst, sendt, sender } = this.state;

    return (
      <Dialog open={open} onOpenChange={this.handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tilbakemelding</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-sm text-slate-500 mb-4">
              Send oss gjerne en tilbakemelding — ønske om ny funksjonalitet, en feil du har oppdaget, eller noe annet du vil si.
            </p>
            {sendt ? (
              <div className="text-center py-6">
                <p className="text-primary-700 font-medium mb-1">Takk for tilbakemeldingen!</p>
                <button
                  className="text-sm text-slate-500 underline mt-2"
                  onClick={() => this.setState({ sendt: false })}
                >
                  Send en til
                </button>
              </div>
            ) : (
              <>
                <textarea
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 resize-none hover:border-slate-400 transition-colors"
                  style={{ fontSize: 'max(16px, 1em)' }}
                  rows={5}
                  placeholder="Skriv din tilbakemelding her..."
                  value={tekst}
                  onChange={e => this.setState({ tekst: e.target.value })}
                />
                <div className="mt-3 flex justify-end">
                  <Button onClick={this.handleSend} disabled={!tekst.trim() || sender}>
                    {sender ? 'Sender...' : 'Send tilbakemelding'}
                  </Button>
                </div>
              </>
            )}
          </DialogBody>
        </DialogContent>
      </Dialog>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  brukerUid: state.innloggetBruker.uid || '',
  brukerNavn: state.innloggetBruker.navn,
});

export default connect(mapStateToProps)(TilbakemeldingModal);
