/**
 * Usuarios
 */
export interface User {
    id?         : string;
    email?      : string;
    role?       : string;  //admin, collector
    name?       : string;
    token?      : string;
    company?    : string;   // Nombre de la empresa 
    idCompany?  : number;   // ID de la empresa ** Inicia en 1 ***
    createdAt?  : string;
    routeNumber?: number;
}

/**
 * Credenciales
 * Admin 1: juliandrp23@gmail.com - 135790
 * Admin 2: victormalsx@gmail.com - 3103195394sax
 * Cobrador: vmarenas36@misena.edu.co - 135790
 */