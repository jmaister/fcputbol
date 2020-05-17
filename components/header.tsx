import { useState } from 'react';

import Link from 'next/link'
import { useUser } from 'lib/hooks'

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Drawer from '@material-ui/core/Drawer';
import { List, ListItem, ListItemIcon, ListItemText, Divider } from '@material-ui/core';

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import PeopleIcon from '@material-ui/icons/People';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import AddCircleIcon from '@material-ui/icons/AddCircle';

export default function Header() {
    const user = useUser();
    const [isOpen, setIsOpen] = useState(false);

    const sideLinks = [
        {label: "Equipos", icon: <FormatListNumberedIcon/>, href: "/teams", loginRequired: true},
        {label: "Ligas", icon: <PeopleIcon />, href: "/leagues", loginRequired: true},
        // {label: "Partidos", icon: null, href: "/match", loginRequired: true},
    ];

    return <>
        <AppBar position="static">
            <Toolbar>
                <IconButton edge="start" color="inherit" aria-label="menu" onClick={() => setIsOpen(true)}>
                    <MenuIcon />
                </IconButton>
                <Typography variant="h6" className="title">
                    <Link href="/"><a>FC Pútbol</a></Link>
                </Typography>
                {user ? <>
                    <Link href="/profile">
                        <Button color="inherit" startIcon={<AccountCircleIcon />}>@{user.username}</Button>
                    </Link>
                </>: <>
                    <Link href="/signup">
                        <Button color="inherit" startIcon={<AddCircleIcon />}>Crear una cuenta</Button>
                    </Link>
                    <Link href="/login">
                        <Button color="inherit" startIcon={<AccountCircleIcon />}>Iniciar sesión</Button>
                    </Link>
                </>}
            </Toolbar>
        </AppBar>
        <Drawer anchor="left" open={isOpen} onClose={() => setIsOpen(false)} className="app-drawer">
            <div className="drawer-header">
                <IconButton onClick={() => setIsOpen(false)}>
                    <ChevronLeftIcon />
                </IconButton>
            </div>
            <Divider />
            {user ?
                <List>
                    {sideLinks.map((link, index) => (
                        <Link key={link.label} href={link.href}>
                            <ListItem button onClick={() => setIsOpen(false)}>
                                {link.icon ? <ListItemIcon>{link.icon}</ListItemIcon> : null}
                                <ListItemText primary={link.label} />
                            </ListItem>
                        </Link>
                    ))}
                </List>
            : null}
            <Divider />
            {user ?
                <List>
                    <Link href="/api/logout">
                        <ListItem button onClick={() => setIsOpen(false)}>
                            <ListItemIcon><ExitToAppIcon /></ListItemIcon>
                            <ListItemText primary="Cerrar sesión" />
                        </ListItem>
                    </Link>
                </List>
            : null}

        </Drawer>
    </>
}

//                     <Button color="inherit" href="/api/logout">Cerrar sesión</Button>
