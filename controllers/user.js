const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cryptoJs = require('crypto-js')
require('dotenv').config()
const tokenLogin = process.env.TOKEN_LOGIN
const regexEmail = (mail) => /^([\w.-]+)[@]{1}([\w]+)[.]{1}([a-z]){2,5}$/.test(mail)
const regexPassword= (password) => /([^a-zA-Z0-9@]+)/.test(password)
const key = cryptoJs.enc.Hex.parse(process.env.KEY_CRYPTOJS)
const iv = cryptoJs.enc.Hex.parse(process.env.IV_CRYPTOJS)

function crypt(mail){
    
    const cryptMail = cryptoJs.AES.encrypt(mail,key,{ iv:iv }).toString()
    console.log(cryptMail)
    return cryptMail
}

exports.signup = (req,res,next) => {/*Création d'un nouvel utilisateur.*/
    const reqMail = req.body.email
    const reqPassword = req.body.password

    if(!(regexEmail(reqMail))){
        res.status(400).json({ message:'Veuillez renseigner un email valide.(ex: jean@hotmail.com'})
    }
    else if(regexPassword(reqPassword)){
        res.status(400).json({ message:'Veuillez renseigner un password valide.(les caractères spéciaux ne sont pas autorisés)'})
    }
    else{
        const mailToSave = crypt(reqMail)
        bcrypt.hash(reqPassword,10)
        .then( hash => {
            const user = new User({
                email: mailToSave,
                password: hash
            })
            user.save()
            .then(() => res.status(201).json({ message: 'Utilisateur créé !'}))
            .catch( error => res.status(400).json({ error }))
        })
        .catch( error => res.status(500).json({ error }))   
    }
    
}
exports.login = (req,res,next) => {/*Connexion utilisateur.*/
    const reqMail = req.body.email
    const reqPassword = req.body.password

    if(!(regexEmail(reqMail))){
        res.status(400).json({ message:'Veuillez renseigner un email valide.(ex: jean@hotmail.com'})
        }
    else if(regexPassword(reqPassword)){
        res.status(400).json({ message:'Veuillez renseigner un password valide.(les caractères spéciaux ne sont pas autorisés)'})
    }    
    else{
        const mailToMatch = crypt(reqMail)
        User.findOne({ email: mailToMatch})
        .then( user => {
            if(!user){
                return res.status(400).json({ error:'Utilisateur non trouvé !' })
            }
            bcrypt.compare(req.body.password,user.password)
            .then( valid => {
                if(!valid){
                    return res.status(401).json({ error : 'mot de passe incorrect !'})
                }
                res.status(200).json({
                    userId: user._id,
                    token: jwt.sign(
                        { userId: user._id},
                        tokenLogin,
                        { expiresIn: '24h'}
                    )
                })
            })
            .catch( error => res.status(500).json({ error }))
        })
        .catch( error => res.status(500).json({ error }))
    }
}        