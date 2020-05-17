import { Container, Typography } from "@material-ui/core";
import Link from "next/link";

function Copyright() {
    return (
      <Typography variant="body2" color="textSecondary">
        {'Copyright © '}
        <Link href="/">
            <a>FC Pútbol</a>
        </Link>{' '}
        {new Date().getFullYear()}
        {'.'}
      </Typography>
    );
}

export default function Footer() {
    return (<>
        <footer className="footer">
            <Container>
                PaellaLabs
                <Copyright />
            </Container>
        </footer>
    </>);
}
