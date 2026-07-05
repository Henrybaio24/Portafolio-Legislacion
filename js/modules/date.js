export function actualizarFecha() {
    const el = document.getElementById('fecha-actual');
    if (!el) return; // por seguridad, si aún no existe el elemento
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const anio = hoy.getFullYear();
    el.textContent = `${dia}-${mes}-${anio}`;
}