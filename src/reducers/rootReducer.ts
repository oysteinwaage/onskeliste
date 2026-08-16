import { combineReducers } from 'redux';
import innloggetBruker from './innloggetBrukerReducer';
import config from './configReducer';
import vennersLister from './vennersListerReducer';
import administrasjon from './administrasjonReducer';

const rootReducer = combineReducers({
  innloggetBruker,
  config,
  vennersLister,
  administrasjon,
});

export default rootReducer;
