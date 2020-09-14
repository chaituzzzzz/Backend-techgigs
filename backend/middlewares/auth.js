const config = require('config');
const jwt = require('jsonwebtoken');


module.exports = function verifyUser(req,res,next){
    const token = req.header('x-auth-token');
    if(!token)  return res.status(401).send('token must be passed')
    try{
        const decoded = jwt.verify(token,config.get('jwtprivatekey'));
        req.user = decoded
        next();
    }
    catch(ex){
        res.status(400).send('user is unauthorized');
    }    
}