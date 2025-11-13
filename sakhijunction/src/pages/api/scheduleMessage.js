import { NextApiRequest, NextApiResponse } from 'next';
import { sendEmail } from '@/lib/sendEmail';
import { sendSMS } from '@/lib/sendSMS';

export default async function scheduleMessage(req: NextApiRequest, res: NextApiResponse) {
  const { message, scheduledFor, delivery } = req.body;

  try {
    // Schedule message delivery based on the selected delivery method
    if (delivery === 'email') {
      await sendEmail(message, scheduledFor);
    } else if (delivery === 'sms') {
      await sendSMS(message, scheduledFor);
    } else {
      // Handle app notification scheduling here
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error scheduling message:', error);
    res.status(500).json({ success: false, error: 'Failed to schedule message' });
  }
}