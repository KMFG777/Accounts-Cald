# Accounts-Cald

Markdown
# 🤖 Discord Social Media & Notification Bot | بوت ديسكورد للتنبيهات وحسابات التواصل

[English](#english) | [العربية](#arabic)

---

<a name="arabic"></a>
## 🇦🇪 العربية

بوت ديسكورد متكامل لعرض وسائل التواصل الاجتماعي وتلقي الإشعارات التلقائية عند نشر أي فيديو أو محتوى جديد على مختلف المنصات مثل YouTube, TikTok, Instagram, Kick, Twitch, X, Snapchat, و Threads.

### 🌟 المميزات
- **أمر Slash جاهز (`/setaccounts`):** يعرض جميع روابط منصاتك الاجتماعي في بطاقة (Embed) منسقة وأنيقة.
- **تنبيهات يوتيوب تلقائية:** فحص تلقائي لقناة اليوتيوب عبر RSS وإرسال إشعار فور نزول أي فيديو جديد.
- **سيرفر Webhook للمنصات الأخرى:** إمكانية ربط منصات (TikTok, Instagram, Kick, X, etc.) عبر سيرفر Express مدمج لإرسال إشعارات فورية مع منشن `@everyone`.
- **جاهز للاستضافة:** يدعم التشغيل على منصات الاستضافة المجانية مثل Render أو Discloud.

---

### 🛠️ التثبيت والمتطلبات

1. **تأكد من تثبيت Node.js (إصدار 16.x أو أعلى).**
2. **استคลون أو حمل المشروع:**
   ```bash
   git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
   cd your-repo-name
تثبيت المكتبات المطلوب:

Bash
npm install
⚙️ الإعداد والتهيئة
قم بتعديل متغيرات الإعداد داخل ملف index.js أو عبر ملف .env:

TOKEN: توكن البوت الخاص بك من Discord Developer Portal.

CLIENT_ID: معرف التطبيق الخاص بالبوت (Client ID).

NOTIFY_CHANNEL_ID: آيدي الروم المراد إرسال الإشعارات فيه.

YOUTUBE_CHANNEL_ID: معرف قناتك على YouTube (يبدأ بـ UC).

PORT: المنفذ المخصص للـ Webhook (الافتراضي: 3000).

🚀 تشغيل البوت
لتشغيل البوت محلياً:

Bash
npm start
📡 صيغة إرسال الـ Webhook (للمنصات الأخرى)
عند إرسال طلب POST إلى http://YOUR_SERVER_IP:3000/webhook/notify اجعل جسم الطلب (JSON Body) كالتالي:

JSON
{
  "platform": "TikTok",
  "title": "عنوان الفيديو هنا",
  "url": "[https://www.tiktok.com/@ca_cald/video/123456789](https://www.tiktok.com/@ca_cald/video/123456789)"
}
🇬🇧 English
A comprehensive Discord bot designed to showcase social media links and send automated notifications whenever new content or videos are published across platforms like YouTube, TikTok, Instagram, Kick, Twitch, X, Snapchat, and Threads.

🌟 Features
Slash Command (/setaccounts): Displays a beautifully formatted Discord Embed with all your social media links.

Automated YouTube Alerts: Automatically checks your YouTube channel via RSS and posts notifications for new videos.

Express Webhook Server: An integrated Webhook receiver to handle automated alerts for TikTok, Instagram, Kick, X, etc., mentioning @everyone.

Deployment Ready: Easily deployable to free hosting platforms like Render, Railway, or Discloud.

🛠️ Installation & Requirements
Ensure Node.js (v16.x or higher) is installed.

Clone the repository:

Bash
git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
cd your-repo-name
Install dependencies:

Bash
npm install
⚙️ Configuration
Configure the required variables inside index.js or through environment variables (.env):

TOKEN: Your bot token from the Discord Developer Portal.

CLIENT_ID: Your bot application ID.

NOTIFY_CHANNEL_ID: The Discord channel ID where notifications will be posted.

YOUTUBE_CHANNEL_ID: Your YouTube Channel ID (starts with UC).

PORT: Port for the Webhook server (Default: 3000).

🚀 Running the Bot
To start the bot locally:

Bash
npm start
📡 Webhook Payload Format
Send a POST request to http://YOUR_SERVER_IP:3000/webhook/notify with the following JSON structure:

JSON
{
  "platform": "TikTok",
  "title": "Video Title Here",
  "url": "[https://www.tiktok.com/@ca_cald/video/123456789](https://www.tiktok.com/@ca_cald/video/123456789)"
}
