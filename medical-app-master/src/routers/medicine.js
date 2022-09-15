const express = require('express')
const Medicine = require('../models/medicine')
const router = new express.Router()
var methodOverride = require("method-override");
router.use(methodOverride("_method"));
const auth = require('../middleware/auth')
var cookieParser = require('cookie-parser')
router.use(cookieParser())

router.get('/medicines', auth, async (req, res) => {
    const match = {}
    const sort = {}
    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        await req.user.populate({
            path: 'medicines',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        var medicines=req.user.medicines
        res.render("index",{medicines:medicines})
     //   res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send()
    }
})

router.get("/medicine/new",function(req, res){
    res.render("new");
});

router.get('/medicines/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const medicine = await Medicine.findOne({ _id, owner: req.user._id })

        if (!medicine) {
            return res.status(404).send()
        }
        res.render("show",{medicine:medicine})
       // res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/medicines', auth, async (req, res) => {
    const medicine = new Medicine({
        ...req.body,
        owner: req.user._id
    })
    
    try {
        await medicine.save()
        res.redirect("/medicines")
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/medicines/:id/edit',auth, async (req, res) => {
    try {
        const medicine = await Medicine.findOne({_id:req.params.id, owner:req.user._id})
        if (!medicine) {
            res.redirect("/medicines");
        }

        res.render("edit",{medicine:medicine})
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/medicines/:id',auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const task = await Task.findOne({_id:req.params.id, owner:req.user._id})

        if (!task) {
            return res.status(404).send()
        }
        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
    
        res.redirect("/tasks")
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/medicines/:id',auth, async (req, res) => {
    try {
        const medicine = await Medicine.findOneAndDelete({_id:req.params.id, owner:req.user._id})
        if (!medicine) {
            res.redirect("/medicines");
        }

        res.redirect("/medicines");
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router