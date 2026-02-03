"use server"

import { Resend } from 'resend';

// The word 'export' and 'async' must be here!
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendShareEmail(targetEmail: string, taskTitle: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'QuickTask <onboarding@resend.dev>', 
      to: [targetEmail],
      subject: 'A task has been shared with you!',
      html: `
        <h1>Collaboration Invite</h1>
        <p>A new task has been shared with you on <strong>QuickTask Professional</strong>.</p>
        <p><strong>Task Name:</strong> ${taskTitle}</p>
      `,
    });

    if (error) return { success: false, error };
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err };
  }
}