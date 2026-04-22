export async function sendWorkflowEmailNotification(_input: {
  toDepartment: string
  subject: string
  message: string
}) {
  return {
    delivered: false,
    reason: "Email delivery is staged until SMTP is configured.",
  }
}
