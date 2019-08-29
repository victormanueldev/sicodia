/**
 * Créditos
 */
export interface Credit {
    id?                  : string;   // ID Autmatico
    totalAmount?         : number;   // Monto total del crédito
    feesTotalAmount?     : number;   // Valor total de la cuota
    numberFees?          : number;   // Numero total de cutoas
    profitPercentage?    : number;   // Porcentaje de Ganancia
    billingFrequency?    : string;   // Frecuencia de cobro
    state?               : string;   // Estado del credito (PENDIENTE, APROBADO, ACREDITATO, RECHAZADO, PAGADO)
    feesPaid?            : number;   // Nro. de cuotas pagadas
    outstandingFees?     : number;   // Nro. de cuotas pendientes
    balance?             : number;   // Saldo total
    createdAt?           : string;   // Fecha de realización del crédito
    idClient?            : string;   // Nro. de cédula del cliente
    fullNameClient?      : string;   // Nombre completo del cliente
}