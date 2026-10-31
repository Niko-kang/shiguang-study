const chapters = [
  {
    "module": "形式逻辑篇",
    "title": "专题一 · 复言命题",
    "points": [
      {
        "number": 1,
        "name": "联言选言",
        "page": 17
      },
      {
        "number": 2,
        "name": "假言命题",
        "page": 25
      },
      {
        "number": 3,
        "name": "二难推理",
        "page": 39
      },
      {
        "number": 4,
        "name": "矛盾命题",
        "page": 41
      },
      {
        "number": 5,
        "name": "真假规则",
        "page": 49
      }
    ],
    "review": 53,
    "test": 66
  },
  {
    "module": "形式逻辑篇",
    "title": "专题二 · 简单命题",
    "points": [
      {
        "number": 6,
        "name": "性质命题",
        "page": 82
      },
      {
        "number": 7,
        "name": "模态命题",
        "page": 100
      },
      {
        "number": 8,
        "name": "矛盾命题",
        "page": 103
      },
      {
        "number": 9,
        "name": "关系命题",
        "page": 109
      }
    ],
    "review": 112,
    "test": 118
  },
  {
    "module": "形式逻辑篇",
    "title": "专题三 · 概念、定义和数字推理",
    "points": [
      {
        "number": 10,
        "name": "概念定义",
        "page": 134
      },
      {
        "number": 11,
        "name": "数字推理",
        "page": 139
      }
    ],
    "review": 150,
    "test": 155
  },
  {
    "module": "综合推理篇",
    "title": "专题四 · 综合推理",
    "points": [
      {
        "number": 12,
        "name": "匹配排序",
        "page": 173
      },
      {
        "number": 13,
        "name": "真话假话",
        "page": 208
      }
    ],
    "review": 219,
    "test": 228
  },
  {
    "module": "论证逻辑篇",
    "title": "专题五 · 削弱题",
    "points": [
      {
        "number": 14,
        "name": "削弱的基本思路",
        "page": 247
      },
      {
        "number": 15,
        "name": "特殊关系的削弱",
        "page": 258
      }
    ],
    "review": 285,
    "test": 293
  },
  {
    "module": "论证逻辑篇",
    "title": "专题六 · 支持题",
    "points": [
      {
        "number": 16,
        "name": "支持的基本思路",
        "page": 312
      },
      {
        "number": 17,
        "name": "特殊关系的支持",
        "page": 315
      }
    ],
    "review": 327,
    "test": 332
  },
  {
    "module": "论证逻辑篇",
    "title": "专题七 · 假设题",
    "points": [
      {
        "number": 18,
        "name": "假设的基本思路",
        "page": 351
      },
      {
        "number": 19,
        "name": "特殊关系的假设",
        "page": 354
      }
    ],
    "review": 362,
    "test": 366
  },
  {
    "module": "论证逻辑篇",
    "title": "专题八 · 分析题",
    "points": [
      {
        "number": 20,
        "name": "分析论证结构",
        "page": 385
      },
      {
        "number": 21,
        "name": "分析争论焦点",
        "page": 386
      },
      {
        "number": 22,
        "name": "分析论证方法",
        "page": 388
      },
      {
        "number": 23,
        "name": "分析逻辑谬误",
        "page": 392
      },
      {
        "number": 24,
        "name": "分析结构相似",
        "page": 403
      },
      {
        "number": 25,
        "name": "分析关键问题",
        "page": 407
      }
    ],
    "review": 410,
    "test": 417
  },
  {
    "module": "论证逻辑篇",
    "title": "专题九 · 解释题",
    "points": [
      {
        "number": 26,
        "name": "解释",
        "page": 437
      }
    ],
    "review": 442,
    "test": 445
  }
] as const;
export default function LogicBookGuide(){return <details className="panel plan-guide"><summary>逻辑目录速查 <span>已购《逻辑72技》 · 考点名称与起始页</span></summary><p className="muted">依据2026年10月31日提供的3页实物目录核对。页码是起始页，不是一天的阅读范围；例题和练习按当天时间选取，不编造题号。两个「矛盾命题」属于不同专题，请同时核对考点编号。</p><div className="month-grid">{chapters.map(c=><article key={c.title}><small>{c.module}</small><h3>{c.title}</h3>{c.points.map(p=><p key={p.number}>考点{String(p.number).padStart(2,'0')} · {p.name}<b> · 第{p.page}页起</b></p>)}<p className="muted">本质提炼：第{c.review}页起<br/>专题自测：第{c.test}页起</p></article>)}</div><p className="muted">复习日先按错题选择对应考点，再查「本质提炼」或「专题自测」；只选当天规定题量，不整章追加。目录速查覆盖所提供的全部26个考点，不代表每个考点都已安排独立新课；尚未掌握的内容在复盘时优先补缺。</p></details>}
