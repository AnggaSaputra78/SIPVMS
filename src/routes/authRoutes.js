const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User =
require('../models/User');

const router =
express.Router();


// ======================================
// REGISTER
// ======================================

router.post(
'/register',
async (req,res)=>{

try{

const {
username,
password
} = req.body;

if(!username || !password){

return res.status(400).json({
message:'Data tidak lengkap'
});

}

const existingUser =
await User.findOne({
username
});

if(existingUser){

return res.status(400).json({
message:'Username sudah dipakai'
});

}

const hashedPassword =
await bcrypt.hash(
password,
10
);

await User.create({
username,
password: hashedPassword
});

res.json({
success:true,
message:'Registrasi berhasil'
});

}catch(error){

console.error(error);

res.status(500).json({
message:'Server error'
});

}

});


// ======================================
// LOGIN
// ======================================

router.post(
'/login',
async (req,res)=>{

try{

const {
username,
password
} = req.body;

const user =
await User.findOne({
username
});

if(!user){

return res.status(400).json({
message:'User tidak ditemukan'
});

}

const validPassword =
await bcrypt.compare(
password,
user.password
);

if(!validPassword){

return res.status(400).json({
message:'Password salah'
});

}

const token =
jwt.sign(
{
id:user._id,
role:user.role
},
process.env.JWT_SECRET,
{
expiresIn:'7d'
}
);

res.json({

token,

user:{
id:user._id,
username:user.username,
role:user.role
}

});

}catch(error){

console.error(error);

res.status(500).json({
message:'Server error'
});

}

});

module.exports = router;