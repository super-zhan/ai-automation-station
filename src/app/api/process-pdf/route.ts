import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, message: '请上传 PDF 文件' });
    }

    const results: string[] = [];
    // Dynamic import for pdf-parse (CJS module that doesn't have default ESM export)
    const pdfParse = (await import('pdf-parse')).default;

    for (const file of files) {
      if (!file.name.endsWith('.pdf')) {
        results.push(`【${file.name}】不支持的文件格式，跳过`);
        continue;
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      try {
        const data = await pdfParse(buffer);
        const cleaned = (data.text || '')
          .replace(/\n{3,}/g, '\n\n')
          .replace(/ {2,}/g, ' ')
          .trim();

        results.push([
          `文件名: ${file.name}`,
          `页数: ${data.numpages || '?'}`,
          `文本长度: ${cleaned.length} 字符`,
          '',
          cleaned.slice(0, 2000),
          '',
          '---',
        ].join('\n'));
      } catch (err) {
        const msg = err instanceof Error ? err.message : '未知错误';
        results.push(`【${file.name}】解析失败: ${msg}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `处理完成 ${files.length} 个文件`,
      content: results.join('\n'),
    });
  } catch (error) {
    const msg = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    console.error('PDF processing error:', msg);
    return NextResponse.json({
      success: false,
      message: '处理文件时出错',
      error: msg,
      stack: error instanceof Error ? error.stack?.split('\n').slice(0, 5).join('\n') : undefined,
    });
  }
}
