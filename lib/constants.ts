import {
  PLACEHOLDER_AVATAR,
  PLACEHOLDER_BEFORE,
  PLACEHOLDER_AFTER,
  PLACEHOLDER_PORTFOLIO,
  PLACEHOLDER_REVIEW,
  SILENT_AUDIO,
} from './placeholders';

export const TELEGRAM_LINK = 'https://t.me/littlesveta';
export const INSTAGRAM_LINK = 'https://instagram.com/littlesveta';

// ПЛЕЙСХОЛДЕРЫ
export const IMAGES = {
  avatar: PLACEHOLDER_AVATAR,
  before: PLACEHOLDER_BEFORE,
  after: PLACEHOLDER_AFTER,
};
//ОБО МНЕ
export const ABOUT_TEACHER = {
  name: 'Света',
  role: 'Мобилограф и контент-мейкер',
  description: `Привет! Я Света — профессиональный мобилограф с опытом более 5 лет.

Снимаю коммерческий контент для брендов, веду образовательные проекты и помогаю блогерам создавать визуал, который продаёт.

Мой подход — минимум теории, максимум практики. За 4 дня интенсива вы получите навыки, которые сразу сможете применить.

Локация: Крым 🌊`,
  stats: [
    { label: 'Лет опыта', value: '5+' },
    { label: 'Учеников', value: '200+' },
    { label: 'Съёмок для брендов', value: '50+' },
  ],
};

// Старая структура (для совместимости)
export const PROGRAM_DAYS = [
  {
    day: 1,
    title: 'Основы',
    subtitle: 'Фундамент визуала',
    lessons: [
      'Как работает камера телефона',
      'Настройки съёмки для разных условий',
      'Композиция и правила кадра',
      'Свет: естественный vs искусственный',
      'Практика: первые кадры',
    ],
  },
  {
    day: 2,
    title: 'Съёмка',
    subtitle: 'Режиссура и динамика',
    lessons: [
      'Планирование съёмки: раскадровка',
      'Движение камеры: панорамы, проводки',
      'Съёмка людей и предметов',
      'Работа со стабилизацией',
      'Практика: съёмка мини-ролика',
    ],
  },
  {
    day: 3,
    title: 'Монтаж',
    subtitle: 'Сборка и ритм',
    lessons: [
      'Основы монтажа в мобильных приложениях',
      'Ритм и темп: как удержать внимание',
      'Переходы и эффекты: когда и как',
      'Работа со звуком и музыкой',
      'Практика: монтаж своего ролика',
    ],
  },
  {
    day: 4,
    title: 'Цвет и стиль',
    subtitle: 'Финальный штрих',
    lessons: [
      'Основы цветокоррекции',
      'Создание своего стиля обработки',
      'Пресеты и LUT-ы: использование и создание',
      'Экспорт для разных платформ',
      'Финальная практика: полный цикл создания контента',
    ],
  },
];

// Новая структура - 3 недели с сеткой контента
export type ProgramMediaType = 'image' | 'video';

export type ProgramWeekItem = {
  id: string;
  type: ProgramMediaType;
  src: string;
  poster?: string;
};

export type ProgramWeek = {
  week: number;
  icon: string;
  items: ProgramWeekItem[];
};

// ПРОГРАММА КУРСА
// пример видео: { id: 'w1-5', type: 'video', src: '/images/program/me.mp4', poster: '/images/program/mee.jpg', },
export const PROGRAM_WEEKS: ProgramWeek[] = [
  {
    week: 1,
    icon: '/images/icons/week1w.png',
    items: [
      { id: 'w1-1', type: 'image', src: '/images/program/1-1.jpg' },
      { id: 'w1-2', type: 'image', src: '/images/program/1-2.jpg' },
      { id: 'w1-3', type: 'image', src: '/images/program/1-3.jpg',},
      { id: 'w1-4', type: 'image', src: '/images/program/1-6.png' },
      { id: 'w1-5', type: 'image', src: '/images/program/1-9.jpg' },
      { id: 'w1-6', type: 'image', src: '/images/program/1-4.jpg' },
    ],
  },
  {
    week: 2,
    icon: '/images/icons/week2w.png',
    items: [
      { id: 'w2-1', type: 'image', src: '/images/program/2-1.jpg' },
      { id: 'w2-2', type: 'image', src: '/images/program/2-2.jpg' },
      { id: 'w2-3', type: 'image', src: '/images/program/2-3.jpg' },
      { id: 'w2-4', type: 'image', src: '/images/program/2-4.jpg' },
      { id: 'w2-5', type: 'image', src: '/images/program/1-9.jpg' },
      { id: 'w2-6', type: 'image', src: '/images/program/2-5.jpg' },
    ],
  },
  {
    week: 3,
    icon: '/images/icons/week3w.png',
    items: [
      { id: 'w3-1', type: 'image', src: '/images/program/3-1.jpg' },
      { id: 'w3-2', type: 'image', src: '/images/program/3-2.jpg' },
      { id: 'w3-3', type: 'image', src: '/images/program/3-3.jpg' },
      { id: 'w3-4', type: 'image', src: '/images/program/3-4.jpg' },
      { id: 'w3-5', type: 'image', src: '/images/program/3-5.jpg' },
      { id: 'w3-6', type: 'image', src: '/images/program/3-6.jpg' },
    ],
  },
];

export const QUIZ_QUESTIONS = {
  step1: {
    title: 'Для чего мне это нужно?',
    subtitle: 'Выберите один вариант',
    options: [
      { id: 'personal', label: 'Хочу снимать красиво для себя' },
      { id: 'blog', label: 'Хочу улучшить качество своего блога' },
      { id: 'sell', label: 'Хочу продавать услуги съёмок' },
      { id: 'skill', label: 'Хочу улучшить свою компетенцию' },
      { id: 'other', label: 'Другое', hasInput: true },
    ],
  },
  step2: {
    title: 'Какой результат я хочу?',
    subtitle: 'Можно выбрать несколько',
    options: [
      { id: 'visual', label: 'Реальный визуальный "до/после"' },
      { id: 'confidence', label: 'Уверенность в съёмке и монтаже' },
      { id: 'brands', label: 'Контент, с которым не стыдно идти к брендам' },
      { id: 'orders', label: 'Готовность брать заказы сразу после курса' },
      { id: 'income', label: 'Рост среднего чека' },
    ],
  },
  step3: {
    title: 'Курс проходит оффлайн в Крыму',
    subtitle: 'Выберите подходящий вариант',
    options: [
      { id: 'ready', label: 'Да, я из Крыма!' },
      { id: 'come', label: 'Я готова приехать!' },
      { id: 'online', label: 'А когда будет онлайн курс?' },
    ],
  },
};

export const PORTFOLIO_ITEMS = [
  {
    id: 'brand1',
    title: 'Съёмка для бренда косметики',
    thumbnail: PLACEHOLDER_PORTFOLIO(0),
    items: [
      { type: 'image', src: PLACEHOLDER_PORTFOLIO(0) },
      { type: 'image', src: PLACEHOLDER_PORTFOLIO(1) },
      { type: 'image', src: PLACEHOLDER_PORTFOLIO(2) },
    ],
  },
  {
    id: 'brand2',
    title: 'Контент для ресторана',
    thumbnail: PLACEHOLDER_PORTFOLIO(1),
    items: [
      { type: 'image', src: PLACEHOLDER_PORTFOLIO(1) },
      { type: 'image', src: PLACEHOLDER_PORTFOLIO(2) },
    ],
  },
  {
    id: 'brand3',
    title: 'Lifestyle съёмка',
    thumbnail: PLACEHOLDER_PORTFOLIO(2),
    items: [
      { type: 'image', src: PLACEHOLDER_PORTFOLIO(2) },
      { type: 'image', src: PLACEHOLDER_PORTFOLIO(0) },
      { type: 'image', src: PLACEHOLDER_PORTFOLIO(1) },
    ],
  },
];

export type PortfolioHighlightItem = {
  id: string;
  type: 'image' | 'video';
  src: string;
  posterSrc?: string;
};

export type PortfolioHighlight = {
  id: string;
  label: string;
  coverSrc: string;
  items: PortfolioHighlightItem[];
};

export type PortfolioCategory = {
  id: string;
  title: string;
  highlights: PortfolioHighlight[];
};

const PORTFOLIO_SAMPLE_ITEMS: PortfolioHighlightItem[] = [
  { id: 's1', type: 'image', src: '/images/portfolio/story-1.jpg' },
  { id: 's2', type: 'image', src: '/images/portfolio/story-2.jpg' },
  {
    id: 's3',
    type: 'video',
    src: '/images/portfolio/story-3.mp4',
    posterSrc: '/images/portfolio/story-3-poster.jpg',
  },
];

const makeHighlight = (id: string, label: string, coverSrc: string): PortfolioHighlight => ({
  id,
  label,
  coverSrc,
  items: PORTFOLIO_SAMPLE_ITEMS,
});

// ПОРТФОЛИО
export const PORTFOLIO_CATEGORIES: PortfolioCategory[] = [
  {
    id: 'weddings',
    title: 'Свадьбы',
    highlights: [
      makeHighlight('w-1', '25.08.25', '/images/portfolio/cover-1.jpg'),
      makeHighlight('w-2', '31.09.25', '/images/portfolio/cover-2.jpg'),
      makeHighlight('w-3', '17.06.24', '/images/portfolio/cover-3.jpg'),
      makeHighlight('w-4', '05.05.23', '/images/portfolio/cover-4.jpg'),
      makeHighlight('w-5', '21.03.23', '/images/portfolio/cover-5.jpg'),
    ],
  },
  {
    id: 'studio',
    title: 'Студийные съёмки',
    highlights: [
      makeHighlight('s-1', 'Furs Queen', '/images/portfolio/cover-1.jpg'),
      makeHighlight('s-2', 'Aura Wear', '/images/portfolio/cover-2.jpg'),
      makeHighlight('s-3', 'Nana showroom', '/images/portfolio/cover-3.jpg'),
      makeHighlight('s-4', 'Sloy', '/images/portfolio/cover-4.jpg'),
      makeHighlight('s-5', 'Humanation', '/images/portfolio/cover-5.jpg'),
    ],
  },
  {
    id: 'outdoor',
    title: 'Outdoor съёмки',
    highlights: [
      makeHighlight('o-1', 'Glame Jewelery', '/images/portfolio/cover-1.jpg'),
      makeHighlight('o-2', 'Luxary Clothing', '/images/portfolio/cover-2.jpg'),
      makeHighlight('o-3', 'Pallasa', '/images/portfolio/cover-3.jpg'),
      makeHighlight('o-4', 'Save SMM', '/images/portfolio/cover-4.jpg'),
      makeHighlight('o-5', 'Maslow Group', '/images/portfolio/cover-5.jpg'),
    ],
  },
];

export const VOICE_REVIEWS = [
  {
    id: 'review1',
    name: 'Анна',
    duration: 45,
    src: SILENT_AUDIO,
  },
  {
    id: 'review2',
    name: 'Мария',
    duration: 38,
    src: SILENT_AUDIO,
  },
  {
    id: 'review3',
    name: 'Екатерина',
    duration: 52,
    src: SILENT_AUDIO,
  },
];

export const TEXT_REVIEWS = [
  {
    id: 'text1',
    src: PLACEHOLDER_REVIEW(0),
  },
  {
    id: 'text2',
    src: PLACEHOLDER_REVIEW(1),
  },
  {
    id: 'text3',
    src: PLACEHOLDER_REVIEW(2),
  },
];

export type ReviewsFilter = 'voice' | 'text' | 'video';

export type VoiceReviewItem = {
  id: string;
  username: string;
  avatarSrc: string;
  audioSrc: string;
  duration: number;
  isNew: boolean;
};

export type TextReviewItem = {
  id: string;
  username: string;
  avatarSrc: string;
  preview: string;
  text: string;
  isNew: boolean;
};

export type VideoReviewItem = {
  id: string;
  username: string;
  avatarSrc: string;
  videoSrc: string;
  posterSrc?: string;
  isNew: boolean;
};
// ОТЗЫВЫ ГОЛОС
export const VOICE_REVIEW_ITEMS: VoiceReviewItem[] = [
  { id: 'v1', username: 'Olesya.Ivanchenko', avatarSrc: '/images/reviews/ava-1.jpg', audioSrc: SILENT_AUDIO, duration: 4, isNew: true },
  { id: 'v2', username: 'shish_rekava', avatarSrc: '/images/reviews/ava-2.jpg', audioSrc: SILENT_AUDIO, duration: 12, isNew: false },
  { id: 'v3', username: 'diana_gros6', avatarSrc: '/images/reviews/ava-3.jpg', audioSrc: SILENT_AUDIO, duration: 9, isNew: false },
  { id: 'v4', username: 'lebedeva.anna', avatarSrc: '/images/reviews/ava-4.jpg', audioSrc: SILENT_AUDIO, duration: 16, isNew: false },
  { id: 'v5', username: 'kurzdaq', avatarSrc: '/images/reviews/ava-5.jpg', audioSrc: SILENT_AUDIO, duration: 22, isNew: false },
  { id: 'v6', username: 'Andrey_andrey', avatarSrc: '/images/reviews/ava-6.jpg', audioSrc: SILENT_AUDIO, duration: 18, isNew: false },
];
// ОТЗЫВЫ ТЕКСТ
export const TEXT_REVIEW_ITEMS: TextReviewItem[] = [
  {
    id: 't1',
    username: 'Rihana_artemova',
    avatarSrc: '/images/reviews/ava-1.jpg',
    preview: 'Света, это лучший курс, который я проходила — всё по делу!',
    text: 'Света, это лучший курс, который я проходила — всё по делу! Уже на второй день я сняла ролик, который реально выглядит как «до/после». Спасибо за структуру, практику и поддержку.',
    isNew: true,
  },
  {
    id: 't2',
    username: 'Quinn_castle',
    avatarSrc: '/images/reviews/ava-3.jpg',
    preview: 'Я наконец-то понял свет и кадр. Результат — огонь.',
    text: 'Я наконец-то понял свет и кадр. Результат — огонь. Больше всего зашли задания и разборы: сразу видишь, что исправить и куда расти. Рекомендую всем, кто снимает на телефон.',
    isNew: false,
  },
  {
    id: 't3',
    username: 'Musaeva.Anji',
    avatarSrc: '/images/reviews/ava-6.jpg',
    preview: 'С монтажом стало сильно проще — появились приёмы и ритм.',
    text: 'С монтажом стало сильно проще — появились приёмы и ритм. Теперь понимаю, как держать внимание и делать переходы уместно. Отдельный кайф — что всё можно повторить сразу.',
    isNew: false,
  },
];
// ОТЗЫВЫ ВИДЕО
export const VIDEO_REVIEW_ITEMS: VideoReviewItem[] = [
  {
    id: 'vv1',
    username: 'Anna.Pavlova',
    avatarSrc: '/images/reviews/ava-5.jpg',
    videoSrc: '/images/reviews/video-1.mp4',
    posterSrc: '/images/reviews/video-1-poster.jpg',
    isNew: false,
  },
  {
    id: 'vv2',
    username: 'Inga.Inga',
    avatarSrc: '/images/reviews/ava-4.jpg',
    videoSrc: '/images/reviews/video-2.mp4',
    posterSrc: '/images/reviews/video-2-poster.jpg',
    isNew: false,
  },
];
// FAQ
export const FAQ_ITEMS = [
  {
    question: 'Нужен ли мне профессиональный телефон?',
    answer: 'Нет! Подойдёт любой современный смартфон. На курсе мы учимся работать с тем, что есть. Главное — это навыки, а не техника.',
  },
  {
    question: 'Я совсем новичок, мне подойдёт?',
    answer: 'Курс создан именно для начинающих. Мы начинаем с основ и постепенно усложняем материал. К концу курса вы будете уверенно снимать и монтировать.',
  },
  {
    question: 'Сколько стоит курс?',
    answer: 'Актуальную стоимость и информацию о скидках можно узнать, написав мне в Telegram. Там же можно забронировать место.',
  },
  {
    question: 'Где проходит курс?',
    answer: 'Курс проходит оффлайн в Крыму. Точную локацию и даты ближайшего потока можно узнать в личных сообщениях.',
  },
  {
    question: 'Будет ли онлайн версия?',
    answer: 'Онлайн курс сейчас в разработке. Подписывайтесь на мои соцсети, чтобы не пропустить анонс!',
  },
  {
    question: 'Что входит в стоимость?',
    answer: '4 дня интенсивного обучения, все материалы курса, пресеты для обработки, доступ в закрытый чат выпускников и поддержка после курса.',
  },
];
// НАВИГАЦИЯ
export const NAV_ITEMS = [
  { id: 'hero', label: 'Главная', icon: 'home' },
  { id: 'program', label: 'Программа', icon: 'book' },
  { id: 'quiz', label: 'Тест', icon: 'clipboard' },
  { id: 'portfolio', label: 'Портфолио', icon: 'camera' },
  { id: 'reviews', label: 'Отзывы', icon: 'star' },
  { id: 'faq', label: 'FAQ', icon: 'help' },
];

// ТИНДЕР-СТИЛЬ ТЕСТ
export const SWIPE_QUIZ_CARDS = [
  { id: 1, question: 'Хочу снимать крутые Reels?', image: '/images/test/1qst.webp' },
  { id: 2, question: 'Снимаю контент каждый день?', image: '/images/test/2qst.webp' },
  { id: 3, question: 'Хочу зарабатывать на съёмке?', image: '/images/test/3qst.webp' },
  { id: 4, question: 'Свет — моя главная проблема?', image: '/images/test/4qst.webp' },
  { id: 5, question: 'Готов(а) учиться прямо сейчас?', image: '/images/test/5qst.webp' },
];

export const SWIPE_QUIZ_RESULTS = {
  low: {
    minYes: 0,
    maxYes: 1,
    title: 'Пока подумай...',
    description: 'Возможно, тебе стоит сначала определиться с целями.',
    discount: null,
  },
  medium: {
    minYes: 2,
    maxYes: 3,
    title: 'Курс тебе подойдёт!',
    description: 'У тебя есть потенциал. Курс поможет раскрыть его.',
    discount: '1000₽',
  },
  high: {
    minYes: 4,
    maxYes: 5,
    title: 'Ты идеальный кандидат!',
    description: 'Ты точно знаешь чего хочешь. Давай начнём!',
    discount: '1500₽',
  },
};
