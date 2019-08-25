/**
 * Créditos
 */
export interface Credit {
    id?                 : string;   // ID Autmatico
    totalAmount         : number;   // Monto total del crédito
    numberFees          : number;   // Numero total de cutoas
    profitPercentage    : number;   // Porcentaje de Ganancia
    billingFrequency    : string;   // Frecuencia de cobro
    state               : string;   // Estado del credito
    feesPaid            : number;   // Nro. de cuotas pagadas
    outstandingFess     : number;   // Nro. de cuotas pendientes
    balance             : number;   // Saldo total
    createdAt           : string;   // Fecha de realización del crédito
}