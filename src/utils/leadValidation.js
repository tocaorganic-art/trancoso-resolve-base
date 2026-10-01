export function normalizeLeadName(value = '') {
  return value.trim().replace(/\s+/g, ' ').slice(0, 120);
}

export function normalizePhone(value = '') {
  return value.replace(/\D/g, '').slice(0, 11);
}

export function isValidBrazilianPhone(value = '') {
  const digits = normalizePhone(value);
  return digits.length === 10 || digits.length === 11;
}

export function buildPublicLeadPayload({
  name,
  phone,
  email,
  message,
  serviceInterest,
  location,
  source,
  type = 'cliente',
  consent,
  website = '',
}) {
  return {
    name: normalizeLeadName(name),
    phone: normalizePhone(phone),
    email: email?.trim().toLowerCase() || undefined,
    message: message?.trim().slice(0, 1000) || undefined,
    service_interest: serviceInterest?.trim().slice(0, 120) || undefined,
    ...(location?.trim() ? { location: location.trim().slice(0, 120) } : {}),
    source: source?.trim().slice(0, 120) || 'site',
    type: type === 'prestador' ? 'prestador' : 'cliente',
    consent: consent === true,
    website,
  };
}
