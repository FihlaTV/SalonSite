var express = require("express");
var router = express.Router();
var db = require("../models");
/* Twilio Setup */
var Twilio = require('twilio');
var Tconfig = require('../config/js/config.js');
var client = new Twilio(Tconfig.accountSid, Tconfig.authToken);
const SALON_NAME = "Blvd6 Salon";

//display
router.get("/about", (req, res) => {
  //show salon info on the about page
  db.Salon.findOne({
    where: {
      name: SALON_NAME
    },
    include: [db.Address
      , db.Email, db.Phone
    ]
  }).then(function (data) {
    // console.log(data);

    res.render("about", { about: data });
  });
});

//show contactus
router.get("/contactus", (req, res) => {
  db.Salon.findOne({
    where: {
      name: SALON_NAME
    },
    include: [db.Address
      , db.Email, db.Phone
    ]
  }).then( data=> {
    //console.log(data);

    res.render("contactus", { contactus: data });
    });
});

router.post("/leads", (req, res) => {
  var textString = `You have a new lead -
  Name: ${req.body.firstNameContact}
  Phone: ${req.body.phoneContact}
  Email: ${req.body.emailContact}
  Reason for contact: ${req.body.reasonContact}
  Additional comments: ${req.body.addlContact}`;

  client.messages.create({
      to: Tconfig.salonNumber,  // Text this number
      from: Tconfig.twilioNumber, // From a valid Twilio number
      body: textString
  })
  .then(() => {
      // Otherwise, respond with 200 OK
      //res.status(200).send('Lead notification was successfully sent.');
      res.redirect("/contactus");
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send();
  });
});

//show product brand on the product page
router.get("/products999", (req, res) => {
  db.Product.findAll({
    attributes:["brand","photo", "id"],
    group:"brand"
  }).then(data =>{
    //console.log("Damn data:", data);
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
    //console.log("data2: ", data)
    res.json({products: data});
    //res.render("products", {products: data});
  });
});

//show product brand on the product page
router.get("/products", (req, res) => {
  db.Brand.findAll().then(data =>{
    console.log("data2: ", data)
    res.render("products", { productBrands: data });
  });
});

//show staff
router.get("/staff", (req, res)=>{
  db.Staff.findAll({
    include: [db.Address
      , db.Email, db.Phone
    ]
  }).then(data=>{
    console.log("Dirty Data: ", data);
    res.render("staff", {staff:data});
  });
});

router.get("/", (req, res) => {
  res.render("index", { data: "hello" });
});

//show services
router.get("/services", (req, res) => {
  db.Service.findAll().then(data => {
    // console.log(data);
    res.render("services", { services: data });
  })
});
//staff_service
//to show what kind of service that each staff perform, will be in the future development

// router.get("/logs", (req, res) => {
//   db.Staff.findAll({
//     order: [["name", "ASC"]],
//   }).then(data => {
//     // console.log(data);
//     res.render("adminLog", { staffLogs: data })
//   });
// });
// var staffServiceArr = [];
// router.get("/logs/:id", (req, res) => {
//   // console.log("param",req.params.id)
//   db.Staff_service.findAll({
//     where: {
//       StaffId: req.params.id,
//     }
//   }).then(data => {
//     // console.log(data);
//     for (var i = 0; i < data.length; i++) {
//       // console.log(data[i].dataValues.ServiceId);
//       staffServiceArr.push(data[i].dataValues.ServiceId)
//     }
//     return staffServiceArr
//   }).then((staffServiceArr) => {
//     // console.log("arr",staffServiceArr)
//     db.Service.findAll({
//       where: {
//         id: {
//           in: staffServiceArr
//         }
//       }
//     }).then(data => {
//       console.log(data)
//       staffServiceArr = [];
//       res.render("adminLog", { staffServiceLogs: data });
//     })
//   })
// });

module.exports = router;