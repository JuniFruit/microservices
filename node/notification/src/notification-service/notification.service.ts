import axios from "axios";
import { getChannel, sendDataToQueue } from "../rabbitmq/connect";
import { IConsumedMsg } from "./notification.type";

class NotificationService {
  async listen() {
    const channel = getChannel();

    await channel.consume(process.env.AUDIO_Q!, msg => {
      if (!msg) return;
      const parsedMsg = JSON.parse(Buffer.from(msg.content).toString("utf-8"));

      this.notify(parsedMsg)
        .then(() => {
          console.log("Message sent to " + parsedMsg.email);
          channel.ack(msg);
        })
        .catch(err => {
          console.error(err);
          channel.reject(msg);
        });
    });

    channel.consume(process.env.ERROR_Q! + "_messages", msg => {
      if (!msg) return;
      const parsedMsg = JSON.parse(Buffer.from(msg.content).toString("utf-8"));
      this.notify(parsedMsg, true)
        .then(() => {
          console.log("Error message sent to " + parsedMsg.email);
          channel.ack(msg);
        })
        .catch(err => console.log(err));

      sendDataToQueue(process.env.DELETE_FILES_Q!, parsedMsg);
    });
  }

  notify(parsedMsg: IConsumedMsg, isError = false) {
    const activation_link = isError
      ? "We failed to generate file for you"
      : `${process.env.APP_URL}/${parsedMsg.mp3_id}`;

    const data = {
      service_id: process.env.EMAIL_SERVICE!,
      template_id: process.env.EMAIL_TEMPLATE!,
      user_id: process.env.EMAIL_KEY!,
      template_params: {
        service_name: "Mp3 Converter",
        activation_link,
        to_email: parsedMsg.email,
      },
    };
    return axios.post(process.env.EMAIL_SEND_ENDPOINT!, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

export const notificationService = new NotificationService();
