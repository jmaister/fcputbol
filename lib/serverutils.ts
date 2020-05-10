
export function redirect(res, path) {
    if (res) {
        res.writeHead(302, {
            Location: path,
            'Content-Type': 'text/html; charset=utf-8',
        });
        res.end();
    }
}

export function redirectToLogin(res) {
    redirect(res, '/login');
}
