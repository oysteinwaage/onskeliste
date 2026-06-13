import React, { Component } from 'react';
import { connect } from 'react-redux';
import { endreHeaderTekst } from '../actions/actions';
import { updateMyMeasumentOnProfile, updateMainListName, deleteMyAccount, approveAccessRequest, rejectAccessRequest, sendAccessRequests } from '../Api';
import { finnLabelForStrl, measurementKeys } from '../utils/util';
import AddViewersToMyListComponent from '../minliste/AddViewersToMyListComponent';
import RequestAccessComponent from '../minliste/RequestAccessComponent';
import { RootState, AccessRequest, Viewer } from '../types';
import { Dispatch } from 'redux';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Check, Trash2, User, X } from 'lucide-react';

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
  etterspillBruker: AccessRequest | null;
  [key: string]: string | null | boolean | AccessRequest;
}

interface ProfilProps {
  myUserDbKey: string;
  navn: string;
  email: string;
  uid?: string;
  photoURL?: string;
  onEndreHeaderTekst: () => void;
  measurements: Record<string, string>;
  mainListName?: string;
  innkommendeForesporsler: AccessRequest[];
  allowedViewers: Viewer[];
  allowedListsForMe: string[];
  onUpdateMainListName: (userDbKey: string, navn: string) => void;
  onSlettBruker: (userDbKey: string) => void;
  onApprove: (request: AccessRequest, currentViewers: Viewer[]) => void;
  onReject: (request: AccessRequest) => void;
  onSendRequest: (fromUid: string, fromNavn: string, targets: Viewer[]) => void;
}

class Profil extends Component<ProfilProps, ProfilState> {
  constructor(props: ProfilProps) {
    super(props);
    this.state = {
      sko: null, bukse: null, genser_tskjorte: null,
      skjorte: null, bh: null, hansker: null,
      boksershorts: null, hatt: null, mainListName: null,
      slettDialogApen: false, sletter: false,
      etterspillBruker: null,
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

  // Vis kun «be om tilgang tilbake»-modalen hvis jeg ikke allerede har tilgang til
  // brukerens lister.
  visEtterspillModal = (request: AccessRequest): void => {
    const { allowedListsForMe } = this.props;
    if (!allowedListsForMe.includes(request.uid)) {
      this.setState({ etterspillBruker: request });
    }
  };

  handleGodta = (request: AccessRequest): void => {
    const { onApprove, allowedViewers } = this.props;
    onApprove(request, allowedViewers);
    this.visEtterspillModal(request);
  };

  handleAvvis = (request: AccessRequest): void => {
    const { onReject } = this.props;
    onReject(request);
    this.visEtterspillModal(request);
  };

  handleEtterspillJa = (): void => {
    const { uid, navn, onSendRequest } = this.props;
    const { etterspillBruker } = this.state;
    if (uid && etterspillBruker) {
      onSendRequest(uid, navn, [{ value: etterspillBruker.uid, label: etterspillBruker.navn }]);
    }
    this.setState({ etterspillBruker: null });
  };

  render() {
    const { measurements, mainListName, myUserDbKey, onUpdateMainListName, navn, email, photoURL, innkommendeForesporsler } = this.props;
    const { slettDialogApen, sletter, etterspillBruker } = this.state;

    return (
      <div className="max-w-xl mx-auto px-4 py-6">
        {/* Innkommende tilgangsforespørsler */}
        {innkommendeForesporsler.length > 0 && (
          <div className="flex flex-col gap-3 mb-6">
            {innkommendeForesporsler.map(request => (
              <div
                key={request.uid}
                className="flex items-center gap-3 p-4 bg-green-50 rounded-2xl border border-green-200"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-800">
                    <span className="font-semibold">{request.navn}</span> ønsker tilgang til listen din
                  </p>
                </div>
                <Button size="sm" className="gap-1 bg-green-600 hover:bg-green-700" onClick={() => this.handleGodta(request)}>
                  <Check className="w-4 h-4" />
                  Godta
                </Button>
                <Button size="sm" variant="outline" className="gap-1" onClick={() => this.handleAvvis(request)}>
                  <X className="w-4 h-4" />
                  Avvis
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 mb-6 p-4 bg-white rounded-2xl shadow-sm border border-slate-200">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
            {photoURL
              ? <img src={photoURL} alt={navn} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              : <User className="w-6 h-6 text-slate-500" />
            }
          </div>
          <div className="min-w-0">
            <p className="text-base font-semibold text-slate-900 truncate">{navn}</p>
            <p className="text-sm text-slate-500 truncate">{email}</p>
          </div>
        </div>

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

          {/* Be om tilgang til andres lister */}
          <AccordionItem value="beOmTilgang" className="border-none px-4">
            <AccordionTrigger className="text-sm font-semibold text-slate-800">
              Be om tilgang til andres lister
            </AccordionTrigger>
            <AccordionContent>
              <RequestAccessComponent />
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

        <Dialog open={!!etterspillBruker} onOpenChange={open => { if (!open) this.setState({ etterspillBruker: null }); }}>
          <DialogContent showClose={false}>
            <DialogHeader>
              <DialogTitle>Be om tilgang tilbake?</DialogTitle>
              <DialogDescription>
                Ønsker du å søke om tilgang til {etterspillBruker?.navn} sin(e) liste(r)?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => this.setState({ etterspillBruker: null })}>
                Nei
              </Button>
              <Button onClick={this.handleEtterspillJa}>
                Ja
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
  navn: state.innloggetBruker.navn,
  email: state.innloggetBruker.email,
  uid: state.innloggetBruker.uid,
  photoURL: state.innloggetBruker.photoURL,
  measurements: state.innloggetBruker.measurements,
  mainListName: state.innloggetBruker.mainListName,
  innkommendeForesporsler: state.innloggetBruker.innkommendeTilgangsforesporsler,
  allowedViewers: state.innloggetBruker.allowedViewers,
  allowedListsForMe: state.vennersLister.allowedListsForMe,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onEndreHeaderTekst: () => dispatch(endreHeaderTekst('Profil')),
  onUpdateMainListName: (userDbKey: string, navn: string) => dispatch(updateMainListName(userDbKey, navn) as any),
  onSlettBruker: (userDbKey: string) => dispatch(deleteMyAccount(userDbKey) as any),
  onApprove: (request: AccessRequest, currentViewers: Viewer[]) => approveAccessRequest(request, currentViewers),
  onReject: (request: AccessRequest) => rejectAccessRequest(request),
  onSendRequest: (fromUid: string, fromNavn: string, targets: Viewer[]) => sendAccessRequests(fromUid, fromNavn, targets),
});

export default connect(mapStateToProps, mapDispatchToProps)(Profil);
