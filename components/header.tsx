import Link from 'next/link'
import { useUser } from '../lib/hooks'

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';

import MenuIcon from '@material-ui/icons/Menu';

export default function Header() {
    const user = useUser();

    return <>
        <AppBar position="static">
            <Toolbar>
                <IconButton edge="start" color="inherit" aria-label="menu">
                    <MenuIcon />
                </IconButton>
                <Typography variant="h6" className="title">
                    FC Pútbol
                </Typography>
                {user ? <>
                    <Link href="/teams">
                        <Button color="inherit">Equipos</Button>
                    </Link>
                    <Link href="/leagues">
                        <Button color="inherit">Ligas</Button>
                    </Link>
                    <Link href="/match">
                        <Button color="inherit">Partidos</Button>
                    </Link>
                    <Link href="/profile">
                        <Button color="inherit">@{user.username}</Button>
                    </Link>
                    <Button color="inherit" href="/api/logout">Cerrar sesión</Button>
                </>: <>
                    <Link href="/signup">
                        <Button color="inherit">Crear una cuenta</Button>
                    </Link>
                    <Link href="/login">
                        <Button color="inherit">Iniciar sesión</Button>
                    </Link>
                </>}
            </Toolbar>
        </AppBar>
    </>
}
