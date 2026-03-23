import { NextResponse } from "next/server";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "~/server/db";
import {
  admins,
  users,
  conversationParticipants,
  messages,
  messageReadStatus,
} from "~/server/db/schema";
import { resend } from "~/lib/resend";

export async function GET(req: Request) {
  // if (
  //   req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  // ) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }

  // Get all admin emails
  const adminList = await db.select().from(admins);
  if (adminList.length === 0) {
    return NextResponse.json({ ok: true, message: "No admins configured" });
  }

  const adminEmails = adminList.map((a) => a.email);

  // Find admin users
  const adminUsers = await db
    .select({ id: users.id, email: users.email, fullName: users.fullName })
    .from(users)
    .where(inArray(users.email, adminEmails));

  if (adminUsers.length === 0) {
    return NextResponse.json({ ok: true, message: "No admin users found" });
  }

  let totalSent = 0;

  for (const admin of adminUsers) {
    // Get conversations this admin is part of
    const participations = await db
      .select({ conversationId: conversationParticipants.conversationId })
      .from(conversationParticipants)
      .where(eq(conversationParticipants.userId, admin.id));

    if (participations.length === 0) continue;

    const conversationIds = participations.map((p) => p.conversationId);

    // Get all unread messages for this admin (not sent by them, not yet read)
    const unreadMessages = await db
      .select({
        id: messages.id,
        content: messages.content,
        createdAt: messages.createdAt,
        conversationId: messages.conversationId,
        senderName: users.fullName,
        senderEmail: users.email,
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(
        and(
          inArray(messages.conversationId, conversationIds),
          sql`${messages.senderId} != ${admin.id}`,
          sql`${messages.id} NOT IN (
            SELECT ${messageReadStatus.messageId} FROM ${messageReadStatus}
            WHERE ${messageReadStatus.userId} = ${admin.id}
          )`,
        ),
      )
      .orderBy(messages.createdAt);

    if (unreadMessages.length === 0) continue;

    // Group by sender
    const bySender: Record<
      string,
      { name: string; messages: typeof unreadMessages }
    > = {};
    for (const msg of unreadMessages) {
      const key = msg.senderEmail;
      bySender[key] ??= {
        name: msg.senderName ?? msg.senderEmail,
        messages: [],
      };
      bySender[key].messages.push(msg);
    }

    // Build email HTML
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tenantly.icu";
    const senderSections = Object.values(bySender)
      .map(
        (sender) => `
        <tr>
          <td style="padding: 16px 24px;">
            <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #1d1d1f;">${sender.name}</p>
            ${sender.messages
              .map(
                (m) => `
              <div style="padding: 8px 12px; margin-bottom: 6px; background-color: #f5f5f7; border-radius: 8px;">
                <p style="margin: 0; font-size: 14px; color: #1d1d1f; line-height: 1.4;">${m.content.length > 200 ? m.content.slice(0, 200) + "..." : m.content}</p>
                <p style="margin: 4px 0 0; font-size: 11px; color: #86868b;">${new Date(m.createdAt).toLocaleString("en-AU", { dateStyle: "medium", timeStyle: "short" })}</p>
              </div>`,
              )
              .join("")}
          </td>
        </tr>`,
      )
      .join("");

    const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; margin: 0 auto;">
    <tr><td style="height: 40px;"></td></tr>
    <tr>
      <td style="padding: 0 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #1d1d1f;">You have ${unreadMessages.length} unread message${unreadMessages.length !== 1 ? "s" : ""}</h1>
        <p style="margin: 8px 0 0; font-size: 15px; color: #86868b;">Here's a summary of messages waiting for your reply.</p>
      </td>
    </tr>
    <tr><td style="height: 24px;"></td></tr>
    ${senderSections}
    <tr><td style="height: 24px;"></td></tr>
    <tr>
      <td style="padding: 0 24px; text-align: center;">
        <a href="${siteUrl}/dashboard" style="display: inline-block; padding: 14px 32px; background-color: #1d1d1f; color: #ffffff; text-decoration: none; border-radius: 12px; font-size: 15px; font-weight: 600;">Open Tenantly</a>
      </td>
    </tr>
    <tr><td style="height: 32px;"></td></tr>
    <tr>
      <td style="padding: 0 24px; text-align: center;">
        <div style="height: 1px; background-color: #e8e8ed;"></div>
      </td>
    </tr>
    <tr><td style="height: 24px;"></td></tr>
    <tr>
      <td style="padding: 0 24px; text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #aeaeb2;">This is an automated digest from <a href="https://tenantly.icu" style="color: #0071e3; text-decoration: none;">Tenantly</a>.</p>
      </td>
    </tr>
    <tr><td style="height: 40px;"></td></tr>
  </table>
</body>
</html>`;

    try {
      await resend.emails.send({
        from: "Tenantly <noreply@tenantly.icu>",
        to: admin.email,
        subject: `${unreadMessages.length} unread message${unreadMessages.length !== 1 ? "s" : ""} on Tenantly`,
        html,
      });
      totalSent++;
    } catch (error) {
      console.error(`Failed to send digest to ${admin.email}:`, error);
    }
  }

  return NextResponse.json({ ok: true, adminNotified: totalSent });
}
