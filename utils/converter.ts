export async function docxToHtml(file: File): Promise<string> {
  const mammoth = (await import('mammoth')).default;
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  return result.value;
}

export async function htmlToPdfBlob(html: string, filename: string): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const html2canvas = (await import('html2canvas')).default;

  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed; top: -9999px; left: -9999px;
    width: 794px; padding: 48px;
    font-family: Georgia, serif; font-size: 13px;
    line-height: 1.6; color: #111; background: #fff;
  `;
  container.innerHTML = html;
  document.body.appendChild(container);

  const canvas = await html2canvas(container, {
    scale: 2, useCORS: true, backgroundColor: '#ffffff',
  });
  document.body.removeChild(container);

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
  const scaledW = imgWidth * ratio;

  let yOffset = 0;
  while (yOffset < imgHeight) {
    if (yOffset > 0) pdf.addPage();
    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = imgWidth;
    sliceCanvas.height = Math.min(pdfHeight / ratio, imgHeight - yOffset);
    const ctx = sliceCanvas.getContext('2d')!;
    ctx.drawImage(canvas, 0, yOffset, sliceCanvas.width, sliceCanvas.height, 0, 0, sliceCanvas.width, sliceCanvas.height);
    const sliceData = sliceCanvas.toDataURL('image/png');
    pdf.addImage(sliceData, 'PNG', 0, 0, scaledW, sliceCanvas.height * ratio);
    yOffset += sliceCanvas.height;
  }

  return pdf.output('blob');
}

export async function pdfToText(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += pageText + '\n\n';
  }
  return fullText.trim();
}

export async function textToDocxBlob(text: string, filename: string): Promise<Blob> {
  const { Document, Packer, Paragraph, TextRun } = await import('docx');

  const lines = text.split('\n');
  const children = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return new Paragraph({ children: [] });
    return new Paragraph({
      children: [new TextRun({ text: trimmed, font: 'Calibri', size: 24 })],
    });
  });

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children,
    }],
  });

  return await Packer.toBlob(doc);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function getOutputFilename(inputName: string, targetExt: string): string {
  const base = inputName.replace(/\.[^.]+$/, '');
  return `${base}.${targetExt}`;
  }
