const jwt = require('jsonwebtoken');

exports.token = (obj) => {
    const tok = jwt.sign(obj,'HelloWorld')
    return tok;
}

exports.verify = () => {
    //verify token
}