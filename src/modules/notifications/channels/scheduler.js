import cron from "node-cron";
import noticeService from "../notif.service.js";
//every 5 minutes the server will check for reminders
export default function startScheduler() {
  cron.schedule("*/1 * * * *", async () => {
    console.log("Checking reminders...");
   const result= await noticeService.sendAppointmentReminders();
    console.log(result.message);
  });
} 