import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, message: '请上传 PDF 文件' });
    }

    const results: string[] = [];

    for (const file of files) {
      if (!file.name.endsWith('.pdf')) {
        results.push(`【${file.name}】不支持的文件格式，跳过`);
        continue;
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      try {
        // Dynamic import for pdf-parse (ESM module)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pdfParse: any = await import('pdf-parse');
        const PDFParse = pdfParse.PDFParse || pdfParse.default?.PDFParse;
        // Set up worker path for Node.js environment
        PDFParse.setWorker?.();

        const parser = new PDFParse({
          data: new Uint8Array(buffer),
          disableFontFace: true,
        });

        const textResult = await parser.getText();
        const text = textResult.text || '';

        const cleaned = text
          .replace(/\n{3,}/g, '\n\n')
          .replace(/ {2,}/g, ' ')
          .trim();

        results.push([
          `文件名: ${file.name}`,
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
    console.error('PDF processing error:', error);
    return NextResponse.json({
      success: false,
      message: '处理文件时出错',
    });
  }
}
