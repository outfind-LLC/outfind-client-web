/**
 * Vacancy Wizard dictionary + option data — transcribed verbatim from the
 * _Peoplor_Design prototype (`vacancy-wizard.js`). The wizard is a large,
 * self-contained sub-app; rather than balloon the global catalogue with ~180
 * keys, its strings live here as `[en, ru, uz]` triples and resolve off the
 * shared `useI18n().locale` (still fully localized + build-checked, just
 * feature-scoped). Wording matches the prototype exactly across en / ru / uz.
 */
import { type Locale } from "@/lib/i18n";
import { countryTriples } from "@/lib/countries";

/** `[en, ru, uz]` triples. */
const D: Record<string, [string, string, string]> = {
  // header
  "h.title": ["Create vacancy", "Создание вакансии", "Vakansiya yaratish"],
  "h.draft": ["Save draft", "Сохранить черновик", "Qoralamani saqlash"],
  "nav.h": ["Steps", "Шаги", "Bosqichlar"],
  "btn.next": ["Continue", "Далее", "Davom etish"],
  "btn.back": ["Back", "Назад", "Orqaga"],
  "btn.publish": [
    "Publish vacancy",
    "Опубликовать вакансию",
    "Vakansiyani e’lon qilish",
  ],
  "btn.preview": ["Preview", "Предпросмотр", "Ko‘rib chiqish"],
  "jt.regular": ["Regular job", "Постоянная работа", "Doimiy ish"],
  "jt.daily": ["Daily job", "Подработка", "Kunlik ish"],
  "dstep.1": ["Shift details", "Детали смены", "Smena tafsilotlari"],
  "dstep.1m": [
    "Title, place, date",
    "Название, место, дата",
    "Nomi, joyi, sana",
  ],
  "dstep.2": ["Payment", "Оплата", "To‘lov"],
  "dstep.2m": ["Rate & currency", "Ставка и валюта", "Stavka va valyuta"],
  "d.sub": [
    "Quick essentials for a one-off or short-term gig.",
    "Только главное для разовой или короткой подработки.",
    "Bir martalik yoki qisqa ish uchun faqat asosiy ma’lumot.",
  ],
  "d.paySub": [
    "How much and how the worker gets paid.",
    "Сколько и как получает работник.",
    "Ishchi qancha va qanday oladi.",
  ],
  "d.titlePh": [
    "e.g. Loader for one shift",
    "Например: Грузчик на смену",
    "Masalan: Bir smena yuk tashuvchi",
  ],
  "d.date": ["Work date", "Дата работы", "Ish sanasi"],
  "d.datePh": ["Select date", "Выберите дату", "Sanani tanlang"],
  "d.hours": ["Hours / shift", "Часы / смена", "Soat / smena"],
  "d.hoursPh": [
    "e.g. 09:00–18:00",
    "Например: 09:00–18:00",
    "Masalan: 09:00–18:00",
  ],
  "s5.tpl": [
    "Job Overview\n\nResponsibilities\n•  \n•  \n\nWhat We’re Looking For\n•  \n•  \n\nBenefits & Perks\n•  \n•  ",
    "О вакансии\n\nОбязанности\n•  \n•  \n\nКого мы ищем\n•  \n•  \n\nПреимущества и бонусы\n•  \n•  ",
    "Vakansiya haqida\n\nVazifalar\n•  \n•  \n\nKimni qidiryapmiz\n•  \n•  \n\nImtiyoz va bonuslar\n•  \n•  ",
  ],
  "foot.step": ["Step {n} of {t}", "Шаг {n} из {t}", "{n}-bosqich / {t}"],

  // step names + meta
  "step.1": ["Basic information", "Основная информация", "Asosiy ma’lumot"],
  "step.1m": [
    "Title, location, format",
    "Название, место, формат",
    "Nomi, joyi, format",
  ],
  "step.2": ["Requirements", "Требования", "Talablar"],
  "step.2m": ["Skills, languages", "Навыки, языки", "Ko‘nikma, tillar"],
  "step.3": ["Conditions & pay", "Условия и оплата", "Shartlar va to‘lov"],
  "step.3m": ["Schedule, salary", "График, оплата", "Grafik, maosh"],
  "step.5": ["Additional", "Дополнительно", "Qo‘shimcha"],
  "step.5m": [
    "Description, contacts",
    "Описание, контакты",
    "Tavsif, kontaktlar",
  ],
  "step.7": ["Publication", "Публикация", "E’lon qilish"],
  "step.7m": [
    "Review & publish",
    "Проверка и публикация",
    "Tekshirish va e’lon",
  ],

  // step 1
  "s1.card": ["Vacancy title", "Названия вакансии", "Vakansiya nomi"],
  "s1.title": ["Vacancy title", "Название вакансии", "Vakansiya nomi"],
  "s1.titlePh": [
    "e.g. Senior UX/UI Designer",
    "Например: Senior UX/UI Designer",
    "Masalan: Senior UX/UI Designer",
  ],
  "s1.prof": [
    "Profession / Position",
    "Профессия / Должность",
    "Kasb / Lavozim",
  ],
  "s1.profPh": ["Select from list", "Выберите из списка", "Ro‘yxatdan tanlang"],
  "s1.cat": ["Category", "Категория", "Toifa"],
  "s1.catPh": ["Select category", "Выберите категорию", "Toifani tanlang"],
  "s1.place": ["Work location", "Место работы", "Ish joyi"],
  "s1.city": [
    "City / Town",
    "Город / Населенный пункт",
    "Shahar / Aholi punkti",
  ],
  "s1.cityPh": ["Enter city", "Введите город", "Shaharni kiriting"],
  "s1.format": ["Work format", "Формат работы", "Ish formati"],
  "s1.exp": ["Work experience", "Опыт работы", "Ish tajribasi"],
  "s1.team": [
    "Team size",
    "Количество сотрудников в команде",
    "Jamoa hodimlari soni",
  ],
  "opt.onsite": ["On-site", "На месте", "Ish joyida"],
  "opt.remote": ["Remote", "Удаленно", "Masofadan"],
  "opt.rotational": ["Rotational", "Вахта", "Vaxta"],
  "opt.shift": ["Shift", "Смена", "Smena"],
  "opt.project": ["Project work", "Проектная работа", "Loyiha ishi"],
  "exp.none": ["No experience", "Без опыта", "Tajribasiz"],
  "exp.1": ["1–3 years", "1–3 года", "1–3 yil"],
  "exp.3": ["3–6 years", "3–6 лет", "3–6 yil"],
  "exp.6": ["6+ years", "6+ лет", "6+ yil"],

  // step 2
  "s2.skills": [
    "Required skills",
    "Обязательные навыки",
    "Majburiy ko‘nikmalar",
  ],
  "s2.skillsPh": [
    "Add a key skill and press Enter",
    "Укажите ключевой навык и нажмите Enter",
    "Asosiy ko‘nikma kiriting va Enter bosing",
  ],
  "s2.addSkill": ["Add skill", "Добавить навык", "Ko‘nikma qo‘shish"],
  "s2.edu": ["Education", "Образование", "Ta’lim"],
  "s2.eduPh": [
    "Select minimum education level",
    "Выберите минимальный уровень образования",
    "Minimal ta’lim darajasini tanlang",
  ],
  "s2.langs": ["Languages", "Языки", "Tillar"],
  "s2.langPh": ["Select language", "Выберите язык", "Tilni tanlang"],
  "s2.levelPh": ["Select level", "Выберите уровень", "Darajani tanlang"],
  "s2.addLang": ["Add language", "Добавить язык", "Til qo‘shish"],
  "edu.none": ["Not required", "Не требуется", "Talab etilmaydi"],
  "edu.secondary": ["Secondary", "Среднее", "O‘rta"],
  "edu.vocational": ["Vocational", "Среднее специальное", "O‘rta maxsus"],
  "edu.incomplete": [
    "Incomplete higher",
    "Неоконченное высшее",
    "Tugallanmagan oliy",
  ],
  "edu.higher": ["Higher", "Высшее", "Oliy"],
  "lvl.native": ["Native", "Родной", "Ona tili"],

  // step 3
  "s3.cond": ["Working conditions", "Условия работы", "Ish sharoitlari"],
  "s3.empType": ["Employment type", "Тип занятости", "Bandlik turi"],
  "s3.empTypePh": [
    "Select employment type",
    "Выберите тип занятости",
    "Bandlik turini tanlang",
  ],
  "s3.schedule": ["Work schedule", "График работы", "Ish grafigi"],
  "s3.schedulePh": ["Select schedule", "Выберите график", "Grafikni tanlang"],
  "s3.probation": ["Probation period", "Испытательный срок", "Sinov muddati"],
  "s3.probationPh": ["Select period", "Выберите срок", "Muddatni tanlang"],
  "s3.pay": ["Payment", "Оплата", "To‘lov"],
  "s3.payType": ["Payment type", "Тип оплаты", "To‘lov turi"],
  "pt.fixed": ["Fixed", "Фиксированная", "Belgilangan"],
  "pt.hourly": ["Hourly", "Почасовая", "Soatbay"],
  "pt.piece": ["Piecework", "Сдельная", "Ishbay"],
  "pt.other": ["Other", "Другое", "Boshqa"],
  "s3.salFrom": ["Salary from", "Зарплата от", "Maosh dan"],
  "s3.salTo": ["up to", "до", "gacha"],
  "s3.freq": ["Payment frequency", "Периодичность выплат", "To‘lov chastotasi"],
  "s3.freqPh": [
    "Select frequency",
    "Выберите периодичность",
    "Chastotani tanlang",
  ],
  "s3.currency": ["Payment currency", "Валюта оплаты", "To‘lov valyutasi"],
  "s3.currencyPh": ["Select currency", "Выберите валюту", "Valyutani tanlang"],
  "s3.payInfoT": [
    "Specify payment terms",
    "Укажите условия оплаты",
    "To‘lov shartlarini ko‘rsating",
  ],
  "s3.payInfoD": [
    "Transparent pay terms help attract the right candidates and build trust from the start.",
    "Прозрачные условия оплаты помогают привлекать подходящих кандидатов и строить доверие с самого начала.",
    "Shaffof to‘lov shartlari mos nomzodlarni jalb qiladi va boshidan ishonch quradi.",
  ],
  "s3.payNote": [
    "Additional payment terms",
    "Дополнительные условия оплаты",
    "Qo‘shimcha to‘lov shartlari",
  ],
  "s3.opt": ["(optional)", "(необязательно)", "(ixtiyoriy)"],
  "s3.payNotePh": [
    "Describe additional payment terms",
    "Опишите дополнительные условия оплаты",
    "Qo‘shimcha to‘lov shartlarini yozing",
  ],
  "freq.month": ["Once a month", "Раз в месяц", "Oyiga bir marta"],
  "freq.twice": ["Twice a month", "Два раза в месяц", "Oyiga ikki marta"],
  "freq.week": ["Weekly", "Еженедельно", "Haftalik"],
  "freq.piece": ["Per task", "Сдельно", "Ishbay"],

  // step 5
  "s5.title": [
    "Additional information",
    "Дополнительная информация",
    "Qo‘shimcha ma’lumot",
  ],
  "s5.incl": ["What's included", "Что включено", "Nima kiritilgan"],
  "s5.inclSub": [
    "Extras you provide to the worker — useful for relocation and shift work.",
    "Что вы предоставляете работнику — особенно важно при переезде и вахте.",
    "Ishchiga beriladigan qo‘shimchalar — ko‘chish va vaxta uchun muhim.",
  ],
  "incl.housing": ["Accommodation", "Жильё", "Turar joy"],
  "incl.meals": ["Meals", "Питание", "Ovqat"],
  "incl.docs": ["Document help", "Помощь с документами", "Hujjatlarga yordam"],
  "incl.transport": ["Transport", "Транспорт", "Transport"],
  "incl.workwear": ["Workwear", "Спецодежда", "Maxsus kiyim"],
  "incl.advance": ["Advance pay", "Аванс", "Avans"],
  "incl.training": ["Training", "Обучение", "O‘qitish"],
  "incl.registration": [
    "Registration help",
    "Помощь с пропиской",
    "Ro‘yxatga olishda yordam",
  ],
  "s5.sub": [
    "Description, visibility and contact channels",
    "Описание, видимость и каналы связи",
    "Tavsif, ko‘rinish va aloqa kanallari",
  ],
  "s5.desc": ["Vacancy description", "Описание вакансии", "Vakansiya tavsifi"],
  "s5.descPh": [
    "Describe the role, responsibilities and your company…",
    "Опишите роль, обязанности и вашу компанию…",
    "Rol, vazifalar va kompaniyangizni yozing…",
  ],
  "s5.ai.h": [
    "AI will help write the description",
    "Нейросеть поможет составить описание",
    "Sun’iy intellekt tavsif yozishga yordam beradi",
  ],
  "s5.ai.p": [
    "Describe in your own words what your company does and what the candidate will do.",
    "Опишите своими словами, чем занимается ваша компания и за что предстоит отвечать кандидату.",
    "O‘z so‘zlaringiz bilan kompaniyangiz nima qilishini va nomzod nima uchun javob berishini yozing.",
  ],
  "s5.ai.btn": ["Generate", "Сгенерировать", "Yaratish"],
  "s5.ai.busy": ["Generating…", "Генерируем…", "Yaratilmoqda…"],
  "s5.vis": [
    "Vacancy visibility",
    "Видимость вакансии",
    "Vakansiya ko‘rinishi",
  ],
  "vis.public": ["Public", "Публичная", "Ommaviy"],
  "vis.link": ["By link", "По ссылке", "Havola orqali"],
  "s5.wf": ["Work arrangement", "Рабочий формат", "Ish formati"],
  "wf.office": ["Office", "Офис", "Ofis"],
  "wf.hybrid": ["Hybrid", "Гибридный", "Gibrid"],
  "wf.remote": ["Remote", "Удалённый", "Masofaviy"],
  "s5.resp": ["Responses", "Отклики", "Murojaatlar"],
  "s5.respLabel": [
    "Receive responses and notifications",
    "Получать отклики и уведомления",
    "Murojaat va bildirishnomalarni olish",
  ],
  "s5.respDesc": [
    "We'll email you when a candidate applies",
    "Сообщим на email, когда кандидат откликнется",
    "Nomzod murojaat qilganda emailga xabar beramiz",
  ],
  "s5.site": ["Company website", "Сайт компании", "Kompaniya sayti"],
  "s5.country": ["Country", "Страна", "Davlat"],
  "s5.countryPh": ["Select country", "Выберите страну", "Davlatni tanlang"],
  "s5.address": ["Address", "Адрес", "Manzil"],
  "s5.addressPh": [
    "Street, building, office",
    "Улица, дом, офис",
    "Ko‘cha, uy, ofis",
  ],

  // preview
  "s6.badge": [
    "Vacancy preview",
    "Предпросмотр вакансии",
    "Vakansiya ko‘rinishi",
  ],
  "pv.cardView": [
    "How it appears in search",
    "Карточка в поиске",
    "Qidiruvdagi karta",
  ],
  "pv.detailView": [
    "Full vacancy view",
    "Детальный просмотр",
    "To‘liq ko‘rinish",
  ],
  "s6.gateT": [
    "Preview not available yet",
    "Предпросмотр пока недоступен",
    "Ko‘rib chiqish hozircha mavjud emas",
  ],
  "s6.gateD": [
    "Fill in the required fields in “Basic information” to see how your vacancy will look.",
    "Заполните обязательные поля в разделе «Основная информация», чтобы увидеть, как будет выглядеть вакансия.",
    "Vakansiya qanday ko‘rinishini ko‘rish uchun «Asosiy ma’lumot» bo‘limidagi majburiy maydonlarni to‘ldiring.",
  ],
  "s6.gateBtn": [
    "Go to Basic information",
    "Перейти к основной информации",
    "Asosiy ma’lumotga o‘tish",
  ],
  "s6.about": ["About the role", "О вакансии", "Vakansiya haqida"],
  "s6.reqs": ["Requirements", "Требования", "Talablar"],
  "s6.conditions": [
    "Conditions & pay",
    "Условия и оплата",
    "Shartlar va to‘lov",
  ],
  "s6.byAgreement": ["By agreement", "По договорённости", "Kelishuv asosida"],
  "s6.field.type": ["Employment", "Тип занятости", "Bandlik turi"],
  "s6.field.schedule": ["Schedule", "График работы", "Grafik"],
  "s6.field.place": ["Location", "Место работы", "Ish joyi"],
  "s6.notSet": ["Not set", "Не указано", "Ko‘rsatilmagan"],

  // step 7
  "s7.title": [
    "Publish your vacancy",
    "Публикация вакансии",
    "Vakansiyani e’lon qilish",
  ],
  "s7.sub": [
    "Review the summary and publish — placement is free.",
    "Проверьте сводку и опубликуйте — размещение бесплатное.",
    "Xulosani tekshiring va e’lon qiling — joylashtirish bepul.",
  ],
  "s7.note1": [
    "Your vacancy goes live in the candidate search right away.",
    "Вакансия сразу появляется в поиске кандидатов.",
    "Vakansiya darhol nomzodlar qidiruvida paydo bo‘ladi.",
  ],
  "s7.note2": [
    "Peoplor automatically matches suitable candidates to you.",
    "Peoplor автоматически подбирает подходящих кандидатов.",
    "Peoplor mos nomzodlarni avtomatik tanlaydi.",
  ],
  "s7.note3": [
    "You can edit, pause or close it any time from Vacancies.",
    "Вы можете изменить, приостановить или закрыть её в разделе «Вакансии».",
    "Uni istalgan vaqtda «Vakansiyalar» bo‘limida tahrirlashingiz mumkin.",
  ],
  "s7.agree": [
    "I agree to the vacancy placement rules",
    "Я согласен с правилами размещения вакансий",
    "Vakansiya joylashtirish qoidalariga roziman",
  ],
  "s7.successT": [
    "Vacancy published",
    "Вакансия опубликована",
    "Vakansiya e’lon qilindi",
  ],
  "s7.successP": [
    "Peoplor is now matching candidates to your role. You can edit or pause it any time from Vacancies.",
    "Peoplor уже подбирает кандидатов на вашу вакансию. Вы можете изменить или приостановить её в разделе «Вакансии».",
    "Peoplor allaqachon nomzod tanlamoqda. Uni «Vakansiyalar» bo‘limida tahrirlashingiz mumkin.",
  ],
  "s7.successBtn": [
    "View candidates",
    "Смотреть кандидатов",
    "Nomzodlarni ko‘rish",
  ],

  // toasts
  "toast.saved": ["Draft saved", "Черновик сохранён", "Qoralama saqlandi"],
  "toast.aiDone": [
    "Description generated",
    "Описание сгенерировано",
    "Tavsif yaratildi",
  ],
  "toast.aiError": [
    "Couldn't generate the description — please try again",
    "Не удалось сгенерировать описание — попробуйте ещё раз",
    "Tavsifni yaratib bo‘lmadi — qayta urinib ko‘ring",
  ],
  "toast.aiNeedTitle": [
    "Add a job title first — AI writes the description from it",
    "Сначала укажите название вакансии — ИИ пишет описание на его основе",
    "Avval vakansiya nomini kiriting — AI tavsifni shu asosda yozadi",
  ],
  "toast.published": [
    "Vacancy published",
    "Вакансия опубликована",
    "Vakansiya e’lon qilindi",
  ],
  "toast.publishError": [
    "Couldn't publish the vacancy",
    "Не удалось опубликовать вакансию",
    "Vakansiyani e’lon qilib bo‘lmadi",
  ],
  "toast.dateRequired": [
    "Pick the work date first",
    "Сначала выберите дату работы",
    "Avval ish sanasini tanlang",
  ],
  "dd.search": ["Search…", "Поиск…", "Qidirish…"],
  "dd.noResults": ["No matches", "Ничего не найдено", "Hech narsa topilmadi"],
};

export type WizardT = (
  key: string,
  params?: Record<string, string | number>,
) => string;

/** Build a translate fn for the given locale (D triples are `[en, ru, uz]`). */
export function makeWizardT(locale: Locale): WizardT {
  const idx = locale === "en" ? 0 : locale === "uz" ? 2 : 1;
  return (key, params) => {
    const entry = D[key];
    let value = entry ? entry[idx] : key;
    if (params) {
      value = value.replace(/\{(\w+)\}/g, (_, name: string) =>
        name in params ? String(params[name]) : `{${name}}`,
      );
    }
    return value;
  };
}

/** Option pairs: `[value, labelKey | "ru|en|uz"]`. */
export type OptPair = [string, string];

export const OPTS: Record<string, OptPair[]> = {
  prof: [
    ["driver", "Водитель|Driver|Haydovchi"],
    ["courier", "Курьер|Courier|Kuryer"],
    ["builder", "Строитель|Builder|Quruvchi"],
    ["waiter", "Официант|Waiter|Ofitsiant"],
    ["cleaner", "Уборщик|Cleaner|Farrosh"],
    ["loader", "Грузчик|Loader|Yuk tashuvchi"],
    ["cook", "Повар|Cook|Oshpaz"],
    ["security", "Охранник|Security guard|Qorovul"],
    ["cashier", "Кассир|Cashier|Kassir"],
    ["warehouse", "Работник склада|Warehouse worker|Ombor xodimi"],
    ["electrician", "Электрик|Electrician|Elektrik"],
    ["worker", "Разнорабочий|General worker|Raznorabochi"],
  ],
  cat: [
    ["construction", "Стройка|Construction|Qurilish"],
    ["logistics", "Логистика и доставка|Logistics & delivery|Logistika"],
    ["horeca", "Кафе и рестораны|Cafe & restaurants|Kafe va restoran"],
    ["retail", "Торговля|Retail|Savdo"],
    ["cleaning", "Клининг|Cleaning|Tozalash"],
    ["production", "Производство|Production|Ishlab chiqarish"],
    ["services", "Услуги|Services|Xizmatlar"],
    ["security", "Охрана|Security|Qo‘riqlash"],
    ["other", "Другое|Other|Boshqa"],
  ],
  edu: [
    ["none", "edu.none"],
    ["secondary", "edu.secondary"],
    ["vocational", "edu.vocational"],
    ["incomplete", "edu.incomplete"],
    ["higher", "edu.higher"],
  ],
  lang: [
    ["ru", "Русский"],
    ["en", "English"],
    ["uz", "O‘zbekcha"],
    ["kk", "Қазақша"],
    ["de", "Deutsch"],
    ["tr", "Türkçe"],
  ],
  level: [
    ["a1", "A1"],
    ["a2", "A2"],
    ["b1", "B1"],
    ["b2", "B2"],
    ["c1", "C1"],
    ["c2", "C2"],
    ["native", "lvl.native"],
  ],
  empType: [
    ["full", "Полная занятость|Full-time|To‘liq bandlik"],
    ["part", "Частичная|Part-time|Qisman"],
    ["project", "Проектная|Project|Loyiha"],
    ["intern", "Стажировка|Internship|Stajirovka"],
    ["temp", "Подработка|Temporary|Qo‘shimcha"],
  ],
  schedule: [
    ["5/2", "5/2"],
    ["2/2", "2/2"],
    ["shift", "Сменный|Shift|Smenali"],
    ["flex", "Гибкий|Flexible|Moslashuvchan"],
    ["remote", "Удалённый|Remote|Masofaviy"],
    ["rotation", "Вахтовый|Rotational|Vaxtali"],
  ],
  probation: [
    ["none", "Нет|None|Yo‘q"],
    ["1m", "1 месяц|1 month|1 oy"],
    ["2m", "2 месяца|2 months|2 oy"],
    ["3m", "3 месяца|3 months|3 oy"],
  ],
  freq: [
    ["month", "freq.month"],
    ["twice", "freq.twice"],
    ["week", "freq.week"],
    ["piece", "freq.piece"],
  ],
  currency: [
    ["uzs", "UZS"],
    ["usd", "USD"],
    ["rub", "RUB"],
    ["eur", "EUR"],
    ["kzt", "KZT"],
  ],
  // The full world list (all ISO countries, priority-pinned) — the value is the
  // English name, which is exactly what the create-vacancy payload stores.
  country: countryTriples().map(
    (c) => [c.en, `${c.ru}|${c.en}|${c.uz}`] as OptPair,
  ),
};

/** Resolve an option label for the locale (`D` key, plain text, or `ru|en|uz`). */
export function optLabel(pair: OptPair, locale: Locale, t: WizardT): string {
  const v = pair[1];
  if (D[v]) return t(v);
  if (v.includes("|")) {
    const p = v.split("|");
    // pipe order is [ru, en, uz]
    return locale === "en" ? p[1] : locale === "uz" ? p[2] : p[0];
  }
  return v;
}

export function findLabel(
  list: OptPair[],
  value: string,
  locale: Locale,
  t: WizardT,
): string {
  const pair = list.find((p) => p[0] === value);
  return pair ? optLabel(pair, locale, t) : "";
}

/** title → [profession, category] autofill. */
const TITLE_MAP: [RegExp, string, string][] = [
  [/водител|driver|haydovchi|шоф[её]р/i, "driver", "logistics"],
  [/курьер|courier|kuryer|достав|delivery|yetkaz/i, "courier", "logistics"],
  [
    /строит|builder|quruvchi|прораб|каменщ|маляр|сварщ|плотник/i,
    "builder",
    "construction",
  ],
  [/официант|waiter|ofitsiant|бариста|barista/i, "waiter", "horeca"],
  [/убор|cleaner|farrosh|клинин|tozala/i, "cleaner", "cleaning"],
  [/грузчик|loader|yuk tash|такелаж/i, "loader", "logistics"],
  [/повар|cook|oshpaz|кондитер|кух/i, "cook", "horeca"],
  [/охран|security|qorovul|сторож/i, "security", "security"],
  [/кассир|cashier|kassir/i, "cashier", "retail"],
  [/склад|warehouse|ombor|комплектов/i, "warehouse", "logistics"],
  [/электрик|electric|elektrik|монтаж/i, "electrician", "construction"],
  [
    /продав|консультант|sotuvchi|sales assistant|мерчендайз/i,
    "cashier",
    "retail",
  ],
  [/разнорабоч|подсоб|general worker|raznorabo/i, "worker", "production"],
];

export function matchTitle(
  title: string,
): { prof: string; cat: string } | null {
  const t = (title || "").trim();
  if (!t) return null;
  for (const [re, prof, cat] of TITLE_MAP) {
    if (re.test(t)) return { prof, cat };
  }
  return null;
}

/** Benefit groups (each entry is a label key). */
export const BEN: Record<"fin" | "health" | "social", string[]> = {
  fin: [
    "b.bonus",
    "b.meals",
    "b.transport",
    "b.mobile",
    "b.mobilePay",
    "b.other",
  ],
  health: ["b.med", "b.sport", "b.psy", "b.aid", "b.rest"],
  social: ["b.training", "b.growth", "b.flex", "b.days", "b.reloc", "b.other"],
};

// benefit labels
Object.assign(D, {
  "s4.fin": ["Financial", "Финансовые", "Moliyaviy"],
  "s4.health": [
    "Health & comfort",
    "Здоровье и комфорт",
    "Salomatlik va qulaylik",
  ],
  "s4.social": ["Social", "Социальные", "Ijtimoiy"],
  "s4.extra": ["Additional", "Дополнительные", "Qo‘shimcha"],
  "s4.extraPh": [
    "Describe other benefits",
    "Опишите другие преимущества",
    "Boshqa imtiyozlarni yozing",
  ],
  "s4.title": ["What you offer", "Что вы предлагаете", "Nimani taklif qilasiz"],
  "b.bonus": ["Bonuses & rewards", "Бонусы и премии", "Bonus va mukofotlar"],
  "b.meals": ["Meals covered", "Оплата питания", "Ovqat to‘lovi"],
  "b.transport": ["Transport allowance", "Компенсация проезда", "Yo‘l haqi"],
  "b.mobile": ["Mobile connection", "Мобильная связь", "Mobil aloqa"],
  "b.mobilePay": [
    "Mobile bill covered",
    "Оплата мобильной связи",
    "Mobil aloqa to‘lovi",
  ],
  "b.med": ["Medical insurance", "Медицинская страховка", "Tibbiy sug‘urta"],
  "b.sport": ["Sport & fitness", "Спорт и фитнес", "Sport va fitnes"],
  "b.psy": [
    "Psychological support",
    "Психологическая поддержка",
    "Psixologik yordam",
  ],
  "b.aid": ["Financial aid", "Материальная помощь", "Moddiy yordam"],
  "b.rest": ["Paid rest", "Оплата отдыха", "Dam olish to‘lovi"],
  "b.training": [
    "Corporate training",
    "Корпоративное обучение",
    "Korporativ o‘qitish",
  ],
  "b.growth": ["Career growth", "Карьерный рост", "Karyera o‘sishi"],
  "b.flex": ["Flexible schedule", "Гибкий график", "Moslashuvchan grafik"],
  "b.days": [
    "Extra days off",
    "Дополнительные выходные",
    "Qo‘shimcha dam olish kunlari",
  ],
  "b.reloc": ["Relocation support", "Поддержка релокации", "Ko‘chish yordami"],
  "b.other": ["Other", "Другое", "Boshqa"],
} satisfies Record<string, [string, string, string]>);
