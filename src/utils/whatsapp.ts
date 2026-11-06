import { Student, PersonalProfile, Payment } from '../types';

export const cleanPhoneNumber = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 11) {
    return `55${digits}`;
  }
  return digits;
};

export const formatPhoneDisplay = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
};

const formatShortDate = (dateStr: string) => {
  try {
    const [, m, d] = dateStr.split('-');
    return `${d}/${m}`;
  } catch {
    return dateStr;
  }
};

export const generateBillingWhatsAppUrl = (
  student: Student,
  payment: Payment,
  profile: PersonalProfile
): string => {
  const cleanPhone = cleanPhoneNumber(student.phone);
  const firstName = student.name.split(' ')[0];

  const valorFormatado = payment.amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const modalityText = student.modality === 'consultoria' ? 'consultoria online' : 'treinos presenciais';

  let message = '';

  if (student.billingType === 'avulso') {
    const dates = (student.attendedDates || []).slice().sort();
    const count = dates.length > 0 ? dates.length : (payment.classesCount ?? student.classesDoneMonth ?? 0);
    const pricePerClass = student.pricePerClass?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 70,00';

    let datesText = '';
    if (dates.length > 0) {
      const formattedList = dates.map((d) => formatShortDate(d)).join(', ');
      datesText = `\nDatas realizadas: ${formattedList}`;
    }

    if (payment.status === 'overdue') {
      message = `Fala ${firstName}, tudo bem?

Passando para te enviar o fechamento das aulas que venceu dia ${student.dueDay}.

Total de aulas: ${count} aulas (${pricePerClass}/aula)${datesText}
Valor total: ${valorFormatado}
Chave Pix (${profile.pixKeyType}): ${profile.pixKey}

Quando puder transferir, me manda o comprovante por aqui. Valeu!`;
    } else {
      message = `Opa ${firstName}, tudo certo?

Segue o fechamento das aulas de treino deste período:

Aulas realizadas: ${count} aulas (${pricePerClass}/aula)${datesText}
Valor total: ${valorFormatado}
Chave Pix (${profile.pixKeyType}): ${profile.pixKey}

Qualquer dúvida ou conferência de datas só me chamar. Abraço!`;
    }
  } else {
    // Mensalidade Fixa
    if (payment.status === 'overdue') {
      message = `Fala ${firstName}, tudo bem?

Passando só pra te dar um toque sobre a mensalidade de ${modalityText} que venceu no dia ${student.dueDay}.

Valor: ${valorFormatado}
Chave Pix (${profile.pixKeyType}): ${profile.pixKey}

Quando fizer, me manda o comprovante por aqui. Valeu!`;
    } else {
      message = `Opa ${firstName}, tudo certo?

Lembrete rápido da mensalidade de ${modalityText} deste mês (vence dia ${student.dueDay}).

Valor: ${valorFormatado}
Chave Pix (${profile.pixKeyType}): ${profile.pixKey}

Qualquer dúvida me avisa por aqui. Abraço!`;
    }
  }

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

export const generateReceiptWhatsAppUrl = (
  student: Student,
  payment: Payment,
  profile: PersonalProfile
): string => {
  const cleanPhone = cleanPhoneNumber(student.phone);
  const valorFormatado = payment.amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const dataPagamento = payment.paidAt
    ? new Date(payment.paidAt).toLocaleDateString('pt-BR')
    : new Date().toLocaleDateString('pt-BR');

  let desc = '';
  if (student.billingType === 'avulso') {
    const dates = student.attendedDates || [];
    const count = dates.length > 0 ? dates.length : (payment.classesCount ?? student.classesDoneMonth ?? 0);
    desc = `Fechamento de ${count} aulas presenciais`;
  } else {
    desc = student.modality === 'consultoria' ? 'Consultoria Online (Mensal)' : 'Personal Trainer (Mensalidade)';
  }

  const message = `📄 *RECIBO DE PAGAMENTO*

Recebi de: *${student.name}*
Referência: ${desc} - Novembro/2026
Valor: *${valorFormatado}*
Data do pagamento: ${dataPagamento}
Forma: Pix

Confirmado por: *${profile.name}*
WhatsApp: ${formatPhoneDisplay(profile.phone)}`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

export const generateScheduleWhatsAppUrl = (
  student: Student,
  day: string,
  time: string
): string => {
  const cleanPhone = cleanPhoneNumber(student.phone);
  const firstName = student.name.split(' ')[0];
  const message = `Fala ${firstName}, confirmado nosso treino de ${day} às ${time}? Valeu!`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};
