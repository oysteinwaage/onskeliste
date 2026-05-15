import React, { Component } from 'react';
import { connect } from 'react-redux';
import { endreHeaderTekst } from '../actions/actions';
import { updateMyMeasumentOnProfile, updateMainListName } from '../Api';
import { finnLabelForStrl, measurementKeys } from '../utils/util';
import AddViewersToMyListComponent from '../minliste/AddViewersToMyListComponent';
import { RootState } from '../types';
import { Dispatch } from 'redux';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Input } from '../components/ui/input';

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
  [key: string]: string | null;
}

interface ProfilProps {
  myUserDbKey: string;
  onEndreHeaderTekst: () => void;
  measurements: Record<string, string>;
  mainListName?: string;
  onUpdateMainListName: (userDbKey: string, navn: string) => void;
}

class Profil extends Component<ProfilProps, ProfilState> {
  constructor(props: ProfilProps) {
    super(props);
    this.state = {
      sko: null, bukse: null, genser_tskjorte: null,
      skjorte: null, bh: null, hansker: null,
      boksershorts: null, hatt: null, mainListName: null,
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

  render() {
    const { measurements, mainListName, myUserDbKey, onUpdateMainListName } = this.props;

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
});

export default connect(mapStateToProps, mapDispatchToProps)(Profil);
