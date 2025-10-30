exports.sanitizeUser = function (user) {
  return {
    id: user._id,
    username: user.name,
    email: user.email,
    avatar: user.avatar,
  };
};

exports.sanitizePatient = function (patient) {
  return {
    id: patient._id,
    username: patient.user.name,
    avatar: patient.user.avatar,
  };
};

exports.sanitizeDoctor = function (doctor) {
  return {
    id: doctor._id,
    username: doctor.user.name,
    avatar: doctor.user.avatar,
  };
};
