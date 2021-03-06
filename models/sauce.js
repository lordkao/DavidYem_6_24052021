const mongoose = require('mongoose')

const sauceSchema = mongoose.Schema({
    userId: { type: String, required: true},        /*ID utilisateur.*/
    name : { type: String, required : true},        /*Nom de la sauce.*/
    manufacturer : { type: String, required: true},     /*Fabricant de la sauce.*/
    description : { type: String, required: true},      /*Description de la sauce.*/
    mainPepper : { type: String, required: true},       /*Principal ingrédient dans la sauce.*/
    imageUrl : { type: String, required: true},     /*string de l'image de la sauce téléchargée.*/
    heat : { type: Number, required: true},     /*Nombre entre 1 et 10 décrivant la sauce.*/
    likes : { type: Number},        /*Nombre de users qui aiment la sauce.*/
    dislikes : { type: Number},     /*Nombre de users qui n'aiment pas la sauce.*/
    usersLiked: [String],       /*Tableau d'IDs des users qui ont aimé la sauce.*/
    usersDisliked: [String]     /*Tableau d'IDs des users qui n'ont pas aimé la sauce.*/
})

module.exports = mongoose.model('Sauce',sauceSchema)

/*{
    "name" : "samurai",
    "manufacturer" : "David",
    "description" : "sauce pimenté",
    "mainPepper" : "piment",
    "imageUrl" : "dadad",
    "heat" : "7",
    "likes" : "10",
    "dislikes" : "5",
    "usersLiked": "[]",
    "usersDisliked":"[]"
}*/