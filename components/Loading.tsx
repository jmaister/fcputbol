
import { Backdrop, CircularProgress, Typography } from "@material-ui/core";

interface LoadingProps {
    isLoading: boolean
}

export default function Loading({isLoading}:LoadingProps) {
    return (<>
        <Backdrop open={isLoading} className="backdrop">
            <CircularProgress color="inherit" />
            <div className="backdrop-text">
                <Typography>Cargando...</Typography>
            </div>
        </Backdrop>
    </>);
}
