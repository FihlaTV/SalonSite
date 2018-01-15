var express = require("express");
var router = express.Router();
var db = require("../models");
const SALON_NAME = "Blvd6 Salon";

router.get("/", (req, res) => {
    res.render("adminIndex");
});
// show all product
router.get("/products", (req, res) => {
    db.Product.findAll({
        order: [["brand", "ASC"]]
    }).then(data => {
        res.render("adminProducts", { products: data });
    });
});
//add product in database
router.post("/products/new", (req, res) => {
    // console.log(req.body)
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
            photo: req.body.photo
        }
    ).then(data => {
        res.redirect("/admin/products")
    });
});
//edit product - show update product
router.get("/products/:id/edit", (req, res) => {
    console.log(req.params.id)
    db.Product.findOne({
        where: {
            id: req.params.id
        }
    }).then(data => {
        res.render("adminProductsEdit", { editproduct: data })
    });
});
//update - update database
router.put("/products/:id", (req, res) => {
    db.Product.update(req.body, {
        where: {
            id: req.params.id
        }
    }).then(data => {
        res.redirect("/admin/products")
    }
        )
})
//delete product in database
router.delete("/products/:id", (req, res) => {
    // console.log(req.params.id);
    db.Product.destroy({
        where: {
            id: req.params.id
        }
    }).then(data => {
        res.redirect("/admin/products")
    });
});

//service
router.get("/services", (req, res) => {
    db.Service.findAll({
        order: [["name", "ASC"]]
    }).then(data => {
        console.log(data);
        res.render("adminservices", { services: data });
    });
});
//add service in database
router.post("/services/new", (req, res) => {
    // console.log(req.body)
    db.Service.create(
        {
            name: req.body.name,
            duration: req.body.duration,
            member_price: req.body.member_price,
            nonmember_price: req.body.nonmember_price,
            cost: req.body.cost,
            photo: req.body.photo,
            comment: req.body.comment,
        }
    ).then(data => {
        console.log(data);
        res.redirect("/admin/services")
    });
});
//edit service - show update service
router.get("/services/:id/edit", (req, res) => {
    console.log(req.params.id)
    db.Service.findOne({
        where: {
            id: req.params.id
        }
    }).then(data => {
        console.log(data);
        res.render("adminServicesEdit", { editservice: data })
    });
});
//update - update database
router.put("/services/:id", (req, res) => {
    db.Service.update(req.body, {
        where: {
            id: req.params.id
        }
    }).then(data => {
        console.log(data);
        res.redirect("/admin/services")
    })
})
//delete service in database
router.delete("/services/:id", (req, res) => {
    // console.log(req.params.id);
    db.Service.destroy({
        where: {
            id: req.params.id
        }
    }).then(data => {
        console.log(data);
        res.redirect("/admin/services")
    });
});

//saloninfo
//edit
router.get("/salon/edit", (req, res) => {
    db.Salon.findOne({
        where: {
            name: SALON_NAME
        },
        include: [db.Address
            , db.Email, db.Phone
        ]
    }).then(data => {
        console.log(data)
        res.render("adminSalonEdit", { editSalon: data })
    });
});
//update - update database
router.put("/salon/update", (req, res) => {
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
router.get("/staff", (req, res) => {
    db.Staff.findAll({
        order: [["name", "ASC"]],
        include: [db.Address
            , db.Email, db.Phone
        ]
    }).then(data => {
        // console.log(data)
        res.render("adminStaff", { staff: data });
    });
});
//add staff in database
router.post("/staff/new", (req, res) => {
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
        // console.log('adding new customer', 'email:', emailId,
        //     'address:', addressId,
        //     'phone:', phoneId)
        return db.Staff.create({
            name: req.body.name,
            lastname: req.body.lastname,
            bio: req.body.bio,
            station: req.body.station,
            day: req.body.day,
            hour: req.body.hour,
            emergency_contact_name: req.body.emergency_contact_name,
            emergency_contact_phone: req.body.emergency_contact_phone,
            comment: req.body.comment,
            EmailId: emailId,
            AddressId: addressId,
            PhoneId: phoneId
        }, {
                include: [db.Address
                    , db.Email, db.Phone
                ]
            });
    }).then(data => {
        res.redirect("/admin/staff")
        // console.log(data);
        // res.json(data)
    }).catch((error) => {
        res.json(error);
    });
});
//edit staff - show update product
router.get("/staff/:id/edit", (req, res) => {
    console.log(req.params.id)
    db.Staff.findOne({
        where: {
            id: req.params.id
        },
        include: [db.Address
            , db.Email, db.Phone
        ]
    }).then(data => {
        res.render("adminStaffEdit", { editStaff: data })
    });
});
//update - update database
router.put("/staff/:id", (req, res) => {
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
                })).then(db.Staff.update({
                    name: req.body.name,
                    lastname: req.body.lastname,
                    bio: req.body.bio,
                    station: req.body.stataion,
                    day: req.body.day,
                    hour: req.body.hour,
                    emergency_contact_name: req.body.emergency_contact_name,
                    emergency_contact_phone: req.body.emergency_contact_phone,
                    photo: req.body.photo,
                    comment: req.body.comment
                }, {
                        where: {
                            id: req.params.id
                        }
                    })).then(data => {
                        res.redirect("/admin/staff");
                    });
})
//delete staff in database
router.delete("/staff/:id", (req, res) => {
    // console.log(req.params.id);
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
router.get("/customers", (req, res) => {
    db.Customer.findAll({
        order: [["name", "ASC"]],
        include: [db.Address
            , db.Email, db.Phone
        ]
    }).then(data => {
        // console.log(data)
        res.render("adminCustomers", { customers: data });
    });
});
//add customer in database
router.post("/customers/new", (req, res) => {
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

        // console.log('adding new customer', 'email:', emailId,
        //     'address:', addressId,
        //     'phone:', phoneId)
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
                include: [db.Address
                    , db.Email, db.Phone
                ]
            });
    }).then(data => {
        res.redirect("/admin/customers")
        // console.log(data);
        // res.json(data)
    }).catch((error) => {
        res.json(error);
    });
});
//edit customers - show update product
router.get("/customers/:id/edit", (req, res) => {
    console.log(req.params.id)
    db.Customer.findOne({
        where: {
            id: req.params.id
        },
        include: [db.Address
            , db.Email, db.Phone
        ]
    }).then(data => {
        res.render("adminCustomersEdit", { editCustomer: data })
    });
});
//update - update database
router.put("/customers/:id", (req, res) => {
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
                })).then(db.Customer.update({
                    name: req.body.name,
                    lastname: req.body.lastname,
                    password: req.body.password,
                    gender: req.body.gender,
                    balance: req.body.balance,
                    lastvisit: req.body.lastvisit,
                    photo: req.body.photo,
                    comment: req.body.comment
                }, {
                        where: {
                            id: req.params.id
                        }
                    })).then(data => {
                        res.redirect("/admin/customers");
                    });
})
//delete staff in database
router.delete("/customers/:id", (req, res) => {
    // console.log(req.params.id);
    db.Customer.destroy({
        where: {
            id: req.params.id
        }
    }).then(data => {
        res.redirect("/admin/customers")
    });
});

router.get("/staffservice", (req, res) => {
    var data;
    db.Staff.findAll().then(allStaff => {
        // console.log(allStaff);
        db.Service.findAll().then(allServices => {
            // console.log(allServices)
            data = {
                aStaff: allStaff,
                aServices: allServices
            }
            // console.log(data.aStaff[0].dataValues.name)
            // console.log(data.aServices[0].dataValues.name)
            console.log(data.aStaff)
            console.log("::::::::::::::::")
            console.log(data.aServices)
        });
        res.render("adminStaffService", { data: data })
    });
});

//// show all membership
router.get("/membership", (req, res) => {
    console.log(req.body)
    db.Membership.findAll({
        order: [["title", "ASC"]]
    }).then(data => {
        // console.log(data)
        res.render("adminMembership", { Membership: data });
    });
});
//add membership in database
router.post("/membership/new", (req, res) => {
    console.log('before', req.body.description)
    var description = "<pre>" + req.body.description + "</pre>"
    console.log('after', req.body.description)
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
router.get("/membership/:id/edit", (req, res) => {
    console.log(req.params.id)
    db.Membership.findOne({
        where: {
            id: req.params.id
        }
    }).then(data => {
        res.render("adminMembershipEdit", { editMembership: data })
    });
});
//update - update database
router.put("/membership/:id", (req, res) => {
    db.Membership.update(req.body, {
        where: {
            id: req.params.id
        }
    }).then(data => {
        res.redirect("/admin/membership")
    }
        )
})
//delete membership in database
router.delete("/membership/:id", (req, res) => {
    // console.log(req.params.id);
    db.Membership.destroy({
        where: {
            id: req.params.id
        }
    }).then(data => {
        res.redirect("/admin/membership")
    });
});

module.exports = router;


