/**
 * Renovaciones
 */
export interface Renewal {
    id?         : string; 
    totalAmount : number;    // Monto solicitado
    requestDate : string;    // Fecha de solicitud  
    cid         : string;    // Identificacion del cliente
    requestUid  : string;    // ID del usuario que la solicitó
    approvalUid : string;   //ID del usuario que aprobó
}