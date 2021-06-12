const Sauce = require('../models/sauce')
const fs =require('fs')

exports.createSauce = (req,res,next) => {/*Création de sauce.*/
    const sauceObject = JSON.parse(req.body.sauce)
    delete sauceObject._id
    const sauce = new Sauce({/*Créer une nouvelle instance de notre modèle sauce en enregistrant les élements du corps de la requête.*/
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        usersLiked:[],
        usersDisliked:[],
        likes:0,
        dislikes:0
    })
    sauce.save()/*Enregistre notre objet dans la base de données.*/
    .then( () => res.status(201).json({ message: 'Objet enregistré !'}))
    .catch( error => res.status(400).json({ error }))
}

exports.getOneSauce = (req,res,next) => { /*Obtenir une sauce par son id.*/
    Sauce.findOne({ _id: req.params.id})
    .then( sauce => res.status(200).json(sauce))
    .catch( error => res.status(404).json({ error }))
}

exports.modifySauce = (req,res,next) => {/*Modification d'une sauce.*/
    const sauceObject = req.file ?
    {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    }:{ ...req.body }

    function updateOne(){
        Sauce.updateOne({ _id: req.params.id},{...sauceObject, _id: req.params.id})
            .then( () => res.status(200).json({ message: 'Objet modifié !'}))
            .catch( error => res.status(400).json({ error }))
    }

    if (req.file){
        Sauce.findOne({ _id: req.params.id})
        .then( sauce => {
            const filename = sauce.imageUrl.split('/images/')[1]
            fs.unlink(`images/${filename}`,() => {
                updateOne()
            })
        })
        .catch( error => res.status(500).json({ error }))
    }
    else{
        updateOne()
    }
}

exports.like = (req,res,next) => {/*Gestion des likes de l'utilisateur.*/
    const userlike = req.body.like
    const userId = req.body.userId
    const reqParams = req.params.id
    Sauce.findOne({ _id: reqParams})
    .then( sauce => {
        const usersLiked = sauce.usersLiked
        const usersDisliked = sauce.usersDisliked
        function updateLike(value1){
            Sauce.updateOne({ _id: reqParams},{ ...value1, _id: reqParams})
            .then(() => res.status(200).json({ message: 'like mis à jour'}))
            .catch( error => res.status(500).json({ error }))
        }
        function deleteUserId(array,userIdFound){
            const indexUserId = array.indexOf(userIdFound)
            array.splice(indexUserId,1)
        }
        if(userlike == 1){
            usersLiked.push(userId)
            const resumeLike = {
                usersLiked: usersLiked,
                likes: usersLiked.length
            }
            console.log(resumeLike)
            console.log("[ " + usersLiked + " ] ==> tableau des Ids j'aime et il y a : " + usersLiked.length + " users ")
            updateLike(resumeLike)
        }
        else if(userlike == -1){
            usersDisliked.push(userId)
            const resumeDislike = {
                dislikes: usersDisliked.length, 
                usersDisliked: usersDisliked
            }
            console.log(resumeDislike)
            console.log("[ " + usersDisliked + " ] ==> tableau des Ids j'aime pas et il y a : " + usersDisliked.length + " users ")
            updateLike(resumeDislike)
        }
        else if(userlike == 0){
            const findUserIdLiked = usersLiked.find(elt => elt == userId)
            const findUserIdDisliked = usersDisliked.find(elt => elt == userId)
            if(findUserIdLiked){
                deleteUserId(usersLiked,findUserIdLiked)
                const resumeLike = {
                    usersLiked: usersLiked,
                    likes: usersLiked.length
                }
                console.log(resumeLike)
                console.log("[ " + usersLiked + " ] ==> tableau des Ids j'aime et il y a : " + usersLiked.length + " users ")
                updateLike(resumeLike)
                }
            else if(findUserIdDisliked){
                deleteUserId(usersDisliked,findUserIdDisliked)
                const resumeDislike = {
                    dislikes: usersDisliked.length, 
                    usersDisliked: usersDisliked
                }
                console.log(resumeDislike)
                console.log("[ " + usersDisliked + " ] ==> tableau des Ids j'aime pas et il y a : " + usersDisliked.length + " users ")
                updateLike(resumeDislike)
                }
        }
    })
    .catch( error => res.status(500).json({ error }))
}
   
exports.deleteSauce = (req,res,next) => {/*Suppression de sauce.*/
    Sauce.findOne({ _id: req.params.id})
    .then( sauce => {
        const filename = sauce.imageUrl.split('/images/')[1]
        fs.unlink(`images/${filename}`, () => {
            Sauce.deleteOne({ _id: req.params.id })
            .then( () => res.status(200).json({ message: 'Objet supprimé !'}))
            .catch( error => res.status(400).json({ error }))
        })
    })
    .catch( error => res.status(500).json({ error }))
}

exports.getAllSauces = (req,res,next) => {/*Obtenir toutes les sauces.*/
    Sauce.find()
    .then( sauces => res.status(200).json(sauces))
    .catch( error => res.status(400).json({ error }))
}
