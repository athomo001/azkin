// Azkin — Autor: Athan Espinoza (GitHub: athomo001)
export interface RequestEnrollmentInput {
  remoteUrl: string;
  token: string;
  callerCertPem: string;
  callerLabel: string;
  callerUrl: string;
}

export interface RequestEnrollmentResult {
  ownCertPem: string;
}

/**
 * Puerto (interfaz) para el llamado saliente que hace esta instancia hacia el `/federation/enrollments`
 * de la instancia remota al unirse a una federación (JoinFederationUseCase).
 */
export interface IFederationClient {
  requestEnrollment(input: RequestEnrollmentInput): Promise<RequestEnrollmentResult>;
}
