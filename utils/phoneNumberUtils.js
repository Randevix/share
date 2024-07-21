const { parsePhoneNumberFromString } = require('libphonenumber-js');

// Telefon numarasýný önce formatlayan ve ardýndan doðrulayan fonksiyon
function initialFormatPhoneNumber(phoneNumber) {
    const cleaned = phoneNumber.replace(/\D/g, '');

    if (/^5\d{9}$/.test(cleaned)) {
        return `90${cleaned}`;
    } else if (/^05\d{9}$/.test(cleaned)) {
        return `9${cleaned}`;
    } else if (/^905\d{9}$/.test(cleaned)) {
        return cleaned;
    } else {
        return cleaned;
    }
}

// Telefon numarasýnýn geçerliliðini ve nihai formatýný kontrol eden fonksiyon
function formatPhoneNumber(phoneNumber) {
    const initialFormatted = initialFormatPhoneNumber(phoneNumber);
    const parsedNumber = parsePhoneNumberFromString(initialFormatted, 'TR');

    if (parsedNumber && parsedNumber.isValid()) {
        return parsedNumber.number.replace('+', '');
    }

    return null;
}

// String prototype'larýna eklenen fonksiyonlar
String.prototype.isValid = function () {
    return formatPhoneNumber(this) !== null;
};

String.prototype.toJid = function () {
    const formattedNumber = formatPhoneNumber(this);

    if (!formattedNumber) {
        return null;
    }

    return `${formattedNumber}@s.whatsapp.net`;
};

String.prototype.formatNumber = function (format) {
    const formattedNumber = formatPhoneNumber(this);

    if (!formattedNumber) {
        return null;
    }

    let formattedOutput = '';
    let formatIndex = 0;

    for (let i = 0; i < formattedNumber.length && formatIndex < format.length; i++) {
        if (format[formatIndex] === 'x') {
            formattedOutput += formattedNumber[i];
        } else {
            formattedOutput += format[formatIndex];
            i--;
        }
        formatIndex++;
    }

    return formattedOutput;
};

module.exports = {
    initialFormatPhoneNumber,
    formatPhoneNumber
};
