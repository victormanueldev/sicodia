/**
 * Créditos
 */
export interface Credit {
    id?                  : string;   // {ANIOMESDIA - ID CLIENTE} 
    totalAmount?         : number;   // Monto total del crédito
    feesTotalAmount?     : number;   // Valor total de la cuota
    numberFees?          : number;   // Numero total de cutoas
    profitPercentage?    : number;   // Porcentaje de Ganancia
    billingFrequency?    : string;   // Frecuencia de cobro
    state?               : string;   // Estado del credito (PENDIENTE, APROBADO, ACREDITATO, RECHAZADO, PAGADO)
    feesPaid?            : number;   // Nro. de cuotas pagadas
    feesNotPaid?         : number;   // Nro. de cuotas no pagadas
    outstandingFees?     : number;   // Nro. de cuotas pendientes
    balance?             : number;   // Saldo total
    createdAt?           : string;   // Fecha de realización del crédito
    acreditedAt?         : string;   // Fecha de acreditacion
    idClient?            : string;   // Nro. de cédula del cliente
    fullNameClient?      : string;   // Nombre completo del cliente
}