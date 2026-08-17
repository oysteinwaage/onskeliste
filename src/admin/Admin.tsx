import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Mail, Calendar, Clock, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { endreHeaderTekst } from '../actions/actions';
import { setSlettKjopteOnskerEnabledApi, setTilbakemeldingEnabledApi, deleteUserAsAdmin } from '../Api';
import { RootState, Bruker } from '../types';
import { Dispatch } from 'redux';
import { Switch } from '../components/ui/switch';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../components/ui/accordion';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';

interface AdminProps {
  onEndreHeaderTekst: () => void;
  onSetTilbakemeldingEnabled: (enabled: boolean) => void;
  onSlettBruker: (uid: string, userDbKey: string) => Promise<void>;
  slettKjopteOnskerEnabled: boolean;
  tilbakemeldingEnabled: boolean;
  alleBrukere: Bruker[];
}

interface AdminState {
  slettBruker: Bruker | null;
  sletter: boolean;
}

const formaterDato = (timestamp?: number): string => {
  if (!timestamp) return 'Ukjent';
  return new Date(timestamp).toLocaleString('nb-NO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

class Admin extends Component<AdminProps, AdminState> {
  state: AdminState = { slettBruker: null, sletter: false };

  componentDidMount() {
    this.props.onEndreHeaderTekst();
  }

  handleSlettBruker = async (): Promise<void> => {
    const { slettBruker } = this.state;
    if (!slettBruker) return;
    this.setState({ sletter: true });
    await this.props.onSlettBruker(slettBruker.uid, slettBruker.key);
    this.setState({ slettBruker: null, sletter: false });
  };

  render() {
    const { slettKjopteOnskerEnabled, tilbakemeldingEnabled, onSetTilbakemeldingEnabled, alleBrukere } = this.props;
    const { slettBruker, sletter } = this.state;

    return (
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Innstillinger</h2>
          <div className="flex flex-col gap-4">
            <Switch
              id="slettKjopteToggle"
              checked={slettKjopteOnskerEnabled}
              onChange={(e) => setSlettKjopteOnskerEnabledApi((e.target as HTMLInputElement).checked)}
              label="Skru på «Slett kjøpte ønsker»-knapp"
            />
            <Switch
              id="tilbakemeldingToggle"
              checked={tilbakemeldingEnabled}
              onChange={(e) => onSetTilbakemeldingEnabled((e.target as HTMLInputElement).checked)}
              label="Vis Tilbakemelding-menyvalg for vanlige brukere"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Brukere ({alleBrukere.length})
          </h2>
          <Accordion type="multiple" className="divide-y divide-slate-100">
            {alleBrukere.map(bruker => (
              <AccordionItem key={bruker.key} value={bruker.key} className="border-none">
                <AccordionTrigger className={`text-sm font-medium py-3 ${bruker.onboardingCompleted ? 'text-slate-800' : 'text-red-600'}`}>
                  {bruker.navn}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                      {bruker.email || 'Ukjent'}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
                      Opprettet: {formaterDato(bruker.createdAt)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 shrink-0 text-slate-400" />
                      Siste innlogging: {formaterDato(bruker.lastLogin)}
                    </div>
                    <div className="flex items-center gap-2">
                      {bruker.onboardingCompleted ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      ) : (
                        <XCircle className="h-4 w-4 shrink-0 text-slate-400" />
                      )}
                      Onboarding {bruker.onboardingCompleted ? 'fullført' : 'ikke fullført'}
                    </div>
                    <Button
                      variant="outline-destructive"
                      size="sm"
                      className="gap-2 mt-2 self-start"
                      onClick={() => this.setState({ slettBruker: bruker })}
                    >
                      <Trash2 className="h-4 w-4" />
                      Slett brukeren
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <Dialog open={!!slettBruker} onOpenChange={open => { if (!open) this.setState({ slettBruker: null }); }}>
          <DialogContent showClose={false}>
            <DialogHeader>
              <DialogTitle>Slett {slettBruker?.navn}?</DialogTitle>
              <DialogDescription>
                Dette vil permanent slette all data for brukeren, ønskelisten og alle tilknyttede data. Handlingen kan ikke angres.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => this.setState({ slettBruker: null })}
                disabled={sletter}
              >
                Avbryt
              </Button>
              <Button
                variant="destructive"
                onClick={this.handleSlettBruker}
                disabled={sletter}
              >
                {sletter ? 'Sletter...' : 'Ja, slett brukeren'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  slettKjopteOnskerEnabled: state.config.slettKjopteOnskerEnabled,
  tilbakemeldingEnabled: state.config.tilbakemeldingEnabled,
  alleBrukere: state.config.brukere,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onEndreHeaderTekst: () => dispatch(endreHeaderTekst('Admin')),
  onSetTilbakemeldingEnabled: (enabled: boolean) => dispatch(setTilbakemeldingEnabledApi(enabled) as any),
  onSlettBruker: (uid: string, userDbKey: string) => dispatch(deleteUserAsAdmin(uid, userDbKey) as any),
});

export default connect(mapStateToProps, mapDispatchToProps)(Admin);
