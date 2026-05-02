import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import GiftIcon from '@mui/icons-material/CardGiftcard';
import ProfileIcon from '@mui/icons-material/AccountCircleOutlined';
import Exit from '@mui/icons-material/ExitToApp';
import ListeIcon from '@mui/icons-material/FormatListBulleted';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AdminIcon from '@mui/icons-material/AdminPanelSettings';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';

import { logOut } from '../Api';
import { RootState } from '../types';
import { Dispatch } from 'redux';

interface AppBarState {
  drawerOpen: boolean;
}

interface AppBarComponentProps {
  headerTekst: string;
  erAdmin: boolean;
  onAapneNySide: (id: string) => void;
  onLogOut: () => void;
}

class AppBarComponent extends Component<AppBarComponentProps, AppBarState> {
  constructor(props: AppBarComponentProps) {
    super(props);
    this.state = { drawerOpen: false };
  }

  menyValgTrykket(valg: string): void {
    switch (valg) {
      case 'vennelister':
      case 'minliste':
      case 'profil':
      case 'minekjoep':
      case 'admin':
        this.props.onAapneNySide(valg);
        break;
      case 'loggUt':
        this.props.onLogOut();
        break;
      default:
        console.log('ERROR_NO_MATCH');
        //doNothing
    }
    this.setState({ drawerOpen: false });
  }

  render() {
    const { headerTekst, erAdmin } = this.props;
    const visHamburgerMeny = headerTekst !== 'Innlogging' && headerTekst !== 'Opprett ny bruker' && headerTekst !== 'Resett passord';
    return (
      <AppBar position="static">
        <Toolbar>
          {visHamburgerMeny &&
            <IconButton sx={{ ml: '-12px', mr: '20px' }} onClick={() => this.setState({ drawerOpen: true })} color="inherit" aria-label="Menu">
              <MenuIcon />
            </IconButton>
          }
          <Typography variant="h6" color="inherit" sx={{ flexGrow: 1 }} className="toppmeny-side-navn">
            {this.props.headerTekst}
          </Typography>
        </Toolbar>
        <Drawer open={this.state.drawerOpen} onClose={() => this.setState({ drawerOpen: false })}>
          <div style={{ width: 250, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <List>
              <ListItem key='minliste' disablePadding>
                <ListItemButton onClick={() => this.menyValgTrykket('minliste')}>
                  <ListItemIcon><ListeIcon /></ListItemIcon>
                  <ListItemText primary='Min ønskeliste' />
                </ListItemButton>
              </ListItem>
              <Divider />
              <ListItem key='vennelister' disablePadding>
                <ListItemButton onClick={() => this.menyValgTrykket('vennelister')}>
                  <ListItemIcon><GiftIcon /></ListItemIcon>
                  <ListItemText primary='Venners lister' />
                </ListItemButton>
              </ListItem>
              <Divider />
              <ListItem key='minekjoep' disablePadding>
                <ListItemButton onClick={() => this.menyValgTrykket('minekjoep')}>
                  <ListItemIcon><ShoppingCartIcon /></ListItemIcon>
                  <ListItemText primary='Mine kjøp' />
                </ListItemButton>
              </ListItem>
              <Divider />
              <ListItem key='profil' disablePadding>
                <ListItemButton onClick={() => this.menyValgTrykket('profil')}>
                  <ListItemIcon><ProfileIcon /></ListItemIcon>
                  <ListItemText primary='Profil' />
                </ListItemButton>
              </ListItem>
              <Divider />
            </List>
            <List style={{ marginTop: 'auto' }}>
              <Divider />
              {erAdmin && (
                <>
                  <ListItem key='admin' disablePadding>
                    <ListItemButton onClick={() => this.menyValgTrykket('admin')}>
                      <ListItemIcon><AdminIcon /></ListItemIcon>
                      <ListItemText primary='Admin' />
                    </ListItemButton>
                  </ListItem>
                  <Divider />
                </>
              )}
              <ListItem key='loggUt' disablePadding>
                <ListItemButton onClick={() => this.menyValgTrykket('loggUt')}>
                  <ListItemIcon><Exit /></ListItemIcon>
                  <ListItemText primary='Logg ut' />
                </ListItemButton>
              </ListItem>
            </List>
          </div>
        </Drawer>
      </AppBar>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  headerTekst: state.config.headerTekst,
  erAdmin: state.innloggetBruker.erAdmin || false,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onAapneNySide: (id: string) => dispatch(push(id)),
  onLogOut: () => dispatch(logOut() as any),
});

export default connect(mapStateToProps, mapDispatchToProps)(AppBarComponent);
