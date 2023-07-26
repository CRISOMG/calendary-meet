// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

const webpush = require("web-push");

export default async function handler(req, res) {
  try {
    const suscritions = req.body;

    await Promise.all(
      suscritions.map(async (suscription) => {
        const webPushStatus = await webpush.sendNotification(
          suscription,
          JSON.stringify({
            type: "remember",
          }),
          {
            vapidDetails: {
              subject: "mailto:caraballodev@gmail.com",
              publicKey: process.env.NEXT_PUBLIC_VAPID_KEY,
              privateKey: process.env.PRIVATE_VAPID_KEY,
            },
          }
        );
        return webPushStatus;
      })
    );

    res.status(200).json({ status: "ok" });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}
