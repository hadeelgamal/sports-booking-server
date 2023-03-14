const express = require("express");
const router = express.Router();
const Class = require("../models/Class.model");
const User = require("../models/User.model");


const { isAuthenticated } = require("../middleware/jwt.middleware.js");
const {isStudent, isInstructor} = require("../middleware/route-guard");

// router.get("/classes/list", (req, res) => {

//   Class.find()
//     .then((classes) => {
//       console.log("classes from DB: ", { classes });

//       if(req.session.currentUser){
//       const updateClasses = classes.map((singleClass) => {
//         return {...singleClass._doc, isLoggedIn: true}
//       })
//         console.log("UPDATE CLASSES ===>", updateClasses)
//       res.render("classes/list", { classes: updateClasses, isLoggedIn:true});
//     } else {
//       const updateClasses = classes.map((singleClass) => {
//         return {...singleClass._doc, isLoggedIn: false}
//       })
//       res.render("classes/list", { classes:updateClasses, isLoggedOut:true});
//     }
//     })

//     .catch((err) => console.log(err));
// });

router.get("/:id/class-details", isAuthenticated, (req, res, next) => {
  const { id } = req.params;
  if(req.payload.role === "Instructor"){
  Class.findById(id)
    .then((foundClass) => {

        User.findById(foundClass.owner)
        .then((foundClassInstructor) => {

        if (foundClass.owner.toString() === req.payload._id) {
          res.json({isInstructor: true, foundClass, isOwner: true, foundClassInstructor, isLoggedIn:true});
        } else {
          res.json({isInstructor: true, foundClass, foundClassInstructor, isLoggedIn:true});
        } 
    })
  })
    .catch((err) => console.log(err));
  }
  else { 
    Class.findById(id)
    .then((foundClass) => {

      User.findById(req.payload._id)
        .then((currentUser) => {
          console.log("FOUNDCLASS OWNER ===>", foundClass.owner.toString())

          User.findById(foundClass.owner.toString())
            .then((foundClassInstructor) => {
            if(currentUser.classes.includes(foundClass._id.toString())) {
                res.json({isInstructor: false, foundClass, isBooked: true, foundClassInstructor, isLoggedIn:true});
    
            } else {
                res.json({isInstructor: false, foundClass, isNotBooked: true, foundClassInstructor, isLoggedIn:true});
    
            }
            })
    })
    })
    .catch((err) => console.log(err));


  }
});

router.post("/create-class", isAuthenticated, (req, res) => {
  const { className, duration, date, timeOfDay, description, location, price, neededEquipment} = req.body;
  const ownerId = req.payload._id
  

 Class.create({ className, duration, date, timeOfDay, description, owner: ownerId, location, price, neededEquipment}) 
.then(newClass => {
    User.findById(ownerId)
    .then(classInstructor => {
        classInstructor.classes.push(newClass._id)
        classInstructor.save()
    })
    .catch(err => console.log(err))
    res.json(newClass)
})
.catch(err => console.log(err))

});


router.put("/:id/edit-class", (req, res) => {
  const { className, duration, date, timeOfDay, description } = req.body;
  const { id } = req.params;  
  Class.findByIdAndUpdate(id, { className, duration, date, timeOfDay, description }, {new:true})
    .then((updatedClass) => res.json(updatedClass))
    .catch((err) => console.log(err));
});


// router.post('/classes/:id/delete', isInstructor, (req, res, next) => {
//     const { id } = req.params;

//     Class.findById(id)
//         .then((foundClass) => {
//             User.findById(req.session.currentUser._id)
//                 .then((currentUser) => {
//                     const classIndex= currentUser.classes.indexOf(foundClass._id)
//                     currentUser.classes.splice(classIndex._id, 1)
//                     currentUser.save()
                    
//                 })
            
//             User.find(foundClass._id)
//             .then((listOfAttendees) => {
//               listOfAttendees.forEach((singleAttendee) => {
//                 User.findById(singleAttendee._id)
//                   .then ((foundSingleAttendee) => {
//                     classIndex= foundSingleAttendee.classes.indexOf(foundClass._id)
//                     foundSingleAttendee.classes.splice(classIndex._id, 1)
//                     foundSingleAttendee.save()
//                   }) 
//               })
//             })

//                 .catch(err => console.log(err))
//         })
//         Class.findByIdAndDelete(id)
//         .then(() => res.redirect('/auth/profile'))

//   });

router.post("/:id/book-class", isAuthenticated, isStudent, (req, res, next) => {
    const { id } = req.params
Class.findById(id)
    .then((foundClass) => {
        foundClass.attendees.push(req.payload._id)
        foundClass.save()
        User.findById(req.payload._id)
            .then((currentUser) => {
                currentUser.classes.push(foundClass._id)
                currentUser.save()
            })
            res.json(foundClass);
    })
    .catch(err => console.log(err))
})

// router.post("/classes/:id/cancel-class", isStudent, (req, res, next) => {

//     const {id} = req.params

//     Class.findById(id)
//         .then((foundClass) => {
//             const attendeeIndex = foundClass.attendees.indexOf(req.session.currentUser._id)
//             foundClass.attendees.splice(attendeeIndex, 1)
//             foundClass.save()
            
//             User.findById(req.session.currentUser._id)
//                 .then((currentUser) => {
//                     const classIndex= currentUser.classes.indexOf(foundClass._id)
//                     currentUser.classes.splice(classIndex._id, 1)
//                     currentUser.save()
//                 })
//         })
//         .then(res.redirect(`/classes/${id}/class-details`))
//     .catch(err => console.log(err))
// })

module.exports = router;