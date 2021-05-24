const express = require('express')

const app = express()

app.use((req,res) => {
    res.json({
        message: 'Nouvelle réponse du serveur David !!'
    })
})

module.exports = app