此專案由 [Next.js](https://nextjs.org/) 結合 [Tailwind CSS](https://tailwindcss.com/) 所建構，並利用 [Nixtla TimeGPT-1](https://docs.nixtla.io/docs/getting-started-about_timegpt) 時序模型將預測結果、歷史、即時資料，利用資料視覺化工具 [Deck.gl](https://deck.gl/) 於基底地圖服務 [Mapbox](https://visgl.github.io/react-map-gl/docs/api-reference/map) 上互動式地呈現交通壅塞狀況，使用戶能一目瞭然地知曉台灣各地國道的雍塞情形，並搭配了搭載 [Llama 3.2 (採用Ollama所提供)](https://ollama.com/library/llama3.2) LLM 模型結合 [RAG (採用LangChain框架)](https://js.langchain.com/docs/integrations/chat/ollama/) 與 Prompt engineering 技術的AI助手功能讓用戶利用文字或語音來向AI詢問雍塞問題等互動。

## Getting Started

First, run the development server:

```bash
pnpm run dev [Recommended]
# or
npm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.jsx`. The page auto-updates as you edit the file.

<details>
  <summary>

## 程式架構

  </summary>

  - ### API
  > ![image](https://github.com/user-attachments/assets/4e298799-9d90-4978-a561-1d57d5fed367)

</details>

## Repo Activity

![Alt](https://repobeats.axiom.co/api/embed/99feab9dfff0ceb6f61d988efd2b5e75e8ce2aeb.svg "Repobeats analytics image")
