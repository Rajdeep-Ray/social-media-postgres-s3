const jwt = require('jsonwebtoken');

exports.token = (obj) => {
    const tok = jwt.sign(obj, 'HelloWorld')
    return tok;
}

exports.verify = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = jwt.verify(bearerToken, 'HelloWorld');
        next();
    } else {
        res.sendStatus(403);
    }

}