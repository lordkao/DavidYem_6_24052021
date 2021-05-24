const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const multer = require('../middleware/multer-config')
const stuffCtrl = require('../controllers/stuff')


router.post('/', auth, multer, stuffCtrl.createThing)

router.get('/:id', auth, stuffCtrl.getOneThing)

router.put('/:id', auth, multer, stuffCtrl.modifyThing)

router.post('/:id/like',auth, stuffCtrl.like)

router.delete('/:id', auth, stuffCtrl.deleteThing)

router.get('/', auth, stuffCtrl.getAllThings)

module.exports = router