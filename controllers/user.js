const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const tokenLogin = process.env.TOKEN_LOGIN


exports.signup = (req,res,next) => {/*Création d'un nouvel utilisateur.*/


    bcrypt.hash(req.body.password,10)
    .then( hash => {
        const user = new User({
            email: req.body.email,
            password: hash
        })
        user.save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !'}))
        .catch( error => res.status(400).json({ error }))
    })
    .catch( error => res.status(500).json({ error }))
}
exports.login = (req,res,next) => {/*Connexion utilisateur.*/
    if(!(/^([\w.-]+)[@]{1}([\w]+)[.]{1}([a-z]){2,5}$/.test(req.body.email))){
        res.status(400).json({ message:'Veuillez renseigner un email valide.(ex: jean@hotmail.com'})
        }
    else if(/([^a-zA-Z0-9@]+)/.test(req.body.password)){
        res.status(400).json({ message:'Veuillez renseigner un password valide.(les caractères spéciaux ne sont pas autorisés)'})
    }    
    else{
        User.findOne({ email: req.body.email})
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

/*User.findOne({ email: req.body.email})
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
    .catch( error => res.status(500).json({ error }))*/