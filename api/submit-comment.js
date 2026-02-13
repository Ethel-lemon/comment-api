// 后端核心代码，Token 藏在这里
export default async function handler(req, res) {
  // 允许前端跨域请求（必须加，否则前端调不通）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理浏览器预检请求，不用改
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只接受 POST 请求（前端提交留言用）
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支持POST请求' });
  }

  try {
    // 1. 接收前端传过来的昵称和留言内容
    const { author, body } = req.body;
    if (!author || !body) {
      return res.status(400).json({ error: '昵称和留言内容不能为空' });
    }

    // 2. 配置你的 GitHub 信息（这里填新 Token！）
    const GITHUB_USER = "Ethel-lemon";       // 你的 GitHub 用户名
    const REPO_NAME = "jingsonglyt-comments";// 你的留言仓库名
    const ISSUE_NUMBER = 1;                 // 你的 Issue 编号
    const GITHUB_TOKEN = "你的新Token";      // 替换成第一步生成的新 Token！

    // 3. 后端调用 GitHub API 提交留言（Token 只在这里用，前端看不到）
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_USER}/${REPO_NAME}/issues/${ISSUE_NUMBER}/comments`,
      {
        method: "POST",
        headers: {
          "Accept": "application/vnd.github.v3+json",
          "Authorization": `token ${GITHUB_TOKEN}`, // Token 只在后端出现
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          body: `[昵称]: ${author} \n[内容]: ${body}` // 和你前端解析格式一致
        })
      }
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || '留言提交失败');
    }

    // 4. 告诉前端提交成功
    res.status(200).json({ success: true, msg: '留言提交成功！' });
  } catch (error) {
    console.error('后端报错：', error);
    res.status(500).json({ error: error.message || '服务器出错，请稍后再试' });
  }
}