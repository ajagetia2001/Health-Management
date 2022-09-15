const express = require('express')
const User = require('../models/user')
const Medicine = require('../models/medicine')
const multer=require('multer')
var sharp=require('sharp')
const router = new express.Router()
var cookieParser = require('cookie-parser')
var {sendWelcomeEmail,sendCancellationEmail,sendReminderEmail,sendOverEmail}=require('../emails/account')
const auth = require('../middleware/auth')
var methodOverride = require("method-override");
router.use(methodOverride("_method"));
router.use(cookieParser())

router.get('/signup',(req,res)=>{
    res.render("signup")
})

router.get('/login',(req,res)=>{
    res.render("login")
})

setInterval(function(){ // Set interval for checking
    var date = new Date(); // Create a Date object to find out what time it is
    if(date.getHours() === 19 && date.getMinutes() === 52){ // Check the time
        User.find({},function(err,users){
            users.forEach(function(user){
                Medicine.find({owner:user._id, morning:true},function(err,medicines){
                var str="Medicine Name"
                   medicines.forEach(function(medicine){
                       Medicine.findByIdAndUpdate(medicine._id,{qty:medicine.qty-1},function(){
                       })
                       str=str + " "+ medicine.medicinename 
                       
                       if(medicine.qty===1){
                        sendOverEmail(user.email,medicine.medicinename)
                        Medicine.findByIdAndDelete(medicine._id,function(){
                            console.log("Done")
                        })
                       }
                   })
                   sendWelcomeEmail(user.email,str)
                })
            })
        })
    }
}, 60000);


router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        sendWelcomeEmail(user.email,user.name)
        const token = await user.generateAuthToken()
        res.cookie('auth',token);
       // res.status(201).send({ user, token })
        res.redirect("/medicines")
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.cookie('auth',token);
      //  console.log(token)
        //res.send({ user, token })
   //   console.log()
       res.redirect("/medicines")
    } catch (e) {
        res.status(400).send()
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.redirect("/signup")
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.redirect("/signup")
    } catch (e) {
        res.status(500).send()
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        sendCancellationEmail(req.user.email,req.user.name)
        res.redirect("/signup")
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/users/me', auth, async (req, res) => {
    var user=req.user
    res.render("myinfo",{user:user})
})
const upload=multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Invalid format'))
        }
        cb(undefined,true)
    }
})

router.post('/users/me/avatar',auth,upload.single('avatar'),async(req,res)=>{
    var buffer= await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer()
    req.user.avatar=buffer
    await req.user.save()
    res.send("Ok")
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
})


module.exports = router

// router.get('/user12',(req,res)=>{
//     User.find({},function(err,users){
//         users.forEach(function(user){
//             Medicine.find({owner:user._id, morning:true},function(err,medicines){
//             var str="Medicine Name"
//                medicines.forEach(function(medicine){
//                    Medicine.findByIdAndUpdate(medicine._id,{qty:medicine.qty-1},function(){
//                    })
//                    str=str + " "+ medicine.medicinename 
                   
//                    if(medicine.qty===1){
//                     sendOverEmail(user.email,medicine.medicinename)
//                     Medicine.findByIdAndDelete(medicine._id,function(){
//                         console.log("Done")
//                     })
//                    }
//                })
//                sendWelcomeEmail(user.email,str)
//             })
//         })
//     })
//     res.send("OK")
// })
