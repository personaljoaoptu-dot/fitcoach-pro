// Zero-dependency pure SVG QR Code generator for Pix and links
// Implements lightweight QR matrix generation or fallback clean SVG vector

export function generatePixPayload(key: string, name: string, city: string, amount: number, txid: string = 'FITCOACH'): string {
  // Format standard Brazilian Central Bank Pix string (EMV / BR Code)
  const formatField = (id: string, value: string): string => {
    const len = value.length.toString().padStart(2, '0');
    return `${id}${len}${value}`;
  };

  const cleanKey = key.trim();
  const cleanName = name.slice(0, 25).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  const cleanCity = city.slice(0, 15).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  const formattedAmount = amount.toFixed(2);

  const gui = formatField('00', 'br.gov.bcb.pix');
  const keyField = formatField('01', cleanKey);
  const merchantAccount = formatField('26', `${gui}${keyField}`);

  const mcc = formatField('52', '0000');
  const currency = formatField('53', '986');
  const amountField = formatField('54', formattedAmount);
  const country = formatField('58', 'BR');
  const nameField = formatField('59', cleanName || 'FITCOACH PRO');
  const cityField = formatField('60', cleanCity || 'SAO PAULO');
  const txField = formatField('05', txid);
  const additionalData = formatField('62', txField);

  let raw = `000201${merchantAccount}${mcc}${currency}${amountField}${country}${nameField}${cityField}${additionalData}6304`;

  // CRC16-CCITT calculation
  let crc = 0xffff;
  for (let i = 0; i < raw.length; i++) {
    crc ^= raw.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  const crcHex = (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0');
  return `${raw}${crcHex}`;
}
