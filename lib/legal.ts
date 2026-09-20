import type { Locale } from "./site";

export type LegalDocId = "privacy" | "terms" | "disclaimer";

export type LegalDoc = {
  title: string;
  description: string;
  updated: string;
  sections: { heading: string; paragraphs: string[] }[];
};

const updated = "September 20, 2026";

const en: Record<LegalDocId, LegalDoc> = {
  privacy: {
    title: "Privacy Policy",
    description: "How blog.xingai.app handles information.",
    updated,
    sections: [
      {
        heading: "What this site collects",
        paragraphs: [
          "The blog has no accounts and no login. We do not ask for your name or email to read posts.",
          "Your browser may store theme (light/dark) in localStorage. Language is in the URL (/zh, /ko).",
          "The host (typically Vercel) receives standard request logs: IP address, user agent, pages requested. We use those logs to keep the site up and to debug errors. We do not sell this data.",
        ],
      },
      {
        heading: "Cookies",
        paragraphs: [
          "We may set a locale preference cookie. We do not run advertising pixels on this blog.",
        ],
      },
      {
        heading: "Other XingAI sites",
        paragraphs: [
          "Links to xingai.app or product apps (for example invest.xingai.app) are separate sites with their own policies.",
        ],
      },
      {
        heading: "Contact",
        paragraphs: ["Questions: contact@xingai.app."],
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    description: "Terms for using blog.xingai.app.",
    updated,
    sections: [
      {
        heading: "What this is",
        paragraphs: [
          "blog.xingai.app publishes engineering notes from XingAI. Posts are also available as Markdown in the public GitHub repository xingaiapp/xingai-tech-blog.",
          "Post text is licensed CC BY 4.0 unless a post says otherwise. The site chrome and generator code are provided as-is.",
        ],
      },
      {
        heading: "No warranty",
        paragraphs: [
          "Content is for information and education. It is provided without warranty. XingAI is not responsible for how you use the writing, diagrams, or code samples.",
          "Following an architecture note does not create a professional, legal, financial, or employment relationship.",
        ],
      },
      {
        heading: "Your responsibility",
        paragraphs: [
          "You must review security, privacy, legal, compliance, cost, and operational risk before copying any pattern into your own systems.",
        ],
      },
    ],
  },
  disclaimer: {
    title: "Disclaimer",
    description: "Engineering notes, not professional advice.",
    updated,
    sections: [
      {
        heading: "Not professional advice",
        paragraphs: [
          "Nothing on this blog is legal, financial, medical, tax, or investment advice. XingAI product apps that make suggestions (including invest.xingai.app) are also not professional advice. Verify before you act.",
        ],
      },
      {
        heading: "Not production-ready by default",
        paragraphs: [
          "Code samples and architecture sketches are not a production system unless a post explicitly says what was shipped. You own review, testing, and outcomes.",
        ],
      },
      {
        heading: "No responsibility for use",
        paragraphs: [
          "XingAI does not accept responsibility for how readers use these posts, prompts, diagrams, or linked repositories.",
        ],
      },
    ],
  },
};

const zh: Record<LegalDocId, LegalDoc> = {
  privacy: {
    title: "隐私政策",
    description: "blog.xingai.app 如何处理信息。",
    updated,
    sections: [
      {
        heading: "本站收集什么",
        paragraphs: [
          "博客没有账号，也不需要登录。阅读文章不会要求姓名或邮箱。",
          "浏览器可能在 localStorage 里保存主题（浅色/深色）。语言在 URL 里（/zh、/ko）。",
          "托管方（通常是 Vercel）会收到常规访问日志：IP、UA、请求路径。我们用它来保活和排错，不会出售这些数据。",
        ],
      },
      {
        heading: "Cookie",
        paragraphs: ["可能会有语言偏好 cookie。本博客不跑广告像素。"],
      },
      {
        heading: "其他 XingAI 站点",
        paragraphs: ["指向 xingai.app 或产品站（例如 invest.xingai.app）的链接是独立站点，适用各自政策。"],
      },
      {
        heading: "联系",
        paragraphs: ["问题请发 contact@xingai.app。"],
      },
    ],
  },
  terms: {
    title: "服务条款",
    description: "使用 blog.xingai.app 的条款。",
    updated,
    sections: [
      {
        heading: "这是什么",
        paragraphs: [
          "blog.xingai.app 发布 XingAI 的工程笔记。文章也以 Markdown 形式放在公开仓库 xingaiapp/xingai-tech-blog。",
          "文章文本默认 CC BY 4.0（单篇另有说明除外）。站点框架和生成代码按现状提供。",
        ],
      },
      {
        heading: "无保证",
        paragraphs: [
          "内容仅供参考与学习，不作任何保证。你如何使用这些文字、图或代码示例，XingAI 不承担责任。",
          "照着一篇架构笔记做，并不构成专业、法律、财务或雇佣关系。",
        ],
      },
      {
        heading: "你的责任",
        paragraphs: ["把任何模式拷进自己的系统之前，请自行审查安全、隐私、法律、合规、成本和运维风险。"],
      },
    ],
  },
  disclaimer: {
    title: "免责声明",
    description: "工程笔记，不是专业建议。",
    updated,
    sections: [
      {
        heading: "不是专业建议",
        paragraphs: [
          "本博客内容不是法律、财务、医疗、税务或投资建议。包括 invest.xingai.app 在内的 XingAI 产品输出同样只是建议。行动前请自行核实。",
        ],
      },
      {
        heading: "默认不是生产系统",
        paragraphs: ["代码示例和架构草图不等于已上线系统，除非文章明确写了上线范围。审查、测试和结果由你负责。"],
      },
      {
        heading: "使用责任",
        paragraphs: ["读者如何使用这些文章、提示词、图或链接仓库，XingAI 不承担责任。"],
      },
    ],
  },
};

const ko: Record<LegalDocId, LegalDoc> = {
  privacy: {
    title: "개인정보 처리방침",
    description: "blog.xingai.app이 정보를 다루는 방식.",
    updated,
    sections: [
      {
        heading: "이 사이트가 수집하는 것",
        paragraphs: [
          "블로그에는 계정이 없고 로그인도 없습니다. 글을 읽기 위해 이름이나 이메일을 묻지 않습니다.",
          "브라우저는 테마(라이트/다크)를 localStorage에 저장할 수 있습니다. 언어는 URL(/zh, /ko)에 있습니다.",
          "호스트(보통 Vercel)는 IP, 사용자 에이전트, 요청 경로 같은 표준 로그를 받습니다. 운영과 오류 수정에만 쓰며 판매하지 않습니다.",
        ],
      },
      {
        heading: "쿠키",
        paragraphs: ["언어 선호 쿠키가 있을 수 있습니다. 이 블로그는 광고 픽셀을 쓰지 않습니다."],
      },
      {
        heading: "다른 XingAI 사이트",
        paragraphs: ["xingai.app 또는 invest.xingai.app 같은 제품 사이트는 별도 정책이 적용됩니다."],
      },
      {
        heading: "연락",
        paragraphs: ["문의: contact@xingai.app."],
      },
    ],
  },
  terms: {
    title: "이용약관",
    description: "blog.xingai.app 이용 조건.",
    updated,
    sections: [
      {
        heading: "이 사이트",
        paragraphs: [
          "blog.xingai.app은 XingAI 엔지니어링 노트를 공개합니다. 글은 GitHub 저장소 xingaiapp/xingai-tech-blog의 Markdown으로도 있습니다.",
          "글 본문은 별도 표시가 없으면 CC BY 4.0입니다. 사이트 크롬과 생성 코드는 있는 그대로 제공됩니다.",
        ],
      },
      {
        heading: "보증 없음",
        paragraphs: [
          "내용은 정보와 학습용이며 보증이 없습니다. 글, 다이어그램, 코드 샘플의 사용 결과에 대해 XingAI는 책임지지 않습니다.",
          "아키텍처 노트를 따른다고 해서 전문·법률·재무·고용 관계가 생기지 않습니다.",
        ],
      },
      {
        heading: "사용자 책임",
        paragraphs: ["패턴을 자신의 시스템에 넣기 전에 보안, 개인정보, 법률, 컴플라이언스, 비용, 운영 위험을 직접 검토해야 합니다."],
      },
    ],
  },
  disclaimer: {
    title: "면책",
    description: "엔지니어링 노트이며 전문 자문이 아닙니다.",
    updated,
    sections: [
      {
        heading: "전문 자문 아님",
        paragraphs: [
          "이 블로그의 어떤 내용도 법률, 재무, 의료, 세무, 투자 자문이 아닙니다. invest.xingai.app을 포함한 XingAI 제품 출력도 제안일 뿐입니다. 실행 전에 확인하세요.",
        ],
      },
      {
        heading: "기본값은 프로덕션이 아님",
        paragraphs: ["코드 샘플과 아키텍처 스케치는, 글이 출시 범위를 명시하지 않는 한 운영 시스템이 아닙니다. 검토와 결과는 사용자 책임입니다."],
      },
      {
        heading: "사용 책임",
        paragraphs: ["독자가 이 글, 프롬프트, 그림, 링크된 저장소를 어떻게 쓰든 XingAI는 책임지지 않습니다."],
      },
    ],
  },
};

const docs: Record<Locale, Record<LegalDocId, LegalDoc>> = { en, zh, ko };

export const LEGAL_IDS: LegalDocId[] = ["privacy", "terms", "disclaimer"];

export function getLegalDoc(locale: Locale, id: LegalDocId): LegalDoc {
  return docs[locale][id];
}
