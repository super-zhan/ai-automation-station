import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const mode = (formData.get('mode') as string) || 'clean';

    if (!file) {
      return NextResponse.json({ success: false, message: '请上传文件' });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Read the workbook
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    switch (mode) {
      case 'clean': {
        // Data cleaning: trim whitespace, remove empty rows, deduplicate
        const result: Record<string, unknown[][]> = {};
        workbook.SheetNames.forEach(name => {
          const sheet = workbook.Sheets[name];
          const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

          // Clean data
          const cleaned = data
            .map(row => {
              const cleanRow: Record<string, unknown> = {};
              Object.entries(row).forEach(([key, val]) => {
                cleanRow[key.trim()] = typeof val === 'string' ? val.trim() : val;
              });
              return cleanRow;
            })
            .filter(row => Object.values(row).some(v => v !== '' && v !== null && v !== undefined));

          // Deduplicate by first column
          const seen = new Set();
          const deduped = cleaned.filter(row => {
            const firstVal = String(Object.values(row)[0] || '');
            if (seen.has(firstVal)) return false;
            seen.add(firstVal);
            return true;
          });

          const newSheet = XLSX.utils.json_to_sheet(deduped);
          result[name] = XLSX.utils.sheet_to_json(newSheet) as unknown[][];
        });

        // Write output
        const outWorkbook = XLSX.utils.book_new();
        Object.entries(result).forEach(([name, data]) => {
          const sheet = XLSX.utils.json_to_sheet(data);
          XLSX.utils.book_append_sheet(outWorkbook, sheet, name);
        });

        const outBuffer = XLSX.write(outWorkbook, { type: 'buffer', bookType: 'xlsx' });
        const base64 = Buffer.from(outBuffer).toString('base64');

        return NextResponse.json({
          success: true,
          message: `清洗完成，共处理 ${workbook.SheetNames.length} 个工作表`,
          downloadUrl: `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`,
        });
      }

      case 'convert': {
        // Convert to CSV
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const csv = XLSX.utils.sheet_to_csv(sheet);
        const base64 = Buffer.from(csv, 'utf-8').toString('base64');

        return NextResponse.json({
          success: true,
          message: `已转换为 CSV 格式，共 ${csv.split('\n').length} 行`,
          downloadUrl: `data:text/csv;charset=utf-8;base64,${base64}`,
        });
      }

      case 'merge': {
        // Merge all sheets into one
        const allData: Record<string, unknown>[] = [];
        workbook.SheetNames.forEach(name => {
          const sheet = workbook.Sheets[name];
          const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
          allData.push(...data);
        });

        const newSheet = XLSX.utils.json_to_sheet(allData);
        const outWorkbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(outWorkbook, newSheet, '合并结果');
        const outBuffer = XLSX.write(outWorkbook, { type: 'buffer', bookType: 'xlsx' });
        const base64 = Buffer.from(outBuffer).toString('base64');

        return NextResponse.json({
          success: true,
          message: `合并完成，共 ${allData.length} 行数据（来自 ${workbook.SheetNames.length} 个工作表）`,
          downloadUrl: `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`,
        });
      }

      default:
        return NextResponse.json({ success: false, message: '未知的处理模式' });
    }
  } catch (error) {
    console.error('Excel processing error:', error);
    return NextResponse.json({
      success: false,
      message: '处理文件时出错，请确保文件格式正确',
    });
  }
}
