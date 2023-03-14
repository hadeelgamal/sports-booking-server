//isInstructor
const isInstructor = (req, res, next) => {
    if (req.payload.role === "Instructor") {
        next();
}
};

//isStudent
const isStudent = (req, res, next) => {
    if (req.payload.role === "Student") {
        next();
}
};

module.exports = {
    isInstructor,
    isStudent
  };