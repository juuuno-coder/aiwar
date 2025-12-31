import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { type, title, description, userNickname, referenceId } = body;

        // Validation
        if (!title || !description) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const emailUser = process.env.EMAIL_USER;
        const emailPass = process.env.EMAIL_PASS;

        console.log(`[API] Email Attempt: User=${emailUser ? 'Set' : 'Missing'}, Pass=${emailPass ? 'Set' : 'Missing'}`);

        // Skip email if credentials are not set (but don't fail the request)
        if (!emailUser || !emailPass) {
            console.warn('[API] Email credentials not set in environment variables.');
            return NextResponse.json({ message: 'Saved (Email skipped due to missing config)' }, { status: 200 });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: emailUser,
                pass: emailPass,
            },
        });

        // Email Content
        const subjectPrefix = type === 'error' ? '[오류 제보]' : '[아이디어 제안]';
        const mailOptions = {
            from: emailUser,
            to: 'juuuno1116@gmail.com',
            subject: `${subjectPrefix} ${title}`,
            text: `
                작성자: ${userNickname}
                유형: ${type === 'error' ? '오류 제보' : '아이디어 제안'}
                ID: ${referenceId || 'N/A'}
                
                내용:
                ${description}
            `,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: ${type === 'error' ? '#d9534f' : '#f0ad4e'};">
                        ${subjectPrefix} ${title}
                    </h2>
                    <p><strong>작성자:</strong> ${userNickname}</p>
                    <p><strong>티켓 ID:</strong> ${referenceId || 'N/A'}</p>
                    <hr />
                    <h3>내용</h3>
                    <p style="white-space: pre-wrap;">${description}</p>
                    <hr />
                    <p style="font-size: 12px; color: #888;">AI WAR Support Center Auto-Notification</p>
                </div>
            `
        };

        // Send Email
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to juuuno1116@gmail.com`);

        return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
    } catch (error) {
        console.error('Failed to send email:', error);
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
}
