const Thing = require('../models/thing')
const Like = require('../models/like')
const fs =require('fs')

exports.createThing = (req,res,next) => {/*Création de sauce.*/
    const thingObject = JSON.parse(req.body.sauce)
    delete thingObject._id
    const thing = new Thing({/*Créer une nouvelle instance de notre modèle Thing en enregistrant les élements du corps de la requête.*/
        ...thingObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        usersLiked:[],
        usersDisliked:[],
        likes:0,
        dislikes:0
    })
    thing.save()/*Enregistre notre objet dans la base de données.*/
    .then( () => res.status(201).json({ message: 'Objet enregistré !'}))
    .catch( error => res.status(400).json({ error }))
}

exports.getOneThing = (req,res,next) => { /*Obtenir une sauce par son id.*/
    Thing.findOne({ _id: req.params.id})
    .then( thing => res.status(200).json(thing))
    .catch( error => res.status(404).json({ error }))
}

exports.modifyThing = (req,res,next) => {/*Modification d'une sauce.*/
    const thingObject = req.file ?
    {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    }:{ ...req.body }

    function updateOne(){
        Thing.updateOne({ _id: req.params.id},{...thingObject, _id: req.params.id})
            .then( () => res.status(200).json({ message: 'Objet modifié !'}))
            .catch( error => res.status(400).json({ error }))
    }

    if (req.file){
        Thing.findOne({ _id: req.params.id})
        .then( thing => {
            const filename = thing.imageUrl.split('/images/')[1]
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

exports.like = (req,res,next) => {
    const userlike = req.body.like
    const userId = req.body.userId
    const reqParams = req.params.id
    
    Thing.findOne({ _id: reqParams})
    .then( thing => {
        const usersLiked = thing.usersLiked
        const usersDisliked = thing.usersDisliked

        if(userlike == 1){
            usersLiked.push(userId)
            const resumeLike = {
                likes: usersLiked.length,
                dislikes: usersDisliked.length, 
                usersLiked: usersLiked,
                usersDisliked: usersDisliked
            }
            console.log(usersLiked.length)
            console.log("[ "+usersLiked + " ] ==> tableau des Ids j'aime")
            Thing.updateOne({ _id: reqParams},{ ...resumeLike, _id: reqParams})
            .then(() => res.status(200).json({ message: 'like bien enregistré'}))
            .catch( error => res.status(500).json({ error }))
        }
        else if(userlike == -1){
            usersDisliked.push(userId)
            const resumeLike = {
                likes: usersLiked.length,
                dislikes: usersDisliked.length, 
                usersLiked: usersLiked,
                usersDisliked: usersDisliked
            }
            console.log("[ "+usersDisliked + " ] ==> tableau des Ids j'aime pas")
            Thing.updateOne({ _id: reqParams},{ ...resumeLike, _id: reqParams})
            .then(() => res.status(200).json({ message: 'dislike bien enregistré'}))
            .catch( error => res.status(500).json({ error }))
        }
        else if(userlike == 0){

            const findUserIdLiked = usersLiked.find(elt => elt == userId)
            const findUserIdDisliked = usersDisliked.find(elt => elt == userId)
            console.log("[ "+findUserIdLiked + " ] ==> user dans le tableau j'aime")
            console.log("[ "+usersLiked + " ] ==> tableau des Ids j'aime")
            console.log("[ "+usersDisliked + " ] ==> tableau des Ids j'aime pas")

            if(findUserIdLiked){
                const indexUserIdLiked = usersLiked.indexOf(findUserIdLiked)
                usersLiked.splice(indexUserIdLiked,1)
                const resumeLike = {
                    likes: usersLiked.length,
                    dislikes: usersDisliked.length, 
                    usersLiked: usersLiked,
                    usersDisliked: usersDisliked
                }
                Thing.updateOne({ _id: reqParams},{ ...resumeLike, _id: reqParams})
                .then(() =>{
                    console.log("[ "+usersLiked+" ] ==> mis à jour du tableau des j'aimes")
                    res.status(200).json({ message: 'Like supprimé des tableaux'})
                })
                .catch( error => res.status(500).json({ error }))
                }

            else if(findUserIdDisliked){
                const indexUserIdDisliked = usersDisliked.indexOf(findUserIdDisliked)
                usersDisliked.splice(indexUserIdDisliked,1)
                const resumeLike = {
                    likes: usersLiked.length,
                    dislikes: usersDisliked.length, 
                    usersLiked: usersLiked,
                    usersDisliked: usersDisliked
                }
                Thing.updateOne({ _id: reqParams},{ ...resumeLike, _id: reqParams})
                .then(() => {   
                    console.log("[ "+usersDisliked+" ] ==> mis à jour du tableau des j'aimes pas")
                    res.status(200).json({ message: 'Like supprimé des tableaux'})
                })
                .catch( error => res.status(500).json({ error }))
                }
        }
    })
    .catch( error => res.status(500).json({ error }))
}

                       

exports.deleteThing = (req,res,next) => {/*Suppression de sauce.*/
    Thing.findOne({ _id: req.params.id})
    .then( thing => {
        const filename = thing.imageUrl.split('/images/')[1]
        fs.unlink(`images/${filename}`, () => {
            Thing.deleteOne({ _id: req.params.id })
            .then( () => res.status(200).json({ message: 'Objet supprimé !'}))
            .catch( error => res.status(400).json({ error }))
        })
    })
    .catch( error => res.status(500).json({ error }))
}

exports.getAllThings = (req,res,next) => {/*Obtenir toutes les sauces.*/
    Thing.find()
    .then( things => res.status(200).json(things))
    .catch( error => res.status(400).json({ error }))
}
