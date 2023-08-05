import { degrees, PDFDocument, rgb, StandardFonts } from "pdf-lib";
import path from "path";

const MAX_FILE_WEIGHT = 25 * 1024 * 1024;

const addWatermark = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    const pdfExtension = ".pdf";
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    if (fileExtension !== pdfExtension) {
      return res.status(400).json({
        message: "El archivo debe ser un pdf",
        status: "error",
      });
    }

    if (req.file.size > MAX_FILE_WEIGHT) {
      return res.status(400).json({
        message: "El archivo debe pesar máximo 25 MB",
        status: "error",
      });
    }

    const pdfBuffer = req.file.buffer;

    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const watermarkText = `@${req.body.userName}`;
    const watermarkSize = 20;
    const watermarkColor = rgb(0.5, 0.5, 0.5);
    const watermarkOpacity = 0.3;
    const watermarkRotation = degrees(-45);

    const pages = pdfDoc.getPages();
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const { width, height } = page.getSize();

      for (let x = 0; x < width; x += 175) {
        for (let y = 0; y < height; y += 175) {
          page.drawText(watermarkText, {
            x,
            y,
            size: watermarkSize,
            font: helveticaFont,
            color: watermarkColor,
            opacity: watermarkOpacity,
            rotate: watermarkRotation,
          });
        }
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
