import type { Locale } from "./site";

export type Messages = {
  brand: string;
  brandShort: string;
  nav: { home: string; posts: string; tags: string; products: string };
  chrome: {
    openNav: string;
    closeNav: string;
    collapseSidebar: string;
    expandSidebar: string;
    theme: string;
    language: string;
    sheetTitle: string;
  };
  hero: {
    badge: string;
    headline: string;
    accent: string;
    sub: string;
    ctaPrimary: string;
    ctaSecondary: string;
    feat1Title: string;
    feat1Body: string;
    feat2Title: string;
    feat2Body: string;
    feat3Title: string;
    feat3Body: string;
    visualAlt: string;
  };
  home: {
    latest: string;
    allPosts: string;
    byProject: string;
    empty: string;
  };
  posts: {
    title: string;
    lead: string;
    count: string;
    read: string;
    alsoZh: string;
    alsoEn: string;
    koNote: string;
    tagsLabel: string;
    projectLabel: string;
    dateLabel: string;
    back: string;
    notFound: string;
  };
  tags: {
    title: string;
    lead: string;
    all: string;
    empty: string;
  };
  faq: {
    heading: string;
    items: { q: string; a: string }[];
  };
  legal: {
    privacy: string;
    terms: string;
    disclaimer: string;
    footerNote: string;
  };
  meta: {
    homeTitle: string;
    homeDescription: string;
    postsTitle: string;
    postsDescription: string;
    tagsTitle: string;
    tagsDescription: string;
  };
};

const en: Messages = {
  brand: "XingAI Tech Blog",
  brandShort: "Tech Blog",
  nav: { home: "Home", posts: "Posts", tags: "Tags", products: "Products" },
  chrome: {
    openNav: "Open menu",
    closeNav: "Close menu",
    collapseSidebar: "Collapse sidebar",
    expandSidebar: "Expand sidebar",
    theme: "Toggle theme",
    language: "Language",
    sheetTitle: "XingAI Tech Blog",
  },
  hero: {
    badge: "Engineering notes",
    headline: "How we ship",
    accent: "decision systems",
    sub: "Architecture, cache boundaries, MCP gates, and the boring production details behind XingAI products. Written for builders. English and 中文.",
    ctaPrimary: "Read the posts",
    ctaSecondary: "Open the repo",
    feat1Title: "Bilingual",
    feat1Body: "Every article ships in English and 中文.",
    feat2Title: "Source in git",
    feat2Body: "Markdown in a public repo. No CMS.",
    feat3Title: "Not a funnel",
    feat3Body: "These are build notes, not investor tips.",
    visualAlt: "Illustration of architecture cards flowing Worker to Cache to API",
  },
  home: {
    latest: "Latest posts",
    allPosts: "All posts",
    byProject: "By project",
    empty: "No posts yet.",
  },
  posts: {
    title: "All posts",
    lead: "Engineering write-ups from XingAI products. Same facts in English and 中文.",
    count: "{n} articles",
    read: "Read",
    alsoZh: "中文",
    alsoEn: "English",
    koNote: "Korean UI is available. Article bodies are English or 中文 until Korean translations exist.",
    tagsLabel: "Tags",
    projectLabel: "Project",
    dateLabel: "Date",
    back: "All posts",
    notFound: "That post is not in this archive.",
  },
  tags: {
    title: "Tags",
    lead: "Filter the archive by the labels we put on each post.",
    all: "All tags",
    empty: "No posts with this tag.",
  },
  faq: {
    heading: "FAQ",
    items: [
      {
        q: "What is XingAI Tech Blog?",
        a: "A public archive of engineering posts from XingAI. It documents how products such as Invest AI, Research AI, and Robinhood MCP are built — architecture, ADRs, and production constraints.",
      },
      {
        q: "Where do I read the articles?",
        a: "Here at blog.xingai.app, or as Markdown in the public GitHub repo xingaiapp/xingai-tech-blog. Each topic has an English file and a 中文 file.",
      },
      {
        q: "Is this investment advice?",
        a: "No. Posts are engineering notes. Product outputs on invest.xingai.app are suggestions, not professional advice. Verify before you act.",
      },
      {
        q: "Which languages are supported?",
        a: "UI: English, 中文, 한국어. Articles: English and 中文. Korean article translations are not written yet.",
      },
      {
        q: "How is this licensed?",
        a: "Posts are CC BY 4.0. Code and site chrome are provided as-is. XingAI is not responsible for how you use the writing or the code.",
      },
    ],
  },
  legal: {
    privacy: "Privacy",
    terms: "Terms",
    disclaimer: "Disclaimer",
    footerNote: "Informational engineering notes. Not professional advice.",
  },
  meta: {
    homeTitle: "XingAI Tech Blog — How we ship decision systems",
    homeDescription:
      "Engineering archive from XingAI: architecture, MCP, cache boundaries, and production notes. English and 中文. Not investment advice.",
    postsTitle: "All posts · XingAI Tech Blog",
    postsDescription: "Full archive of XingAI engineering articles in English and 中文.",
    tagsTitle: "Tags · XingAI Tech Blog",
    tagsDescription: "Browse XingAI engineering posts by tag.",
  },
};

const zh: Messages = {
  brand: "XingAI 技术博客",
  brandShort: "技术博客",
  nav: { home: "首页", posts: "文章", tags: "标签", products: "产品" },
  chrome: {
    openNav: "打开菜单",
    closeNav: "关闭菜单",
    collapseSidebar: "收起侧栏",
    expandSidebar: "展开侧栏",
    theme: "切换主题",
    language: "语言",
    sheetTitle: "XingAI 技术博客",
  },
  hero: {
    badge: "工程笔记",
    headline: "我们怎么把",
    accent: "决策系统做上线",
    sub: "架构、缓存边界、MCP 闸门，以及 XingAI 产品里那些无聊但真实的生产细节。写给 builder。英文与中文同步。",
    ctaPrimary: "读文章",
    ctaSecondary: "打开仓库",
    feat1Title: "双语",
    feat1Body: "每篇都有英文和中文。",
    feat2Title: "源码在 git",
    feat2Body: "公开仓库里的 Markdown，没有 CMS。",
    feat3Title: "不是获客文",
    feat3Body: "这是建造笔记，不是投资建议。",
    visualAlt: "架构卡片示意：Worker 到 Cache 到 API",
  },
  home: {
    latest: "最新文章",
    allPosts: "全部文章",
    byProject: "按项目",
    empty: "还没有文章。",
  },
  posts: {
    title: "全部文章",
    lead: "XingAI 产品的工程记录。中英同一事实。",
    count: "{n} 篇",
    read: "阅读",
    alsoZh: "中文",
    alsoEn: "English",
    koNote: "界面有韩文。正文目前只有英文和中文。",
    tagsLabel: "标签",
    projectLabel: "项目",
    dateLabel: "日期",
    back: "全部文章",
    notFound: "归档里没有这篇文章。",
  },
  tags: {
    title: "标签",
    lead: "按文章上的标签过滤归档。",
    all: "全部标签",
    empty: "这个标签下没有文章。",
  },
  faq: {
    heading: "常见问题",
    items: [
      {
        q: "这是什么？",
        a: "XingAI 的公开工程归档。记录 Invest AI、Research AI、Robinhood MCP 等产品怎么建：架构、ADR、生产约束。",
      },
      {
        q: "文章在哪读？",
        a: "本站 blog.xingai.app，或公开仓库 xingaiapp/xingai-tech-blog 里的 Markdown。每个主题一份英文、一份中文。",
      },
      {
        q: "这是投资建议吗？",
        a: "不是。这里是工程笔记。invest.xingai.app 上的产品输出也只是建议，不是专业意见。行动前请自行核实。",
      },
      {
        q: "支持哪些语言？",
        a: "界面：English、中文、한국어。文章：英文和中文。韩文正文还没有。",
      },
      {
        q: "许可证？",
        a: "文章为 CC BY 4.0。代码和站点按现状提供。XingAI 不承担你如何使用这些内容的责任。",
      },
    ],
  },
  legal: {
    privacy: "隐私政策",
    terms: "服务条款",
    disclaimer: "免责声明",
    footerNote: "工程笔记，仅供参考，不构成专业建议。",
  },
  meta: {
    homeTitle: "XingAI 技术博客 — 我们怎么把决策系统做上线",
    homeDescription: "XingAI 工程归档：架构、MCP、缓存边界与生产笔记。中英双语。不是投资建议。",
    postsTitle: "全部文章 · XingAI 技术博客",
    postsDescription: "XingAI 工程文章完整归档，中英双语。",
    tagsTitle: "标签 · XingAI 技术博客",
    tagsDescription: "按标签浏览 XingAI 工程文章。",
  },
};

const ko: Messages = {
  brand: "XingAI 기술 블로그",
  brandShort: "기술 블로그",
  nav: { home: "홈", posts: "글", tags: "태그", products: "제품" },
  chrome: {
    openNav: "메뉴 열기",
    closeNav: "메뉴 닫기",
    collapseSidebar: "사이드바 접기",
    expandSidebar: "사이드바 펼치기",
    theme: "테마 전환",
    language: "언어",
    sheetTitle: "XingAI 기술 블로그",
  },
  hero: {
    badge: "엔지니어링 노트",
    headline: "의사결정 시스템을",
    accent: "이렇게 출시합니다",
    sub: "아키텍처, 캐시 경계, MCP 게이트, 그리고 XingAI 제품의 실제 운영 디테일. 빌더를 위한 글. 본문은 영어와 중국어입니다.",
    ctaPrimary: "글 읽기",
    ctaSecondary: "저장소 열기",
    feat1Title: "이중 언어",
    feat1Body: "모든 글이 영어와 중국어로 있습니다.",
    feat2Title: "소스는 git",
    feat2Body: "공개 저장소의 Markdown. CMS 없음.",
    feat3Title: "퍼널이 아님",
    feat3Body: "투자 팁이 아니라 빌드 노트입니다.",
    visualAlt: "Worker → Cache → API 아키텍처 카드 일러스트",
  },
  home: {
    latest: "최신 글",
    allPosts: "모든 글",
    byProject: "프로젝트별",
    empty: "아직 글이 없습니다.",
  },
  posts: {
    title: "모든 글",
    lead: "XingAI 제품 엔지니어링 기록. 영어와 중국어가 같은 사실을 담습니다.",
    count: "글 {n}편",
    read: "읽기",
    alsoZh: "中文",
    alsoEn: "English",
    koNote: "UI는 한국어입니다. 글 본문은 아직 영어 또는 중국어만 있습니다.",
    tagsLabel: "태그",
    projectLabel: "프로젝트",
    dateLabel: "날짜",
    back: "모든 글",
    notFound: "아카이브에 이 글이 없습니다.",
  },
  tags: {
    title: "태그",
    lead: "글에 붙인 라벨로 아카이브를 거릅니다.",
    all: "모든 태그",
    empty: "이 태그의 글이 없습니다.",
  },
  faq: {
    heading: "FAQ",
    items: [
      {
        q: "XingAI Tech Blog는 무엇인가요?",
        a: "XingAI의 공개 엔지니어링 아카이브입니다. Invest AI, Research AI, Robinhood MCP 같은 제품을 어떻게 만드는지 — 아키텍처, ADR, 운영 제약 — 를 기록합니다.",
      },
      {
        q: "글은 어디서 읽나요?",
        a: "blog.xingai.app, 또는 공개 GitHub 저장소 xingaiapp/xingai-tech-blog의 Markdown. 주제마다 영어 파일과 중국어 파일이 있습니다.",
      },
      {
        q: "투자 자문인가요?",
        a: "아닙니다. 여기는 엔지니어링 노트입니다. invest.xingai.app 출력도 제안일 뿐 전문 자문이 아닙니다. 실행 전에 직접 확인하세요.",
      },
      {
        q: "지원 언어는?",
        a: "UI: English, 中文, 한국어. 본문: 영어와 중국어. 한국어 번역은 아직 없습니다.",
      },
      {
        q: "라이선스는?",
        a: "글은 CC BY 4.0. 코드와 사이트는 있는 그대로 제공됩니다. 사용 결과에 대해 XingAI는 책임지지 않습니다.",
      },
    ],
  },
  legal: {
    privacy: "개인정보",
    terms: "이용약관",
    disclaimer: "면책",
    footerNote: "엔지니어링 참고 자료입니다. 전문 자문이 아닙니다.",
  },
  meta: {
    homeTitle: "XingAI 기술 블로그 — 의사결정 시스템을 출시하는 방법",
    homeDescription:
      "XingAI 엔지니어링 아카이브: 아키텍처, MCP, 캐시 경계, 운영 노트. 영어와 중국어. 투자 자문이 아닙니다.",
    postsTitle: "모든 글 · XingAI 기술 블로그",
    postsDescription: "XingAI 엔지니어링 글 전체 아카이브. 영어와 중국어.",
    tagsTitle: "태그 · XingAI 기술 블로그",
    tagsDescription: "태그로 XingAI 엔지니어링 글을 봅니다.",
  },
};

export const messages: Record<Locale, Messages> = { en, zh, ko };

export function tCount(template: string, n: number): string {
  return template.replace("{n}", String(n));
}
