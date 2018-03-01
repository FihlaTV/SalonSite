var express = require("express");
var router = express.Router();
var db = require("../models");
var nodemailer = require('nodemailer');
const SALON_NAME = "Blvd6 Salon";

router.post("/leads", (req, res) => {
  var textString = `You have a new lead -
    Name: ${req.body.firstNameContact}
    Phone: ${req.body.phoneContact}
    Email: ${req.body.emailContact}
    Reason for contact: ${req.body.reasonContact}
    Additional comments: ${req.body.addlContact}`;
});

// Index page
router.get("/", (req, res) => {
  let fullData = [];

  db.Service.findAll().then(serviceData => {
    fullData.push(serviceData);
  });

  db.Salon.findOne({
    where: 
    {
      name: SALON_NAME
    },
    include: [db.Address, db.Email, db.Phone]
  }).then(contactData => {
    fullData.push(contactData);
  });

  db.Brand.findAll({
    attributes:["name", "description", "photo", "id"]
  }).then(productData => {
    fullData.push(productData);

    res.render("index", { services: fullData[0], contactus: fullData[1], productBrands: fullData[2] });
  });
});

//show product brand on the product page
router.get("/products999", (req, res) => {
  db.Product.findAll({
    attributes:["brand","photo", "id"],
    group:"brand"
  }).then(data =>{
    res.render("products", { productBrands: data });
  });
});

// show products in the brand
router.get("/products/:brand", (req, res)=>{
  db.Product.findAll({
    where:{
      brand:req.params.brand
    } 
  }).then(data =>{
    res.json({products: data});
  });
});

//show product brand on the product page
router.get("/products", (req, res) => {
  db.Brand.findAll({
    attributes:["name", "description", "photo", "id"]
  }).then(data =>{
    res.render("products", { productBrands: data });
  });
});

//show staff
router.get("/staff", (req, res) =>{
  db.Staff.findAll({
    include: [db.Address
      , db.Email, db.Phone
    ]
  }).then(data=>{
    res.render("staff", {staff:data});
  });
});

//Send Email
router.post("/sendMail", (req, res) => {
  let bodyText = `Hi Blvd6 Staff,
    ${req.body.firstNameContact} ${req.body.lastNameContact} has sent a contact request via the website.
    
    ${req.body.firstNameContact} selected ${req.body.reasonContact} and made the following comment:
    ${req.body.addlContact}
    
    Let's try to help ${req.body.firstNameContact} out!
    
    ${req.body.firstNameContact}'s contact info is:
    PHONE: ${req.body.phoneContact}
    EMAIL: ${req.body.emailContact}`;

  var transporter = nodemailer.createTransport({
    host: 'mail.mortekcloud.com',
    port: 25,
    secure: false,
    auth: {
      user: "[yooser naym]",
      pass: '[passwerd]'
    }
  });
  
  var mailOptions = {
    from: 'automation@mortekcloud.com',
    to: req.body.emailContact,
    subject: req.body.reasonContact,
    text: bodyText
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
      res.sendStatus(500);
    } else {
      console.log('Email sent: ' + info.response);
      res.sendStatus(200);
    }
  });
});

module.exports = router;