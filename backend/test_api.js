
import fetch from 'node-fetch'; // In older node versions, or standard fetch in Node 18+
// Si node-fetch no está disponible, usaremos el fetch nativo.
// Para asegurar compatibilidad, escribiré esto usando el fetch global (Node 18+)

const BASE_URL = 'http://localhost:3000/api';
let AUTH_TOKEN = '';

// Colores para consola
const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m"
};

const log = (msg, color = colors.reset) => console.log(`${color}${msg}${colors.reset}`);

async function runTest(name, fn) {
    log(`\n▶ Ejecutando: ${name}...`, colors.cyan);
    try {
        await fn();
        log(`✓ ${name}: ÉXITO`, colors.green);
        return true;
    } catch (error) {
        log(`✗ ${name}: FALLÓ - ${error.message}`, colors.red);
        if (error.response) {
            console.error(error.response);
        }
        return false;
    }
}

async function request(endpoint, method = 'GET', body = null, requireAuth = false) {
    const headers = {
        'Content-Type': 'application/json'
    };
    if (requireAuth) {
        if (!AUTH_TOKEN) throw new Error("No hay token de autenticación");
        headers['Authorization'] = `Bearer ${AUTH_TOKEN}`;
    }

    const options = {
        method,
        headers,
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await res.json();

    if (!res.ok) {
        throw new Error(`Status ${res.status}: ${data.message || JSON.stringify(data)}`);
    }

    return data;
}

async function startTests() {
    log("🚀 Iniciando Test Suite Eiken 3FN", colors.yellow);

    // 1. Login
    await runTest("Login Admin", async () => {
        const data = await request('/auth/login', 'POST', {
            email: "admin@eikendesign.cl",
            password: "admin2025"
        });
        if (!data.token) throw new Error("No se recibió token");
        AUTH_TOKEN = data.token;
        log("  → Token recibido correctamente");
    });

    // 2. Crear Orden Invitado (Critical 3NF Test)
    await runTest("Crear Orden (Guest Checkout - 3NF)", async () => {
        const orderData = {
            clientName: "Test Auto Script",
            clientEmail: `auto_${Date.now()}@test.com`, // Email único
            items: [
                {
                    serviceId: 1,
                    quantity: 1,
                    unitPrice: 450000
                }
            ],
            totalAmount: 450000
        };
        const data = await request('/orders', 'POST', orderData);
        if (!data.id && !data.data?.id) throw new Error("No se creó la orden");
        log(`  → Orden creada ID: ${data.id || data.data.id}`);
    });

    // 3. Obtener todas las órdenes
    await runTest("Listar Órdenes (Admin)", async () => {
        const data = await request('/orders', 'GET', null, true);
        if (!Array.isArray(data.data) && !Array.isArray(data)) throw new Error("Formato de respuesta inválido");
        log(`  → Se obtuvieron ${data.data?.length || data.length} órdenes`);
    });

    // 4. Crear Cotización Pública
    let quoteId = null;
    await runTest("Crear Cotización Pública", async () => {
        const quoteData = {
            clientName: "Quote Tester",
            clientEmail: "quote_test@script.com",
            description: "Cotización de prueba desde script",
            categoryId: 1
        };
        const data = await request('/quotes/public', 'POST', quoteData);
        quoteId = data.id || data.data?.id;
        if (!quoteId) throw new Error("No se creó la cotización");
        log(`  → Cotización ID: ${quoteId}`);
    });

    // 5. Responder Cotización
    if (quoteId) {
        await runTest("Responder Cotización (Admin)", async () => {
            await request(`/quotes/${quoteId}/reply`, 'POST', {
                amount: 500000,
                message: "Propuesta automática del script"
            }, true);
            log("  → Respuesta enviada");
        });
    }

    // 6. Crear Preferencia de Pago
    await runTest("Crear Preferencia MercadoPago", async () => {
        const prefData = {
            clientName: "Payment Tester",
            clientEmail: "pay@script.com",
            items: [
                {
                    productId: 1,
                    quantity: 1,
                    unitPrice: 10000,
                    name: "Test Item"
                }
            ],
            notes: "Test desde script node"
        };
        const data = await request('/payments/create-preference', 'POST', prefData);
        if (!data.data?.preferenceId && !data.data?.id) throw new Error("No se devolvió ID de preferencia");
        log(`  → Preferencia MP ID: ${data.data?.preferenceId || data.data?.id}`);
    });

    log("\n✨ ¡Todas las pruebas finalizaron! Revisa los resultados arriba.", colors.cyan);
}

startTests();
