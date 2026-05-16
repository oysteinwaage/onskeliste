import React, { Component } from 'react';
import { connect } from 'react-redux';
import { endreHeaderTekst } from '../actions/actions';
import { updateMyMeasumentOnProfile, updateMainListName, deleteMyAccount } from '../Api';
import { finnLabelForStrl, measurementKeys } from '../utils/util';
import AddViewersToMyListComponent from '../minliste/AddViewersToMyListComponent';
import { RootState } from '../types';
import { Dispatch } from 'redux';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Trash2 } from 'lucide-react';

interface ProfilState {
  sko: string | null;
  bukse: string | null;
  genser_tskjorte: string | null;
  skjorte: string | null;
  bh: string | null;
  hansker: string | null;
  boksershorts: string | null;
  hatt: string | null;
  mainListName: string | null;
  slettDialogApen: boolean;
  sletter: boolean;
  [key: string]: string | null | boolean;
}

interface ProfilProps {
  myUserDbKey: string;
  onEndreHeaderTekst: () => void;
  measurements: Record<string, string>;
  mainListName?: string;
  onUpdateMainListName: (userDbKey: string, navn: string) => void;
  onSlettBruker: (userDbKey: string) => void;
}

class Profil extends Component<ProfilProps, ProfilState> {
  constructor(props: ProfilProps) {
    super(props);
    this.state = {
      sko: null, bukse: null, genser_tskjorte: null,
      skjorte: null, bh: null, hansker: null,
      boksershorts: null, hatt: null, mainListName: null,
      slettDialogApen: false, sletter: false,
    };
  }

  componentDidMount() {
    this.props.onEndreHeaderTekst();
  }

  lagreNyttMaal = (sizeKey: string, newSize: string): void => {
    const { myUserDbKey } = this.props;
    this.setState({ [sizeKey]: newSize });
    updateMyMeasumentOnProfile(myUserDbKey, newSize, sizeKey);
  };

  handleSlettBruker = (): void => {
    const { myUserDbKey, onSlettBruker } = this.props;
    this.setState({ sletter: true });
    onSlettBruker(myUserDbKey);
  };

  render() {
    const { measurements, mainListName, myUserDbKey, onUpdateMainListName } = this.props;
    const { slettDialogApen, sletter } = this.state;

    return (
      <div className="max-w-xl mx-auto px-4 py-6">
        <Accordion type="multiple" defaultValue={['maal']} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
          {/* Navn på ønskeliste */}
          <AccordionItem value="listenavn" className="border-none px-4">
            <AccordionTrigger className="text-sm font-semibold text-slate-800">
              Navn på hoved ønskeliste
            </AccordionTrigger>
            <AccordionContent>
              <Input
                id="mainListName"
                label="Navn på ønskelisten din (valgfritt)"
                placeholder="Min ønskeliste"
                value={this.state.mainListName !== null ? this.state.mainListName : (mainListName || '')}
                type="text"
                helperText="Vises istedenfor «Min ønskeliste» på din side og hos venner"
                onChange={(e) => this.setState({ mainListName: e.target.value })}
                onBlur={(e) => {
                  onUpdateMainListName(myUserDbKey, e.target.value.trim());
                  this.setState({ mainListName: null });
                }}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Hvem kan se listen */}
          <AccordionItem value="tilgang" className="border-none px-4">
            <AccordionTrigger className="text-sm font-semibold text-slate-800">
              Hvem skal kunne se listen din?
            </AccordionTrigger>
            <AccordionContent>
              <AddViewersToMyListComponent />
            </AccordionContent>
          </AccordionItem>

          {/* Mål */}
          <AccordionItem value="maal" className="border-none px-4">
            <AccordionTrigger className="text-sm font-semibold text-slate-800">
              Mine generelle mål
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-xs text-slate-400 mb-3">
                Fyll inn de mål som passer for deg, de du lar stå tomme vil ikke bli vist for andre
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {Object.values(measurementKeys).map(sizeKey => (
                  <Input
                    key={sizeKey}
                    id={sizeKey}
                    label={finnLabelForStrl(sizeKey)}
                    value={this.state[sizeKey] !== null ? (this.state[sizeKey] as string) : ((measurements && measurements[sizeKey]) || '')}
                    type="text"
                    placeholder="—"
                    onChange={(e) => this.setState({ [sizeKey]: e.target.value })}
                    onBlur={(e) => this.lagreNyttMaal(sizeKey, e.target.value)}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-8 pt-6 border-t border-slate-200">
          <button
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition-colors"
            onClick={() => this.setState({ slettDialogApen: true })}
          >
            <Trash2 className="w-4 h-4" />
            Slett brukeren min
          </button>
        </div>

        <Dialog open={slettDialogApen} onOpenChange={open => this.setState({ slettDialogApen: open })}>
          <DialogContent showClose={false}>
            <DialogHeader>
              <DialogTitle>Slett konto</DialogTitle>
              <DialogDescription>
                Dette vil permanent slette kontoen din, ønskelisten og alle tilknyttede data. Handlingen kan ikke angres.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => this.setState({ slettDialogApen: false })}
                disabled={sletter}
              >
                Avbryt
              </Button>
              <Button
                variant="destructive"
                onClick={this.handleSlettBruker}
                disabled={sletter}
              >
                {sletter ? 'Sletter...' : 'Ja, slett kontoen'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  myUserDbKey: state.innloggetBruker.userDbKey,
  measurements: state.innloggetBruker.measurements,
  mainListName: state.innloggetBruker.mainListName,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onEndreHeaderTekst: () => dispatch(endreHeaderTekst('Profil')),
  onUpdateMainListName: (userDbKey: string, navn: string) => dispatch(updateMainListName(userDbKey, navn) as any),
  onSlettBruker: (userDbKey: string) => dispatch(deleteMyAccount(userDbKey) as any),
});

export default connect(mapStateToProps, mapDispatchToProps)(Profil);
