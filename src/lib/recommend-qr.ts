import QRCode from "qrcode";

export async function recommendCourseQrDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    margin: 1,
    width: 280,
    errorCorrectionLevel: "M",
    color: { dark: "#3d3429", light: "#f9f7f1" },
  });
}
