import { degrees, PDFDocument, rgb, StandardFonts } from "pdf-lib";

const addWatermark = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    const pdfBuffer = req.file.buffer;

    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const pages = pdfDoc.getPages();
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const { width, height } = page.getSize();

      for (let j = 0; j < 20; j++) {
        page.drawText(`@${req.body.userName}`, {
          x: Math.random() * width,
          y: Math.random() * height,
          size: 20,
          font: helveticaFont,
          color: rgb(0.5, 0.5, 0.5),
          opacity: 0.3,
          rotate: degrees(-45),
        });
      }
    }

    const watermarkedPdfBytes = await pdfDoc.save();

    req.file.buffer = watermarkedPdfBytes;

    next();
  } catch (error) {
    console.error("Ocurrió un error al agregar la marca de agua:", error);
    res.status(500).json({
      success: false,
      error: "Ocurrió un error al agregar la marca de agua",
    });
  }
};

export { addWatermark };
