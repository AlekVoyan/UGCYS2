import type { Handler } from "@netlify/functions";

const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

// Helper to escape HTML for the <pre> tag
const escapeHTML = (str: string) => {
  return str.replace(/[&<>"']/g, function (match) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[match]!;
  });
}

const handler: Handler = async (event) => {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error("Missing Telegram environment variables");
    return {
      statusCode: 500,
      body: "Server configuration error: Missing Telegram environment variables.",
    };
  }

  if (!event.body) {
    return {
      statusCode: 400,
      body: "No body in event",
    }
  }

  const submission = JSON.parse(event.body).payload.data;
  
  const { name, email, service, message } = submission;

  const formattedText = `
<b>New Contact Form Submission</b> 📩

<b>Name:</b> ${escapeHTML(name)}
<b>Email:</b> <a href="mailto:${escapeHTML(email)}">${escapeHTML(email)}</a>
<b>Service of Interest:</b> ${escapeHTML(service)}

<b>Message:</b>
<pre>${escapeHTML(message)}</pre>
  `;

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: formattedText,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Telegram API error:", errorData);
      return {
        statusCode: response.status,
        body: JSON.stringify(errorData),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Message sent to Telegram" }),
    };
  } catch (error) {
    console.error("Error sending message to Telegram:", error);
    return {
      statusCode: 500,
      body: `Error: ${(error as Error).message}`,
    };
  }
};

export { handler };
