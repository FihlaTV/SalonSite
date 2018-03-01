let express = require("express");
let router = express.Router();
let db = require("../models");
let multer = require("multer");
let fs = require("fs");
let passport = require("passport");
const SALON_NAME = "Blvd6 Salon";

// Simple route middleware to ensure user is authenticated.
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { 
        return next(); 
    }

    req.session.error = 'Please sign in!';
    res.redirect('/admin/signin');
}
  
router.get("/", (req, res) => {
    // res.render("adminIndex");
    res.render("home", { user: req.user });
});

router.get("/signin", function(req, res) {
    res.render("signin");
});

// show all product
router.get("/products", ensureAuthenticated, (req, res) => {
    db.Product.findAll({
        order: [["brand", "ASC"]]
    }).then(data => {
        res.render("adminProducts", { products: data });
    });
});

//sends the request through our local signup strategy, and if successful takes user to homepage, otherwise returns then to signin page
router.post('/local-reg', 
    passport.authenticate('local-signup', {
        successRedirect: '/admin',
        failureRedirect: '/admin/signin'
    })
);

//sends the request through our local login/signin strategy, and if successful, takes the user to the homepage.  Otherwise returns them to the sign-in page
router.post('/login', 
    passport.authenticate('local-signin', {
        successRedirect: '/admin',
        failureRedirect: '/admin/signin'
    })
);

//logs user out of site, deleting them from the session, and returns to homepage
router.get('/logout', function(req, res){
    var name = req.user.username;

    console.log("LOGGING OUT " + req.user.username)

    req.logout();
    res.redirect('/admin');
    req.session.notice = "You have successfully been logged out " + name + "!";
});

//add product in database
var storage = multer.diskStorage({
    destination: "./public/assets/images/productUpload",
    filename: function (req, file, cb) {
        cb(null, req.body.name + ".png");
    }
});

var upload = multer({ storage: storage });

router.post("/products/new", ensureAuthenticated, upload.single("photo"), (req, res) => {
    db.Product.create(
        {
            brand: req.body.brand,
            name: req.body.name,
            description: req.body.description,
            size: req.body.size,
            price: req.body.price,
            stock_quantity: req.body.stock_quantity,
            cost: req.body.cost,
            vendor: req.body.vendor,
            photo: req.body.name + ".png"
        }
    ).then(data => {
        res.redirect("/admin/products")
    });
});

//edit product - show update product
router.get("/products/:id/edit", ensureAuthenticated, (req, res) => {
    db.Product.findOne({
        where: {
            id: req.params.id
        }
    }).then(data => {
        res.render("adminProductsEdit", { editproduct: data })
    });
});

//update - update database
router.put("/products/:id", ensureAuthenticated, upload.single("photo"), (req, res) => {
    db.Product.update(req.body, {
        where: {
            id: req.params.id
        }
    }).then(data => {
        res.redirect("/admin/products")
    });
});

//delete product in database
router.delete("/products/:id/:name", ensureAuthenticated, (req, res) => {
    //Check if file exist and delete
    var filePath = "./public/assets/images/productUpload/" + req.params.name + ".png";

    if(fs.existsSync(filePath)){
        fs.unlinkSync(filePath);
    }

    db.Product.destroy({
        where: {
            id: req.params.id
        }
    }).then(data => {
        res.redirect("/admin/products")
    });
});

//service
router.get("/services", ensureAuthenticated, (req, res) => {
    db.Service.findAll({
        order: [["name", "ASC"]]
    }).then(data => {
        res.render("adminservices", { services: data });
    });
});

//add service in database
storage = multer.diskStorage({
    destination: "./public/assets/images/serviceUpload",
    filename: function (req, file, cb) {
        cb(null, req.body.name + ".png");
    }
});

upload = multer({ storage: storage });

router.post("/services/new", ensureAuthenticated, upload.single("photo"), (req, res) => {
    db.Service.create(
        {
            name: req.body.name,
            duration: req.body.duration,
            member_price: req.body.member_price,
            nonmember_price: req.body.nonmember_price,
            cost: req.body.cost,
            photo: req.body.name + ".png",
            comment: req.body.comment,
        }
    ).then(data => {
        res.redirect("/admin/services")
    });
});

//edit service - show update service
router.get("/services/:id/edit", ensureAuthenticated, (req, res) => {
    db.Service.findOne({
        where: {
            id: req.params.id
        }
    }).then(data => {
        res.render("adminServicesEdit", { editservice: data })
    });
});

//update - update database
router.put("/services/:id", ensureAuthenticated, upload.single("photo"), (req, res) => {
    db.Service.update(req.body, {
        where: {
            id: req.params.id
        }
    }).then(data => {
        res.redirect("/admin/services")
    })
});

//delete service in database
router.delete("/services/:id/:name", ensureAuthenticated, (req, res) => {
    //Check if file exist and delete
    var filePath = "./public/assets/images/serviceUpload/" + req.params.name + ".png";

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
   
    db.Service.destroy({
        where: {
            id: req.params.id
        }
    }).then(data => {
        res.redirect("/admin/services")
    });
});

//saloninfo
//edit
router.get("/salon/edit", ensureAuthenticated, (req, res) => {
    db.Salon.findOne({
        where: {
            name: SALON_NAME
        },
        include: [db.Address, db.Email, db.Phone]
    }).then(data => {
        res.render("adminSalonEdit", { editSalon: data })
    });
});

//update - update database
router.put("/salon/update", ensureAuthenticated, (req, res) => {
    db.Email.update({
        email: req.body.email
    }, {
            where: {
                id: req.body.emailId
            }
        }).then(db.Address.update({
            address1: req.body.address1,
            address2: req.body.address2,
            city: req.body.city,
            state: req.body.state,
            zip: req.body.zip
        }, {
                where: {
                    id: req.body.addressId
                }
            })).then(db.Phone.update({
                mobile: req.body.mobile,
                home: req.body.home
            }, {
                    where: {
                        id: req.body.phoneId
                    }
                })).then(db.Salon.update({
                    name: req.body.name,
                    password: req.body.password,
                    description: req.body.description,
                    photo: req.body.photo
                }, {
                        where: {
                            name: SALON_NAME
                        }
                    })).then(data => {
                        res.redirect("/");
                    });
});

//manage staff
// show all staff
router.get("/staff", ensureAuthenticated, (req, res) => {
    db.Staff.findAll({
        order: [["name", "ASC"]],
        include: [db.Address, db.Email, db.Phone]
    }).then(data => {
        res.render("adminStaff", { staff: data });
    });
});

//add staff in database
storage = multer.diskStorage({
    destination: "./public/assets/images/staffUpload",
    filename: function (req, file, cb) {
        cb(null, req.body.name + ".png");
    }
});

upload = multer({ storage: storage });

router.post("/staff/new", ensureAuthenticated, upload.single("photo"), (req, res) => {
    var emailId;
    var addressId;
    var phoneId;

    db.Email.create({
        email: req.body.email
    }).then((newEmail) => {
        emailId = newEmail.id;

        return db.Address.create({
            address1: req.body.address1,
            address2: req.body.address2,
            city: req.body.city,
            state: req.body.state,
            zip: req.body.zip
        });

    }).then((newAddress) => {
        addressId = newAddress.id;

        return db.Phone.create({
            mobile: req.body.mobile,
            home: req.body.home
        });
    }).then((newPhone) => {
        phoneId = newPhone.id;

        return db.Staff.create(
            {
                name: req.body.name,
                lastname: req.body.lastname,
                bio: req.body.bio,
                station: req.body.station,
                day: req.body.day,
                hour: req.body.hour,
                emergency_contact_name: req.body.emergency_contact_name,
                emergency_contact_phone: req.body.emergency_contact_phone,
                photo: req.body.name + ".png",
                comment: req.body.comment,
                EmailId: emailId,
                AddressId: addressId,
                PhoneId: phoneId
            }, 
            {
                include: [db.Address, db.Email, db.Phone]
            }
        );
    }).then(data => {
        res.redirect("/admin/staff")
    }).catch((error) => {
        res.json(error);
    });
});

//edit staff - show update product
router.get("/staff/:id/edit", ensureAuthenticated, (req, res) => {
    db.Staff.findOne({
        where: 
        {
            id: req.params.id
        },
        include: [db.Address, db.Email, db.Phone]
    }).then(data => {
        res.render("adminStaffEdit", { editStaff: data })
    });
});

//update - update database
router.put("/staff/:id", ensureAuthenticated, upload.single("photo"), (req, res) => {
    db.Email.update(
        {
            email: req.body.email
        }, 
        {
            where: 
            {
                id: req.body.emailId
            }
        }
    ).then(db.Address.update(
        {
            address1: req.body.address1,
            address2: req.body.address2,
            city: req.body.city,
            state: req.body.state,
            zip: req.body.zip
        }, 
        {
            where: 
            {
                id: req.body.addressId
            }
        }
    )).then(db.Phone.update(
        {
            mobile: req.body.mobile,
            home: req.body.home
        }, 
        {
            where: 
            {
                id: req.body.phoneId
            }
        }
    )).then(db.Staff.update({
            name: req.body.name,
            lastname: req.body.lastname,
            bio: req.body.bio,
            station: req.body.stataion,
            day: req.body.day,
            hour: req.body.hour,
            emergency_contact_name: req.body.emergency_contact_name,
            emergency_contact_phone: req.body.emergency_contact_phone,
            photo: req.body.name + ".png",
            comment: req.body.comment
        }, 
        {
            where: 
            {
                id: req.params.id
            }
        })
    ).then(data => {
            res.redirect("/admin/staff");
        }
    );
});

//delete staff in database
router.delete("/staff/:id/:name", ensureAuthenticated, (req, res) => {
    //Check if file exist and delete
    var filePath = "./public/assets/images/staffUpload/" + req.params.name + ".png";

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
    db.Staff.destroy({
        where: {
            id: req.params.id
        }
    }).then(data => {
        res.redirect("/admin/staff")
    });
});

//manage customer
// show all customer
router.get("/customers", ensureAuthenticated, (req, res) => {
    db.Customer.findAll({
        order: [["name", "ASC"]],
        include: [db.Address, db.Email, db.Phone]
    }).then(data => {
        res.render("adminCustomers", { customers: data });
    });
});

//add customer in database
router.post("/customers/new", ensureAuthenticated, (req, res) => {
    var emailId;
    var addressId;
    var phoneId;

    db.Email.create({
        email: req.body.email
    }).then((newEmail) => {
        emailId = newEmail.id;

        return db.Address.create({
            address1: req.body.address1,
            address2: req.body.address2,
            city: req.body.city,
            state: req.body.state,
            zip: req.body.zip
        });

    }).then((newAddress) => {
        addressId = newAddress.id;

        return db.Phone.create({
            mobile: req.body.mobile,
            home: req.body.home
        });
    }).then((newPhone) => {
        phoneId = newPhone.id;

        return db.Customer.create({
            name: req.body.name,
            lastname: req.body.lastname,
            password: req.body.password,
            gender: req.body.gender,
            balance: req.body.balance,
            lastvisit: req.body.lastvisit,
            photo: req.body.photo,
            comment: req.body.comment,
            EmailId: emailId,
            AddressId: addressId,
            PhoneId: phoneId
        }, {
                include: [db.Address, db.Email, db.Phone]
            });
    }).then(data => {
        res.redirect("/admin/customers")
    }).catch((error) => {
        res.json(error);
    });
});

//edit customers - show update product
router.get("/customers/:id/edit", ensureAuthenticated, (req, res) => {
    db.Customer.findOne({
        where: 
        {
            id: req.params.id
        },
        include: [db.Address, db.Email, db.Phone]
    }).then(data => {
        res.render("adminCustomersEdit", { editCustomer: data })
    });
});

//update - update database
router.put("/customers/:id", ensureAuthenticated, (req, res) => {
    db.Email.update({
        email: req.body.email
    }, 
    {
        where: 
        {
            id: req.body.emailId
        }
    }).then(db.Address.update(
        {
            address1: req.body.address1,
            address2: req.body.address2,
            city: req.body.city,
            state: req.body.state,
            zip: req.body.zip
        }, 
        {
            where: 
            {
                id: req.body.addressId
            }
        }
    )).then(db.Phone.update(
        {
            mobile: req.body.mobile,
            home: req.body.home
        }, 
        {
            where: 
            {
                id: req.body.phoneId
            }
        }
    )).then(db.Customer.update(
        {
            name: req.body.name,
            lastname: req.body.lastname,
            password: req.body.password,
            gender: req.body.gender,
            balance: req.body.balance,
            lastvisit: req.body.lastvisit,
            photo: req.body.photo,
            comment: req.body.comment
        }, 
        {
            where: 
            {
                id: req.params.id
            }
        }
    )).then(data => {
            res.redirect("/admin/customers");
        }
    );
});

//delete staff in database
router.delete("/customers/:id", ensureAuthenticated, (req, res) => {
    db.Customer.destroy({
        where: {
            id: req.params.id
        }
    }).then(data => {
        res.redirect("/admin/customers")
    });
});

router.get("/staffservice", ensureAuthenticated, (req, res) => {
    var data;

    db.Staff.findAll().then(allStaff => {
        db.Service.findAll().then(allServices => {
            data = {
                aStaff: allStaff,
                aServices: allServices
            }
        });

        res.render("adminStaffService", { data: data })
    });
});

//// show all membership
router.get("/membership", ensureAuthenticated, (req, res) => {
    db.Membership.findAll({
        order: [["title", "ASC"]]
    }).then(data => {
        res.render("adminMembership", { membership: data });
    });
});

//add membership in database
router.post("/membership/new", ensureAuthenticated, (req, res) => {
    db.Membership.create(
        {
            title: req.body.title,
            price: req.body.price,
            description: req.body.description
        }
    ).then(data => {
        res.redirect("/admin/membership")
    });
});

//edit membership - show update membership
router.get("/membership/:id/edit", ensureAuthenticated, (req, res) => {
    db.Membership.findOne({
        where: {
            id: req.params.id
        }
    }).then(data => {
        res.render("adminMembershipEdit", { editMembership: data })
    });
});

//update - update database
router.put("/membership/:id", ensureAuthenticated, (req, res) => {
    db.Membership.update(req.body, {
        where: {
            id: req.params.id
        }
    }).then(data => {
        res.redirect("/admin/membership")
    })
});

//delete membership in database
router.delete("/membership/:id", ensureAuthenticated, (req, res) => {
    db.Membership.destroy({
        where: {
            id: req.params.id
        }
    }).then(data => {
        res.redirect("/admin/membership")
    });
});

module.exports = router;