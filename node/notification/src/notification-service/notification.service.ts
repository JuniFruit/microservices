import { ConsumeMessage } from "amqplib";
import { getChannel } from "../rabbitmq/connect";
import { IConsumedMsg } from "./notification.type";
import axios from "axios";

class NotificationService {
  async listen() {
    const channel = getChannel();

    channel.consume(process.env.AUDIO_Q!, async msg => {
      try {
        if (!msg) return;
        await this.notify(msg);
      } catch (error: any) {
        // const msgStr = JSON.stringify({ error: "Conversion failed." + error });
        // channel.nack({
        //   content: Buffer.from(msgStr, "utf-8"),
        //   properties: msg?.properties!,
        //   fields: msg?.fields!,
        // });
      }
    });
  }

  async notify(msg: ConsumeMessage) {
    const parsedMsg: IConsumedMsg = JSON.parse(Buffer.from(msg.content).toString("utf-8"));
    console.log(parsedMsg);

    const data = {
      service_id: process.env.EMAIL_SERVICE!,
      template_id: process.env.EMAIL_TEMPLATE!,
      user_id: process.env.EMAIL_KEY!,
      template_params: {
        service_name: "Mp3 Converter",
        activation_link: `${process.env.APP_URL}/${parsedMsg.mp3_id}`,
        to_email: parsedMsg.email,
      },
    };

    const res = await axios.post(process.env.EMAIL_SEND_ENDPOINT!, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log(`Status for ${parsedMsg.email} transport is ${res.status} ${res.statusText}`);
  }
}

export const notificationService = new NotificationService();
