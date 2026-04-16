import { combineReducers } from 'redux';
import innloggetBruker from './innloggetBrukerReducer';
import config from './configReducer';
import vennersLister from './vennersListerReducer';

const rootReducer = combineReducers({
  innloggetBruker,
  config,
  vennersLister,
});

export default rootReducer;
