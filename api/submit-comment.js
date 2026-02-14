// 后端核心代码，Token 藏在这里
export default async function handler(req, res) {
  // 允许前端跨域请求
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理浏览器预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只接受 POST 请求（前端提交留言用）
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支持 POST 请求' });
  }

  try {
    const { author, body } = req.body;

    if (!body) {
      return res.status(400).json({ error: '留言内容不能为空' });
    }

    // 构造 GitHub Issue 评论内容，确保中文被正确编码
    const commentBody = `[昵称]: ${author || '匿名旅友'} \n[内容]: ${body}`;

    // 调用 GitHub API 发表评论
    const response = await fetch(
      `https://api.github.com/repos/${process.env.GITHUB_USER}/${process.env.REPO_NAME}/issues/${process.env.ISSUE_NUMBER}/comments`,
      {
        method: 'POST',
        headers: {
          'Authorization': `token ${process.env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json; charset=utf-8' // 明确指定 UTF-8 编码
        },
        body: JSON.stringify({ body: commentBody }) // 使用 JSON.stringify 自动处理编码
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'GitHub API 请求失败');
    }

    const data = await response.json();
    return res.status(200).json({ success: true, commentId: data.id });

  } catch (error) {
    console.error('后端错误:', error);
    return res.status(500).json({ error: '服务器内部错误，请稍后再试' });
  }
}
