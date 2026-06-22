/**
 * Help center / FAQ content — ported verbatim from the _Peoplor_Design prototype
 * (Peoplor Landing.html FAQ_I18N). Localised EN / RU / UZ.
 */

import type { Lang } from "./landing-copy";

export interface FaqItem {
  q: string;
  a: string;
}

export const FAQ_DATA: Record<Lang, FaqItem[]> = {
  en: [
    {
      q: "Is Peoplor really free for job seekers?",
      a: "Yes. Searching, building your CV, and applying through the assistant are free for job seekers, with no limits and no credit card. Employers pay for posting and hiring tools.",
    },
    {
      q: "How does the assistant apply to jobs for me?",
      a: "You review each match and approve it. Peoplor tailors your CV to the role, fills in the application, and submits it on your behalf — you stay in control of every send.",
    },
    {
      q: "Where do the candidate matches come from?",
      a: "Peoplor ranks candidates by how well their experience fits the role you described — not just keyword overlap. Every profile is verified before it reaches your shortlist.",
    },
    {
      q: "Can I edit what the AI writes?",
      a: "Always. Job posts, CVs, and messages are drafts you can refine in the same chat. Ask for a different tone, more detail, or a quick rewrite and it updates instantly.",
    },
    {
      q: "Is my data private?",
      a: "Your conversations and documents are encrypted and never sold. You decide what's shared with employers, and you can delete your data at any time.",
    },
    {
      q: "Do I need to install anything?",
      a: "No. Peoplor runs in your browser on desktop and mobile. Start a conversation and pick up right where you left off on any device.",
    },
  ],
  ru: [
    {
      q: "Peoplor действительно бесплатен для соискателей?",
      a: "Да. Поиск, составление резюме и отклики через ассистента бесплатны для соискателей, без лимитов и без карты. Работодатели платят за размещение и инструменты найма.",
    },
    {
      q: "Как ассистент откликается на вакансии за меня?",
      a: "Вы просматриваете каждое совпадение и одобряете его. Peoplor подгоняет резюме под вакансию, заполняет отклик и отправляет от вашего имени — вы контролируете каждую отправку.",
    },
    {
      q: "Откуда берутся подходящие кандидаты?",
      a: "Peoplor ранжирует кандидатов по тому, насколько их опыт подходит описанной вакансии, а не просто по совпадению ключевых слов. Каждый профиль проверяется перед попаданием в шортлист.",
    },
    {
      q: "Могу ли я редактировать то, что пишет ИИ?",
      a: "Всегда. Вакансии, резюме и сообщения — это черновики, которые можно доработать прямо в чате. Попросите другой тон, больше деталей или быстрый рерайт — обновится мгновенно.",
    },
    {
      q: "Мои данные в безопасности?",
      a: "Ваши переписки и документы шифруются и никогда не продаются. Вы решаете, чем делиться с работодателями, и можете удалить данные в любой момент.",
    },
    {
      q: "Нужно ли что-то устанавливать?",
      a: "Нет. Peoplor работает в браузере на компьютере и телефоне. Начните разговор и продолжайте с того же места на любом устройстве.",
    },
  ],
  uz: [
    {
      q: "Peoplor ish izlovchilar uchun rostdan ham bepulmi?",
      a: "Ha. Qidiruv, rezyume tuzish va yordamchi orqali ariza yuborish ish izlovchilar uchun bepul, cheklovsiz va kartasiz. Ish beruvchilar e'lon joylash va yollash vositalari uchun to'laydi.",
    },
    {
      q: "Yordamchi men uchun qanday ariza yuboradi?",
      a: "Siz har bir moslikni ko'rib chiqasiz va tasdiqlaysiz. Peoplor rezyumeni ishga moslaydi, arizani to'ldiradi va sizning nomingizdan yuboradi — har bir yuborish sizning nazoratingizda.",
    },
    {
      q: "Mos nomzodlar qayerdan keladi?",
      a: "Peoplor nomzodlarni siz tasvirlagan ishga tajribasi qanchalik mos kelishiga qarab saralaydi, shunchaki kalit so'zlar bo'yicha emas. Har bir profil shortlistga tushishidan oldin tekshiriladi.",
    },
    {
      q: "AI yozgan narsani tahrirlay olamanmi?",
      a: "Doim. Ish e'lonlari, rezyume va xabarlar — bu chatda qayta ishlash mumkin bo'lgan qoralamalar. Boshqa ohang, ko'proq tafsilot yoki tez qayta yozishni so'rang — darhol yangilanadi.",
    },
    {
      q: "Ma'lumotlarim maxfiymi?",
      a: "Suhbatlaringiz va hujjatlaringiz shifrlangan va hech qachon sotilmaydi. Ish beruvchilar bilan nima ulashishni o'zingiz hal qilasiz va istalgan vaqt ma'lumotlaringizni o'chirishingiz mumkin.",
    },
    {
      q: "Biror narsa o'rnatishim kerakmi?",
      a: "Yo'q. Peoplor brauzeringizda, kompyuter va telefonda ishlaydi. Suhbatni boshlang va istalgan qurilmada qoldirgan joyingizdan davom eting.",
    },
  ],
};
