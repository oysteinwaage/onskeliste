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
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';

import { logOut } from '../Api';


class AppBarComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { drawerOpen: false }
  }

  menyValgTrykket(valg) {
    switch (valg) {
      case 'vennelister':
      case 'minliste':
      case 'profil':
        this.props.onAapneNySide(valg);
        break;
      case 'loggUt':
        this.props.onLogOut();
        break;
      default:
        console.log('ERROR_NO_MATCH');
        //doNothing
    }
    this.setState({ drawerOpen: false })
  }

  render() {
    const { headerTekst } = this.props;
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
          <div style={{ width: 250 }}>
            <List>
              <ListItem button onClick={() => this.menyValgTrykket('minliste')} key='minliste'>
                <ListItemIcon>
                  <div><ListeIcon /></div>
                </ListItemIcon>
                <ListItemText primary='Min ønskeliste' />
              </ListItem>
              <Divider />
              <ListItem button onClick={() => this.menyValgTrykket('vennelister')} key='vennelister'>
                <ListItemIcon>
                  <div><GiftIcon /></div>
                </ListItemIcon>
                <ListItemText primary='Venners lister' />
              </ListItem>
              <Divider />
              <ListItem button onClick={() => this.menyValgTrykket('profil')} key='profil'>
                <ListItemIcon>
                  <div><ProfileIcon /></div>
                </ListItemIcon>
                <ListItemText primary='Profil' />
              </ListItem>
              <Divider />
              <ListItem button onClick={() => this.menyValgTrykket('loggUt')} key='loggUt'>
                <ListItemIcon>
                  <div><Exit /></div>
                </ListItemIcon>
                <ListItemText primary='Logg ut' />
              </ListItem>
              <Divider />
            </List>
          </div>
        </Drawer>
      </AppBar>
    );
  }
}

const mapStateToProps = state => ({
  headerTekst: state.config.headerTekst,
});

const mapDispatchToProps = dispatch => ({
  onAapneNySide: (id) => dispatch(push(id)),
  onLogOut: () => dispatch(logOut()),
});

export default connect(mapStateToProps, mapDispatchToProps)(AppBarComponent);
