import type { TranslationResult } from '../types';
import type { AIConfig } from '../stores/useSettingsStore';

export async function translateProject(
  readme: string,
  description: string,
  repoName: string,
  aiConfig: AIConfig
): Promise<TranslationResult> {
  const truncatedReadme = readme.slice(0, 8000);

  const prompt = `你是一个资深技术分析师。请根据以下 GitHub 项目信息，用中文输出 JSON 格式的项目深度介绍。

项目名称: ${repoName}
项目描述: ${description || '无'}
README 内容:
${truncatedReadme}

请输出以下 JSON 格式（不要包含 markdown 代码块标记）:
{
  "overview": "项目简介",
  "highlights": "核心亮点",
  "target": "项目目标",
  "usage": "快速上手",
  "techStack": "技术架构",
  "installation": "安装部署"
}

各字段要求：
1. overview: 用 3-4 句话概括项目是什么、核心能力、面向人群。不要只翻译 description，要结合 README 内容给出更完整的描述。
2. highlights: 列出 4-6 个核心功能或亮点，每条以 • 开头，换行分隔。每条要具体说明功能点，不要只写一个词。
3. target: 说明项目要解决的核心问题、典型使用场景、目标用户群体。至少写 3 句话。
4. usage: 给出具体的使用步骤，包含命令示例。如果是库则写代码调用示例，如果是工具则写命令行用法。
5. techStack: 列出核心技术栈、依赖框架、架构设计。要具体到版本或技术名称，说明为什么选择这些技术。
6. installation: 写出完整的安装流程，包括前置环境要求、安装命令、配置步骤。

重要规则：
- 每个字段都必须有实质性内容，绝对不能为空或只写"暂无相关信息"
- 如果 README 中没有明确提到某方面信息，你必须根据项目名称、描述、代码特征进行合理推断和补充
- 内容要专业、具体、有深度，像一篇技术博客的介绍文章`;

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

  const res = await fetch(`${API_BASE}/api/ai`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      apiUrl: aiConfig.apiUrl,
      apiKey: aiConfig.apiKey,
      model: aiConfig.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`翻译请求失败 (${res.status}): ${text.slice(0, 100)}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('AI 返回内容为空');
  }

  try {
    return JSON.parse(content);
  } catch {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('翻译结果解析失败');
  }
}
