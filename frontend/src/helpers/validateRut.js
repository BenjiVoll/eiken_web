export function formatRut(rut) {
  if (!rut) return '';
  // Eliminar puntos y guion, dejar solo dígitos y K/k
  rut = rut.replace(/\./g, '').replace(/-/g, '').replace(/[^\dkK]/gi, '').toUpperCase();
  if (rut.length < 2) return rut;
  let cuerpo = rut.slice(0, -1);
  let dv = rut.slice(-1);
  // Formatear cuerpo con puntos cada 3 dígitos desde la derecha
  cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${cuerpo}-${dv}`;
}
export function validateRut(rut) {
  if (!rut) return false;
  rut = rut.replace(/\./g, '').replace(/-/g, '');
  if (rut.length < 2) return false;

  const cuerpo = rut.slice(0, -1);
  let dv = rut.slice(-1).toUpperCase();

  if (!/^\d+$/.test(cuerpo) || !/^[0-9K]$/.test(dv)) return false;

  let suma = 0, multiplo = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i]) * multiplo;
    multiplo = multiplo < 7 ? multiplo + 1 : 2;
  }
  let dvEsperado = 11 - (suma % 11);
  dvEsperado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();

  return dv === dvEsperado;
}
