const cron = require("node-cron");
const asynchandler = require("express-async-handler");

const Appointment = require("../models/appointmentModel");
const { sendEmail } = require("./sendEmail");

exports.reminder = () => {
  cron.schedule(
    "0 * * * *",
    asynchandler(async () => {
      const now = Date.now();
      const remind = now + 24 * 60 * 60 * 1000;

      const appointments = await Appointment.find({
        startTime: {
          $gte: now,
          $lte: remind,
        },
        status: "confirmed",
        reminderSent: false,
      }).populate([
        {
          path: "patientId",
          select: "user",
        },
        { path: "doctorId", select: "name" },
      ]);

      for (const appt of appointments) {
        await sendEmail(
          appt.patientId.user.email,
          "Appointment Reminder",
          `Reminder: You have an appointment with Dr. ${appt.doctorId.name} at ${appt.startTime}`
        );
        appt.reminderSent = true;
        await appt.save();
      }
    })
  );
};
