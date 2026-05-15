import React, { Component } from 'react';
import { connect } from 'react-redux';
import { endreHeaderTekst } from '../actions/actions';
import { sendFeedback, markerAlleFeedbackSomLest, slettFeedback } from '../Api';
import { RootState, Feedback } from '../types';
import { Dispatch } from 'redux';
import { Button } from '../components/ui/button';
import { Trash2 } from 'lucide-react';

interface TilbakemeldingProps {
  erAdmin: boolean;
  brukerUid: string;
  brukerNavn: string;
  alleFeedback: Feedback[];
  onEndreHeaderTekst: () => void;
}

interface TilbakemeldingState {
  tekst: string;
  sendt: boolean;
  sender: boolean;
}

class Tilbakemelding extends Component<TilbakemeldingProps, TilbakemeldingState> {
  state: TilbakemeldingState = { tekst: '', sendt: false, sender: false };

  componentDidMount() {
    this.props.onEndreHeaderTekst();
    if (this.props.erAdmin) {
      markerAlleFeedbackSomLest();
    }
  }

  handleSend = async () => {
    const { brukerUid, brukerNavn } = this.props;
    const { tekst } = this.state;
    if (!tekst.trim()) return;
    this.setState({ sender: true });
    await sendFeedback(tekst.trim(), brukerUid, brukerNavn);
    this.setState({ tekst: '', sendt: true, sender: false });
  };

  render() {
    const { erAdmin, alleFeedback } = this.props;
    const { tekst, sendt, sender } = this.state;

    if (erAdmin) {
      const sortert = [...alleFeedback].sort((a, b) => b.timestamp - a.timestamp);
      return (
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                Tilbakemeldinger ({alleFeedback.length})
              </h2>
            </div>
            {sortert.length === 0 ? (
              <p className="px-5 py-8 text-center text-slate-400 text-sm">Ingen tilbakemeldinger ennå.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {sortert.map(f => (
                  <li key={f.key} className="px-5 py-4 group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">{f.brukerNavn}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400">
                          {new Date(f.timestamp).toLocaleString('nb-NO', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </span>
                        <button
                          onClick={() => slettFeedback(f.key)}
                          className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          aria-label="Slett tilbakemelding"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{f.tekst}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
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
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  erAdmin: state.innloggetBruker.erAdmin || false,
  brukerUid: state.innloggetBruker.uid || '',
  brukerNavn: state.innloggetBruker.navn,
  alleFeedback: state.innloggetBruker.alleFeedback,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onEndreHeaderTekst: () => dispatch(endreHeaderTekst('Tilbakemelding')),
});

export default connect(mapStateToProps, mapDispatchToProps)(Tilbakemelding);
