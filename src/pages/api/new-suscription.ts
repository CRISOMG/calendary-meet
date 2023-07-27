// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

const webpush = require("web-push");
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { suscription } = req.body;

    const webPushStatus = await webpush.sendNotification(
      suscription,
      JSON.stringify({
        type: "new-suscription",
      }),
      {
        vapidDetails: {
          subject: "mailto:caraballodev@gmail.com",
          publicKey: process.env.NEXT_PUBLIC_VAPID_KEY,
          privateKey: process.env.PRIVATE_VAPID_KEY,
        },
      }
    );

    res.status(webPushStatus.statusCode).json({ status: "ok" });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}
